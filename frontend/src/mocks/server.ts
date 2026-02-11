/**
 * 테스트 전용 MSW 서버
 * 
 * Node.js 환경(Vitest)에서 HTTP 요청을 가로채서
 * handlers.ts에 정의된 응답을 반환합니다.
 * 
 * 사용법 (통합 테스트 파일에서):
 *   import { server } from "@/mocks/server";
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */
import { setupServer } from "msw/node";
import { handlers } from "./handlers";

export const server = setupServer(...handlers);
