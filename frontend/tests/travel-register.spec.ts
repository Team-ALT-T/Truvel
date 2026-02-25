import { test, expect } from "@playwright/test";

/**
 * ┌─────────────────────────────────────────────────────────────┐
 * │  시나리오 2: 여행 등록 전체 플로우                            │
 * │                                                              │
 * │  /auth/login → 로그인                                        │
 * │  → /my-trips → "여행 등록하기"                               │
 * │  → /my-trips/popular → 도시 선택 → "선택 완료"              │
 * │  → /schedule → 날짜 선택 → "선택 완료"                      │
 * │  → /optimize/route → 시간 확인 → "다음"                     │
 * │  → /optimize/places → 장소 추가 → "추천 경로 만들기"        │
 * │  → /optimize/result → 경로 확인 → "다음"                    │
 * │  → /optimize/check-result → "일정 등록하기"                  │
 * │  → /my-trips (등록 완료)                                     │
 * └─────────────────────────────────────────────────────────────┘
 *
 * ⚠️ Docker 백엔드 + Next.js dev 서버가 실행 중이어야 합니다.
 * ⚠️ 테스트 계정이 DB에 등록되어 있어야 합니다.
 */

// ─── 테스트 계정 ─────────────────────────────────────
const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "Test1234!";

// ─── 로그인 헬퍼 ─────────────────────────────────────
async function login(page: any) {
  await page.goto("/auth/login");
  await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
  await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);
  await page.getByRole("button", { name: "로그인" }).click();
  await page.waitForURL("**/auth/success", { timeout: 10_000 });
  await page.getByRole("button", { name: "홈 화면으로" }).click();
  await page.waitForURL("**/my-trips", { timeout: 10_000 });
}

const TEST_PLACES = [
  {
    name: "센소지",
    address: "2 Chome-3-1 Asakusa, Taito City, Tokyo",
    latitude: 35.7148,
    longitude: 139.7967,
    rating: 4.5,
    reviewCount: 1200,
    types: ["tourist_attraction"],
    photoReference: null,
    image: "/icons/blank.png",
  },
  {
    name: "도쿄 타워",
    address: "4 Chome-2-8 Shibakoen, Minato City, Tokyo",
    latitude: 35.6586,
    longitude: 139.7454,
    rating: 4.3,
    reviewCount: 800,
    types: ["tourist_attraction"],
    photoReference: null,
    image: "/icons/blank.png",
  },
];

test.describe("시나리오 2: 여행 등록 전체 플로우", () => {
  test("도시 선택 → 날짜 → 시간 → 장소 → 경로 확인 → 일정 등록", async ({
    page,
  }) => {
    test.setTimeout(60_000);

    // 모든 dialog(alert/confirm)를 자동 수락 + 메시지 기록
    const dialogMessages: string[] = [];
    page.on("dialog", async (dialog) => {
      dialogMessages.push(dialog.message());
      await dialog.accept();
    });

    // ═══════════════════════════════════════════════
    // Step 1: 로그인
    // ═══════════════════════════════════════════════
    await login(page);
    await expect(page.getByText("내 여행")).toBeVisible();

    // ═══════════════════════════════════════════════
    // Step 2: "여행 등록하기" → /my-trips/popular
    // ═══════════════════════════════════════════════
    await page.getByText("여행 등록하기").click();
    await page.waitForURL("**/popular", { timeout: 10_000 });

    // ═══════════════════════════════════════════════
    // Step 3: 도시 선택 (API에서 로드된 실제 도시)
    // ═══════════════════════════════════════════════
    await page.getByText("해외 여행지").waitFor({ timeout: 10_000 });

    const selectButtons = page.getByText("선택", { exact: true });
    await selectButtons.first().click();

    await page.getByText("선택 완료").click();
    await page.waitForURL("**/schedule", { timeout: 10_000 });

    // ═══════════════════════════════════════════════
    // Step 4: 날짜 선택 (다음 달로 이동 후 선택)
    // ═══════════════════════════════════════════════
    // 다음 달로 이동하면 항상 미래 날짜 + 이전 테스트와 충돌 방지
    const nextMonthBtn = page.locator('button[aria-label="다음 달"]').or(
      page.getByRole("button", { name: /다음|>|›|next/i }).first()
    );

    // 달력에서 다음 달 버튼 찾기
    const calendarNextBtn = page.locator(
      'button:has(img[alt="next"]), button:has(img[alt="다음"])'
    );
    if (await calendarNextBtn.isVisible()) {
      await calendarNextBtn.click();
      await page.waitForTimeout(500);
    }

    const day10 = page.getByText("25", { exact: true }).first();
    await day10.click();

    const day11 = page.getByText("26", { exact: true }).first();
    await day11.click();

    await page.getByText("선택 완료").click();
    await page.waitForURL("**/my-trips/map", { timeout: 10_000 });

    // ═══════════════════════════════════════════════
    // Step 5: /optimize/route로 이동 (시간 설정)
    // ═══════════════════════════════════════════════
    await page.goto("/optimize/route");

    await expect(page.getByText("전체 경로 최적화")).toBeVisible();
    await page.getByRole("button", { name: "다음" }).click();

    // ═══════════════════════════════════════════════
    // Step 6: /optimize/places (장소 추가)
    // ═══════════════════════════════════════════════
    await page.waitForURL("**/optimize/places", { timeout: 10_000 });

    await page.evaluate((places) => {
      sessionStorage.setItem("selectedPlaces", JSON.stringify(places));
    }, TEST_PLACES);

    await page.reload();
    await expect(page.getByText("가고싶은 장소 추가")).toBeVisible();

    await page.getByText("추천 경로 만들기").click();

    await page.waitForURL("**/optimize/result", { timeout: 15_000 });

    // ═══════════════════════════════════════════════
    // Step 7: /optimize/result (경로 확인)
    // ═══════════════════════════════════════════════
    await expect(page.getByText("Day 1")).toBeVisible();

    await page.getByRole("button", { name: "다음", exact: true }).click();
    await page.waitForURL("**/check-result", { timeout: 10_000 });

    // ═══════════════════════════════════════════════
    // Step 8: /optimize/check-result (일정 등록)
    // ═══════════════════════════════════════════════
    await expect(page.getByText("센소지")).toBeVisible();
    await expect(page.getByText("도쿄 타워")).toBeVisible();

    await page.getByText("일정 등록하기").click();

    // /my-trips로 이동 확인 (API 호출 + 등록 완료)
    try {
      await page.waitForURL("**/my-trips", { timeout: 30_000 });
    } catch {
      throw new Error(
        `일정 등록 후 /my-trips 이동 실패.\n` +
          `현재 URL: ${page.url()}\n` +
          `Dialog 메시지: [${dialogMessages.join(" | ")}]`
      );
    }
    await expect(page.getByText("내 여행")).toBeVisible();
  });
});
