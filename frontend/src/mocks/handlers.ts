/**
 * MSW 요청 핸들러 모음
 *
 * 테스트에서 백엔드 API를 모킹합니다.
 * 기본 응답은 "성공" 시나리오이며,
 * 개별 테스트에서 server.use()로 오버라이드하여 실패 시나리오를 테스트할 수 있습니다.
 */
import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:8080";

export const handlers = [
  // ─── 로그인 ────────────────────────────────────────────────
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 테스트용: 특정 이메일/비밀번호 조합만 성공
    if (body.email === "test@example.com" && body.password === "Password1!") {
      return HttpResponse.json({
        message: "로그인 성공",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        grantType: "Bearer",
      });
    }

    // 그 외는 401 에러
    return HttpResponse.json(
      { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 }
    );
  }),

  // ─── 회원가입 ──────────────────────────────────────────────
  http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; nickname: string };

    // 중복 이메일 시뮬레이션
    if (body.email === "duplicate@example.com") {
      return HttpResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 409 }
      );
    }

    // 중복 닉네임 시뮬레이션
    if (body.nickname === "중복닉네임") {
      return HttpResponse.json(
        { message: "이미 사용 중인 닉네임입니다." },
        { status: 409 }
      );
    }

    return HttpResponse.json({
      message: "회원가입 성공",
      userId: 1,
    });
  }),

  // ─── 이메일 인증코드 발송 ──────────────────────────────────
  http.post(`${BASE_URL}/emails/send`, async () => {
    return HttpResponse.json({
      success: true,
      message: "인증코드가 발송되었습니다.",
    });
  }),

  // ─── 이메일 인증코드 확인 ──────────────────────────────────
  http.post(`${BASE_URL}/emails/verify`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };

    // 테스트용: "123456"만 성공
    if (body.code === "123456") {
      return HttpResponse.json({
        success: true,
        message: "이메일 인증이 완료되었습니다.",
      });
    }

    return HttpResponse.json(
      { message: "인증코드가 올바르지 않습니다." },
      { status: 400 }
    );
  }),
];
