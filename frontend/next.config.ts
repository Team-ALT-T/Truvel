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
  reactStrictMode: false, // React 19 호환성을 위해 비활성화
}

export default nextConfig
