/** @type {import('next').NextConfig} */
const nextConfig = {
  // standalone output is needed for Docker (copies only required files)
  output: "standalone",
};

module.exports = nextConfig;
