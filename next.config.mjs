/** @type {import('next').NextConfig} */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "/quest";

const nextConfig = {
  output: "standalone",
  basePath,
  reactStrictMode: true,
};

export default nextConfig;
