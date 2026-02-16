import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright E2E 테스트 설정
 *
 * 실행 전 필요:
 *   1. Docker 백엔드 실행 (docker-compose up)
 *   2. Next.js dev 서버 실행 (npm run dev)
 *   3. npx playwright test
 */
export default defineConfig({
  testDir: "./tests",

  /* 테스트 타임아웃: 각 테스트당 30초 */
  timeout: 30_000,

  /* 단언(expect) 타임아웃: 요소가 나타날 때까지 최대 10초 대기 */
  expect: {
    timeout: 10_000,
  },

  /* 테스트 파일 병렬 실행 */
  fullyParallel: true,

  /* CI에서 .only 남겨두면 실패 */
  forbidOnly: !!process.env.CI,

  /* 실패 시 재시도: CI에서만 1회 */
  retries: process.env.CI ? 1 : 0,

  /* 리포터: 콘솔 목록 + HTML 리포트 */
  reporter: [["list"], ["html", { open: "never" }]],

  /* 모든 프로젝트 공통 설정 */
  use: {
    baseURL: "http://localhost:3000",

    /* 스크린샷: 실패 시에만 */
    screenshot: "only-on-failure",

    /* 트레이스: 실패 시 첫 재시도에서 수집 */
    trace: "on-first-retry",

    /* 비디오: 실패 시에만 */
    video: "retain-on-failure",
  },

  /* Chromium만 사용 (E2E는 하나로 충분) */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
