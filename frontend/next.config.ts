/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  eslint: {
    // CI 안정화를 위해 lint는 별도 단계에서만 수행
    ignoreDuringBuilds: true,
  },
  // Vercel: 모노레포의 backend 폴더는 trace 대상에서 제외
  // (outputFileTracingRoot를 repo 루트로 올리면 backend까지 스캔 범위가 넓어질 수 있음)
  outputFileTracingExcludes: {
    '*': ['../backend/**', '../backend'],
  },
  reactStrictMode: false, // React 19 호환성을 위해 비활성화
}

export default nextConfig
