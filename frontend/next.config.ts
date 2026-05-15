import path from 'path'

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
  // Vercel에서 모노레포 backend 폴더까지 추적하지 않도록 제한
  outputFileTracingRoot: path.join(__dirname, '..'),
  outputFileTracingExcludes: {
    '*': ['../backend/**'],
  },
  reactStrictMode: false, // React 19 호환성을 위해 비활성화
}

export default nextConfig
