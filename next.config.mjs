/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Keep the pg driver out of the server bundle so its optional native deps
  // (pg-native, cloudflare:sockets) don't trip the bundler. pg is only used by
  // the live data layer, which is dynamically imported and server-only.
  experimental: {
    serverComponentsExternalPackages: ["pg"],
  },
};

export default nextConfig;
