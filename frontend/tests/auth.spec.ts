import { test, expect } from "@playwright/test";

/**
 * ┌─────────────────────────────────────────────────┐
 * │  시나리오 1: 로그인 → 여행 목록 확인             │
 * │                                                  │
 * │  플로우:                                         │
 * │  /auth/login → 로그인 → /auth/success            │
 * │  → "홈 화면으로" 클릭 → /my-trips                │
 * └─────────────────────────────────────────────────┘
 *
 * ⚠️ Docker 백엔드가 실행 중이어야 합니다.
 * ⚠️ 아래 계정이 DB에 등록되어 있어야 합니다.
 */

// ─── 테스트 계정 (Docker DB에 등록된 실제 계정) ─────
const TEST_EMAIL = "every0520@naver.com";
const TEST_PASSWORD = "a123@123";

test.describe("시나리오 1: 로그인 → 여행 목록", () => {
  test("로그인 성공 → 성공 페이지 → 여행 목록 확인", async ({ page }) => {
    // 1. 로그인 페이지 이동
    await page.goto("/auth/login");
    await expect(page.getByText("Truvel과 함께")).toBeVisible();

    // 2. 이메일/비밀번호 입력
    await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
    await page.getByPlaceholder("비밀번호를 입력해주세요").fill(TEST_PASSWORD);

    // 3. 로그인 버튼이 활성화되었는지 확인 후 클릭
    const loginBtn = page.getByRole("button", { name: "로그인" });
    await expect(loginBtn).toBeEnabled();
    await loginBtn.click();

    // 4. /auth/success 페이지로 이동 확인
    await page.waitForURL("**/auth/success", { timeout: 10_000 });
    await expect(page.getByText("회원가입,로그인이 완료되었어요!")).toBeVisible();

    // 5. "홈 화면으로" 버튼 클릭 → /my-trips 이동
    await page.getByRole("button", { name: "홈 화면으로" }).click();
    await page.waitForURL("**/my-trips", { timeout: 10_000 });

    // 6. 여행 목록 페이지가 정상 로드되었는지 확인
    await expect(page.getByText("내 여행")).toBeVisible();
    await expect(page.getByText("여행 등록하기")).toBeVisible();
  });

  test("잘못된 비밀번호 → 에러 메시지 표시", async ({ page }) => {
    await page.goto("/auth/login");

    // 틀린 비밀번호 입력
    await page.getByPlaceholder("example@mtr.com").fill(TEST_EMAIL);
    await page
      .getByPlaceholder("비밀번호를 입력해주세요")
      .fill("WrongPassword!");

    await page.getByRole("button", { name: "로그인" }).click();

    // 에러 메시지 확인 (URL은 login에 머물러야 함)
    await expect(
      page.getByText("이메일 또는 비밀번호가 올바르지 않습니다.")
    ).toBeVisible({ timeout: 5_000 });
    expect(page.url()).toContain("/auth/login");
  });

  test("이메일 미입력 → 로그인 버튼 비활성화", async ({ page }) => {
    await page.goto("/auth/login");

    // 비밀번호만 입력
    await page
      .getByPlaceholder("비밀번호를 입력해주세요")
      .fill("Test1234!");

    // 로그인 버튼이 비활성화 상태
    await expect(
      page.getByRole("button", { name: "로그인" })
    ).toBeDisabled();
  });
});
