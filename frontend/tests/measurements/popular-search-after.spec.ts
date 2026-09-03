import { expect, test, type Page, type Request } from "@playwright/test";
import { execFileSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { performance } from "node:perf_hooks";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const TEST_EMAIL = process.env.E2E_TEST_EMAIL ?? "test@example.com";
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD ?? "Test1234!";
const SEARCH_KEYWORD = process.env.SEARCH_KEYWORD ?? "도쿄";
const RUN_COUNT = 5;

type RunResult = {
  run: number;
  searchResultVisibleMs: number;
  searchResultInteractiveMs: number;
  browserSpringApiRequests: number;
  corsPreflightRequests: number;
  searchRscTransferBytes: number;
  searchTransitionTransferBytes: number;
  urlChanged: boolean;
  initialRscContainsSearchData: boolean;
};

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.floor(sorted.length / 2)];
}

function roundMs(value: number) {
  return Math.round(value * 10) / 10;
}

function isSpringRequest(request: Request) {
  return new URL(request.url()).origin === "http://localhost:8080";
}

async function login(page: Page) {
  await page.goto(`${BASE_URL}/auth/login`);
  await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인", exact: true }).click();
  await page.waitForURL("**/auth/success", { timeout: 15_000 });
}

test.describe("popular dynamic SSR search after measurement", () => {
  test("measures five isolated URL searches", async ({ browser }) => {
    test.setTimeout(240_000);

    const runs: RunResult[] = [];
    let reloadRestoresSearch = false;
    let directSearchUrlAvailable = false;
    let backNavigationRestoresSearch = false;
    let selectedCitiesSurviveSearchFlow = false;
    let scheduleFlowWorks = false;
    let initialHtmlContainsSearchData = false;
    let searchPageNoindexFollow = false;
    const outputDirectory = path.resolve(process.cwd(), "..", "docs", "after");
    await mkdir(outputDirectory, { recursive: true });

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
        await page.goto(`${BASE_URL}/my-trips/popular`);
        const searchInput = page.getByPlaceholder("어디로 떠나시나요?");
        await expect(searchInput).toBeVisible({ timeout: 15_000 });
        await page.waitForLoadState("networkidle", { timeout: 10_000 });

        if (run === RUN_COUNT) {
          await page.getByText("오사카", { exact: true }).first().click();
          await expect(
            page.getByRole("button", { name: "오사카 선택 해제" }),
          ).toBeVisible();
        }

        await searchInput.fill(SEARCH_KEYWORD);

        let measurementStarted = false;
        let browserSpringApiRequests = 0;
        let corsPreflightRequests = 0;
        let searchRscTransferBytes = 0;
        let searchTransitionTransferBytes = 0;
        let initialRscContainsSearchData = false;
        const trackedRequests = new Set<string>();

        page.on("request", (request) => {
          if (!measurementStarted) return;
          if (!isSpringRequest(request)) return;
          browserSpringApiRequests += 1;
          if (request.method() === "OPTIONS") corsPreflightRequests += 1;
        });

        cdp.on("Network.requestWillBeSent", ({ requestId }) => {
          if (!measurementStarted) return;
          trackedRequests.add(requestId);
        });

        cdp.on(
          "Network.loadingFinished",
          ({ requestId, encodedDataLength }) => {
            if (!trackedRequests.has(requestId)) return;
            searchTransitionTransferBytes += encodedDataLength;
            trackedRequests.delete(requestId);
          },
        );

        const initialUrl = page.url();
        const rscResponsePromise = page.waitForResponse((response) => {
          const url = new URL(response.url());
          return (
            url.pathname.startsWith("/my-trips/popular/search") &&
            response.request().resourceType() === "fetch"
          );
        });
        measurementStarted = true;
        const startedAt = performance.now();
        await searchInput.press("Enter");
        await rscResponsePromise;
        await expect(page).toHaveURL(/\/my-trips\/popular\/search\?keyword=/);

        const result = page.getByTestId("search-results");
        await expect(result).toContainText("도쿄", { timeout: 15_000 });
        initialRscContainsSearchData =
          (await result.textContent())?.includes("도쿄") ?? false;
        const searchResultVisibleMs = performance.now() - startedAt;

        await result
          .getByRole("button", { name: "선택", exact: true })
          .first()
          .click();
        await expect(
          page.getByRole("button", { name: "선택 완료", exact: true }),
        ).toBeVisible();
        const searchResultInteractiveMs = performance.now() - startedAt;

        await page
          .waitForLoadState("networkidle", { timeout: 5_000 })
          .catch(() => undefined);
        searchRscTransferBytes = await page.evaluate(() => {
          const entries = window.performance
            .getEntriesByType("resource")
            .filter(
              (entry): entry is PerformanceResourceTiming =>
                entry instanceof PerformanceResourceTiming &&
                entry.name.includes("/my-trips/popular/search") &&
                entry.name.includes("_rsc="),
            );
          const entry = entries.at(-1);
          return entry
            ? entry.transferSize ||
                entry.encodedBodySize ||
                entry.decodedBodySize
            : 0;
        });
        measurementStarted = false;

        runs.push({
          run,
          searchResultVisibleMs: roundMs(searchResultVisibleMs),
          searchResultInteractiveMs: roundMs(searchResultInteractiveMs),
          browserSpringApiRequests,
          corsPreflightRequests,
          searchRscTransferBytes: Math.round(searchRscTransferBytes),
          searchTransitionTransferBytes: Math.round(
            searchTransitionTransferBytes,
          ),
          urlChanged: page.url() !== initialUrl,
          initialRscContainsSearchData,
        });

        if (run === RUN_COUNT) {
          const searchUrl = page.url();
          const directResponse = await context.request.get(searchUrl);
          const directHtml = await directResponse.text();
          initialHtmlContainsSearchData =
            directHtml.includes(SEARCH_KEYWORD) && directHtml.includes("Tokyo");
          searchPageNoindexFollow =
            directHtml.includes("noindex") && directHtml.includes("follow");

          await page.reload();
          await expect(
            page.getByRole("textbox", { name: "여행지 검색어" }),
          ).toHaveValue(SEARCH_KEYWORD);
          await expect(page.getByTestId("search-results")).toContainText(
            "도쿄",
          );
          await expect(
            page.getByRole("button", { name: "오사카 선택 해제" }),
          ).toBeVisible();
          await expect(
            page.getByRole("button", { name: "도쿄 선택 해제" }),
          ).toBeVisible();
          reloadRestoresSearch = true;

          await page.goto(searchUrl);
          directSearchUrlAvailable =
            (await page.getByTestId("search-results").count()) === 1;

          await page
            .getByRole("textbox", { name: "여행지 검색어" })
            .fill("오사카");
          await page
            .getByRole("textbox", { name: "여행지 검색어" })
            .press("Enter");
          await expect(page).toHaveURL(/keyword=%EC%98%A4%EC%82%AC%EC%B9%B4/);
          await page.goBack();
          await expect(page).toHaveURL(searchUrl);
          await expect(
            page.getByRole("textbox", { name: "여행지 검색어" }),
          ).toHaveValue(SEARCH_KEYWORD);
          backNavigationRestoresSearch = true;

          selectedCitiesSurviveSearchFlow =
            (await page.getByRole("button", { name: /선택 해제$/ }).count()) ===
            2;
          await page
            .getByRole("button", { name: "선택 완료", exact: true })
            .click();
          await expect(page).toHaveURL(/\/schedule$/);
          scheduleFlowWorks = await page.evaluate(() => {
            const stored = sessionStorage.getItem("selectedCities");
            if (!stored) return false;
            const cities = JSON.parse(stored) as Array<{ cityId: number }>;
            return (
              cities.some(({ cityId }) => cityId === 1) &&
              cities.some(({ cityId }) => cityId === 2)
            );
          });
        }
      } finally {
        await context.close();
      }
    }

    const output = {
      phase: "after-dynamic-ssr-search",
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
        searchConditionStorage: "URL search params",
        urlChangedAfterSearch: runs.every((run) => run.urlChanged),
        reloadRestoresSearch,
        directSearchUrlAvailable,
        backNavigationRestoresSearch,
        selectedCitiesSurviveSearchFlow,
        scheduleFlowWorks,
        initialHtmlContainsSearchData,
        searchPageNoindexFollow,
        initialRscContainsRequestSpecificSearchData: runs.every(
          (run) => run.initialRscContainsSearchData,
        ),
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
        "Spring /public/cities is called by the Next server, so it is absent from browser network traffic.",
      ],
    };

    const outputPath = path.join(
      outputDirectory,
      "popular-search-rendering.json",
    );
    await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

    console.log(`Measurement written to ${outputPath}`);
    console.log(JSON.stringify(output.summary, null, 2));

    expect(runs).toHaveLength(RUN_COUNT);
    expect(runs.every((run) => run.browserSpringApiRequests === 0)).toBe(true);
    expect(runs.every((run) => run.corsPreflightRequests === 0)).toBe(true);
    expect(runs.every((run) => run.initialRscContainsSearchData)).toBe(true);
    expect(reloadRestoresSearch).toBe(true);
    expect(directSearchUrlAvailable).toBe(true);
    expect(backNavigationRestoresSearch).toBe(true);
    expect(selectedCitiesSurviveSearchFlow).toBe(true);
    expect(scheduleFlowWorks).toBe(true);
    expect(initialHtmlContainsSearchData).toBe(true);
    expect(searchPageNoindexFollow).toBe(true);
  });
});
