import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // tsconfig.json의 "@/*" → "./src/*" 경로 별칭을 Vitest에서도 동일하게 사용
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    // jsdom: 브라우저 DOM을 Node.js에서 시뮬레이션
    environment: "jsdom",
    // describe, it, expect 등을 import 없이 전역으로 사용
    globals: true,
    // 모든 테스트 파일 실행 전에 setup.ts를 먼저 로드
    setupFiles: ["./src/test/setup.ts"],
    // CSS import 시 에러 방지
    css: true,
    // Playwright E2E 스펙(frontend/tests/*.spec.ts)은 Vitest 대상에서 제외
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/**", "node_modules/**", "dist/**", ".next/**"],
  },
});
