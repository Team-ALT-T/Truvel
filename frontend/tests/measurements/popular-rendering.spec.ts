import {
  expect,
  test,
  type Page,
  type Request,
  type Response,
} from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Test1234!";
const PHASE = process.env.MEASUREMENT_PHASE ?? "before";
const RUN_COUNT = 5;

type ApiResponseMetric = {
  path: "/countries" | "/cities";
  status: number;
  bodyBytes: number;
};

type RunResult = {
  run: number;
  cityListVisibleMs: number;
  cityListInteractiveMs: number;
  browserDataApiRequests: number;
  corsPreflightRequests: number;
  apiResponseBodyBytes: number;
  locationApiTransferBytes: number;
  popularRscTransferBytes: number;
  transitionTransferBytes: number;
  apiResponses: ApiResponseMetric[];
  initialRscContainsCityData: boolean;
};

function isLocationApiRequest(request: Request) {
  const pathname = new URL(request.url()).pathname;
  return pathname === "/countries" || pathname === "/cities";
}

function isPopularRscResponse(response: Response) {
  const url = new URL(response.url());
  return url.pathname === "/my-trips/popular" && url.searchParams.has("_rsc");
}

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }

  return sorted[middle];
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/auth/success", { timeout: 15_000 });
}

test.describe("popular rendering measurement", () => {
  test("measures five isolated navigations", async ({ browser }) => {
    test.setTimeout(180_000);

    if (PHASE !== "before" && PHASE !== "after") {
      throw new Error("MEASUREMENT_PHASE must be either 'before' or 'after'.");
    }

    const runs: RunResult[] = [];

    for (let run = 1; run <= RUN_COUNT; run += 1) {
      const context = await browser.newContext({
        baseURL: BASE_URL,
        viewport: { width: 406, height: 661 },
        locale: "ko-KR",
        serviceWorkers: "block",
      });
      const page = await context.newPage();
      const cdp = await context.newCDPSession(page);

      await cdp.send("Network.enable");
      await cdp.send("Network.setCacheDisabled", { cacheDisabled: true });

      try {
        await login(page);
        await page.goto(`${BASE_URL}/my-trips`);

        const registerButton = page.getByRole("button", {
          name: "여행 등록하기",
          exact: true,
        });
        await expect(registerButton).toBeVisible({ timeout: 15_000 });

        let browserDataApiRequests = 0;
        let corsPreflightRequests = 0;
        let initialRscContainsCityData = false;
        let measurementStarted = false;
        let locationApiTransferBytes = 0;
        let popularRscTransferBytes = 0;
        let transitionTransferBytes = 0;
        const apiResponses: ApiResponseMetric[] = [];
        const responseReads: Promise<void>[] = [];
        const trackedRequests = new Map<
          string,
          { isLocationApiGet: boolean; isPopularRsc: boolean }
        >();

        page.on("request", (request) => {
          if (!isLocationApiRequest(request)) return;

          if (request.method() === "GET") {
            browserDataApiRequests += 1;
          }
        });

        cdp.on("Network.requestWillBeSent", ({ requestId, request }) => {
          if (!measurementStarted) return;

          const url = new URL(request.url);
          const pathname = url.pathname;
          const isLocationApi =
            pathname === "/countries" || pathname === "/cities";
          const isLocationApiGet = isLocationApi && request.method === "GET";
          const isPopularRsc =
            pathname === "/my-trips/popular" && url.searchParams.has("_rsc");

          trackedRequests.set(requestId, {
            isLocationApiGet,
            isPopularRsc,
          });

          if (isLocationApi && request.method === "OPTIONS") {
            corsPreflightRequests += 1;
          }
        });

        cdp.on(
          "Network.loadingFinished",
          ({ requestId, encodedDataLength }) => {
            const trackedRequest = trackedRequests.get(requestId);
            if (!trackedRequest) return;

            transitionTransferBytes += encodedDataLength;

            if (trackedRequest.isLocationApiGet) {
              locationApiTransferBytes += encodedDataLength;
            }

            if (trackedRequest.isPopularRsc) {
              popularRscTransferBytes += encodedDataLength;
            }

            trackedRequests.delete(requestId);
          },
        );

        page.on("response", (response) => {
          const request = response.request();

          if (isLocationApiRequest(request) && request.method() === "GET") {
            responseReads.push(
              response
                .body()
                .then((body) => {
                  const pathname = new URL(response.url()).pathname as
                    | "/countries"
                    | "/cities";
                  apiResponses.push({
                    path: pathname,
                    status: response.status(),
                    bodyBytes: body.byteLength,
                  });
                })
                .catch(() => {
                  // A failed body read is recorded as zero bytes while the request count remains valid.
                  const pathname = new URL(response.url()).pathname as
                    | "/countries"
                    | "/cities";
                  apiResponses.push({
                    path: pathname,
                    status: response.status(),
                    bodyBytes: 0,
                  });
                }),
            );
          }

          if (isPopularRscResponse(response)) {
            responseReads.push(
              response
                .text()
                .then((body) => {
                  initialRscContainsCityData =
                    body.includes("cityId") ||
                    body.includes("countryId") ||
                    body.includes("koreanName");
                })
                .catch(() => {
                  initialRscContainsCityData = false;
                }),
            );
          }
        });

        measurementStarted = true;
        const startedAt = performance.now();
        await registerButton.click();
        await page.waitForURL("**/my-trips/popular", { timeout: 15_000 });

        const firstSelectButton = page
          .getByRole("button", { name: "선택", exact: true })
          .first();
        await expect(firstSelectButton).toBeVisible({ timeout: 15_000 });
        const cityListVisibleMs = performance.now() - startedAt;

        await firstSelectButton.click();
        await expect(
          page.getByRole("button", { name: "선택 완료", exact: true }),
        ).toBeVisible({ timeout: 10_000 });
        const cityListInteractiveMs = performance.now() - startedAt;

        await page
          .waitForLoadState("networkidle", { timeout: 5_000 })
          .catch(() => {});
        await Promise.all(responseReads);

        runs.push({
          run,
          cityListVisibleMs: Math.round(cityListVisibleMs * 10) / 10,
          cityListInteractiveMs: Math.round(cityListInteractiveMs * 10) / 10,
          browserDataApiRequests,
          corsPreflightRequests,
          apiResponseBodyBytes: apiResponses.reduce(
            (total, response) => total + response.bodyBytes,
            0,
          ),
          locationApiTransferBytes: Math.round(locationApiTransferBytes),
          popularRscTransferBytes: Math.round(popularRscTransferBytes),
          transitionTransferBytes: Math.round(transitionTransferBytes),
          apiResponses: apiResponses.sort((a, b) =>
            a.path.localeCompare(b.path),
          ),
          initialRscContainsCityData,
        });
      } finally {
        await context.close();
      }
    }

    const output = {
      phase: PHASE,
      measuredAt: new Date().toISOString(),
      commitSha: execFileSync("git", ["rev-parse", "HEAD"], {
        cwd: process.cwd(),
        encoding: "utf8",
      }).trim(),
      environment: {
        baseURL: BASE_URL,
        viewport: { width: 406, height: 661 },
        browserCacheDisabled: true,
        networkThrottling: "none",
        runCount: RUN_COUNT,
      },
      summary: {
        medianCityListVisibleMs:
          Math.round(median(runs.map((run) => run.cityListVisibleMs)) * 10) /
          10,
        medianCityListInteractiveMs:
          Math.round(
            median(runs.map((run) => run.cityListInteractiveMs)) * 10,
          ) / 10,
        medianBrowserDataApiRequests: median(
          runs.map((run) => run.browserDataApiRequests),
        ),
        medianCorsPreflightRequests: median(
          runs.map((run) => run.corsPreflightRequests),
        ),
        medianApiResponseBodyBytes: median(
          runs.map((run) => run.apiResponseBodyBytes),
        ),
        medianLocationApiTransferBytes: median(
          runs.map((run) => run.locationApiTransferBytes),
        ),
        medianPopularRscTransferBytes: median(
          runs.map((run) => run.popularRscTransferBytes),
        ),
        medianTransitionTransferBytes: median(
          runs.map((run) => run.transitionTransferBytes),
        ),
        initialRscContainsCityData: runs.every(
          (run) => run.initialRscContainsCityData,
        ),
      },
      runs,
    };

    const outputDirectory = path.resolve(process.cwd(), "..", "docs", PHASE);
    const outputPath = path.join(outputDirectory, "popular-rendering.json");

    await mkdir(outputDirectory, { recursive: true });
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`Measurement written to ${outputPath}`);
    console.log(JSON.stringify(output.summary, null, 2));

    expect(runs).toHaveLength(RUN_COUNT);
  });
});
