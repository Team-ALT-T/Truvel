/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: {
      displayName: true,
      ssr: true,
    },
  },
  reactStrictMode: false, // React 19 호환성을 위해 비활성화
}

export default nextConfig
