import {
  expect,
  test,
  type Page,
  type Request,
  type Response,
} from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Test1234!";
const SEARCH_KEYWORD = process.env.SEARCH_KEYWORD ?? "도쿄";
const RUN_COUNT = 5;

type ApiResponseMetric = {
  path: string;
  status: number;
  bodyBytes: number;
};

type RunResult = {
  run: number;
  searchResultVisibleMs: number;
  searchResultInteractiveMs: number;
  browserSpringApiRequests: number;
  corsPreflightRequests: number;
  apiResponseBodyBytes: number;
  springApiTransferBytes: number;
  searchRscTransferBytes: number;
  searchTransitionTransferBytes: number;
  urlChanged: boolean;
  apiResponses: ApiResponseMetric[];
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
}

function roundMs(value: number) {
  return Math.round(value * 10) / 10;
}

async function sanitizeHar(harPath: string) {
  const har = JSON.parse(await readFile(harPath, "utf8")) as {
    log?: {
      entries?: Array<{
        request?: {
          headers?: Array<{ name: string; value: string }>;
          cookies?: unknown[];
        };
      }>;
    };
  };

  for (const entry of har.log?.entries ?? []) {
    if (!entry.request) continue;

    entry.request.headers = (entry.request.headers ?? []).filter(
      ({ name }) =>
        name.toLowerCase() !== "authorization" &&
        name.toLowerCase() !== "cookie",
    );
    entry.request.cookies = [];
  }

  await writeFile(harPath, `${JSON.stringify(har, null, 2)}\n`, "utf8");
}

function isAuthenticatedCitySearch(request: Request) {
  const url = new URL(request.url());
  return (
    url.origin === "http://localhost:8080" &&
    url.pathname === "/cities" &&
    url.searchParams.get("keyword") === SEARCH_KEYWORD
  );
}

function isSearchRscResponse(response: Response) {
  const url = new URL(response.url());
  return (
    url.origin === BASE_URL &&
    url.pathname === "/my-trips/popular" &&
    url.searchParams.has("_rsc")
  );
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/auth/success", { timeout: 15_000 });
}

test.describe("popular client search before measurement", () => {
  test("measures five isolated client searches", async ({ browser }) => {
    test.setTimeout(180_000);

    const runs: RunResult[] = [];
    let reloadLosesSearch = false;
    const outputDirectory = path.resolve(process.cwd(), "..", "docs", "before");
    await mkdir(outputDirectory, { recursive: true });

    for (let run = 1; run <= RUN_COUNT; run += 1) {
      const context = await browser.newContext({
        baseURL: BASE_URL,
        viewport: { width: 406, height: 661 },
        locale: "ko-KR",
        serviceWorkers: "block",
        recordHar:
          run === RUN_COUNT
            ? {
                path: path.join(
                  outputDirectory,
                  "network-popular-search-before.har",
                ),
                content: "embed",
                mode: "full",
                urlFilter: /localhost:8080\/cities/,
              }
            : undefined,
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);

      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

      try {
        await login(page);
        await page.goto(`${BASE_URL}/my-trips/popular`);

        const searchInput = page.getByPlaceholder("어디로 떠나시나요?");
        await expect(searchInput).toBeVisible({ timeout: 15_000 });
        await page.waitForLoadState("networkidle", { timeout: 10_000 });
        await searchInput.fill(SEARCH_KEYWORD);

        let measurementStarted = false;
        let browserSpringApiRequests = 0;
        let corsPreflightRequests = 0;
        let springApiTransferBytes = 0;
        let searchRscTransferBytes = 0;
        let searchTransitionTransferBytes = 0;
        const apiResponses: ApiResponseMetric[] = [];
        const responseReads: Promise<void>[] = [];
        const trackedRequests = new Map<
          string,
          { isSpringSearch: boolean; isSearchRsc: boolean }
        >();

        page.on("request", (request) => {
          if (
            measurementStarted &&
            request.method() === "GET" &&
            isAuthenticatedCitySearch(request)
          ) {
            browserSpringApiRequests += 1;
          }
        });

        page.on("response", (response) => {
          const request = response.request();

          if (
            measurementStarted &&
            request.method() === "GET" &&
            isAuthenticatedCitySearch(request)
          ) {
            responseReads.push(
              response
                .body()
                .then((body) => {
                  apiResponses.push({
                    path: `${new URL(response.url()).pathname}?keyword=${SEARCH_KEYWORD}`,
                    status: response.status(),
                    bodyBytes: body.byteLength,
                  });
                })
                .catch(() => {
                  apiResponses.push({
                    path: `${new URL(response.url()).pathname}?keyword=${SEARCH_KEYWORD}`,
                    status: response.status(),
                    bodyBytes: 0,
                  });
                }),
            );
          }

          if (measurementStarted && isSearchRscResponse(response)) {
            responseReads.push(response.finished().then(() => undefined));
          }
        });

        cdp.on("Network.requestWillBeSent", ({ requestId, request }) => {
          if (!measurementStarted) return;

          const url = new URL(request.url);
          const isSpringSearch =
            url.origin === "http://localhost:8080" &&
            url.pathname === "/cities" &&
            url.searchParams.get("keyword") === SEARCH_KEYWORD;
          const isSearchRsc =
            url.origin === BASE_URL &&
            url.pathname === "/my-trips/popular" &&
            url.searchParams.has("_rsc");

          trackedRequests.set(requestId, { isSpringSearch, isSearchRsc });

          if (isSpringSearch && request.method === "OPTIONS") {
            corsPreflightRequests += 1;
          }
        });

        cdp.on(
          "Network.loadingFinished",
          ({ requestId, encodedDataLength }) => {
            const tracked = trackedRequests.get(requestId);
            if (!tracked) return;

            searchTransitionTransferBytes += encodedDataLength;
            if (tracked.isSpringSearch) {
              springApiTransferBytes += encodedDataLength;
            }
            if (tracked.isSearchRsc) {
              searchRscTransferBytes += encodedDataLength;
            }
            trackedRequests.delete(requestId);
          },
        );

        const initialUrl = page.url();
        measurementStarted = true;
        const startedAt = performance.now();
        await searchInput.press("Enter");

        const selectButtons = page.getByRole("button", {
          name: "선택",
          exact: true,
        });
        await expect(selectButtons).toHaveCount(1, { timeout: 15_000 });
        const searchResultVisibleMs = performance.now() - startedAt;

        await selectButtons.first().click();
        await expect(
          page.getByRole("button", { name: "선택 완료", exact: true }),
        ).toBeVisible({ timeout: 10_000 });
        const searchResultInteractiveMs = performance.now() - startedAt;

        await page
          .waitForLoadState("networkidle", { timeout: 5_000 })
          .catch(() => {});
        await Promise.all(responseReads);
        measurementStarted = false;

        runs.push({
          run,
          searchResultVisibleMs: roundMs(searchResultVisibleMs),
          searchResultInteractiveMs: roundMs(searchResultInteractiveMs),
          browserSpringApiRequests,
          corsPreflightRequests,
          apiResponseBodyBytes: apiResponses.reduce(
            (total, response) => total + response.bodyBytes,
            0,
          ),
          springApiTransferBytes: Math.round(springApiTransferBytes),
          searchRscTransferBytes: Math.round(searchRscTransferBytes),
          searchTransitionTransferBytes: Math.round(
            searchTransitionTransferBytes,
          ),
          urlChanged: page.url() !== initialUrl,
          apiResponses,
        });

        if (run === RUN_COUNT) {
          await page.reload();
          await expect(searchInput).toHaveValue("");
          reloadLosesSearch = (await selectButtons.count()) > 1;
        }
      } finally {
        await context.close();
      }
    }

    const output = {
      phase: "before-client-search",
      measuredAt: new Date().toISOString(),
      commitSha: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: process.cwd(),
        encoding: "utf8",
      }).trim(),
      environment: {
        baseURL: BASE_URL,
        backendURL: "http://localhost:8080",
        viewport: { width: 406, height: 661 },
        browserCacheDisabled: true,
        networkThrottling: "none",
        runCount: RUN_COUNT,
        searchKeyword: SEARCH_KEYWORD,
        mode: "production",
      },
      behavior: {
        searchConditionStorage: "component-state",
        urlChangedAfterSearch: runs.some((run) => run.urlChanged),
        reloadLosesSearch,
        directSearchUrlAvailable: false,
        initialRscContainsRequestSpecificSearchData: false,
      },
      summary: {
        medianSearchResultVisibleMs: roundMs(
          median(runs.map((run) => run.searchResultVisibleMs)),
        ),
        medianSearchResultInteractiveMs: roundMs(
          median(runs.map((run) => run.searchResultInteractiveMs)),
        ),
        medianBrowserSpringApiRequests: median(
          runs.map((run) => run.browserSpringApiRequests),
        ),
        medianCorsPreflightRequests: median(
          runs.map((run) => run.corsPreflightRequests),
        ),
        medianApiResponseBodyBytes: median(
          runs.map((run) => run.apiResponseBodyBytes),
        ),
        medianSpringApiTransferBytes: median(
          runs.map((run) => run.springApiTransferBytes),
        ),
        medianSearchRscTransferBytes: median(
          runs.map((run) => run.searchRscTransferBytes),
        ),
        medianSearchTransitionTransferBytes: median(
          runs.map((run) => run.searchTransitionTransferBytes),
        ),
      },
      runs,
      notes: [
        "Timing starts immediately before pressing Enter and ends at result visibility/verified selection interaction.",
        "Login, initial ISR page load, and typing are excluded from search timing and transfer totals.",
        "The legacy authenticated GET /cities search increments local Redis popularity once per run.",
      ],
    };

    const outputPath = path.join(
      outputDirectory,
      "popular-search-rendering.json",
    );
    const harPath = path.join(
      outputDirectory,
      "network-popular-search-before.har",
    );

    await sanitizeHar(harPath);
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`Measurement written to ${outputPath}`);
    console.log(JSON.stringify(output.summary, null, 2));

    expect(runs).toHaveLength(RUN_COUNT);
    expect(runs.every((run) => run.browserSpringApiRequests === 1)).toBe(true);
    expect(runs.every((run) => run.urlChanged === false)).toBe(true);
    expect(reloadLosesSearch).toBe(true);
  });
});
