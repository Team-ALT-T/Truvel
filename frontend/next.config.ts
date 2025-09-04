/** @type {import('next').NextConfig} */
const nextConfig = {
  compiler: {
    styledComponents: true, // ✅ 이거 꼭 추가해야 babel-plugin-styled-components 작동함
  },
  reactStrictMode: true,
}

export default nextConfig
