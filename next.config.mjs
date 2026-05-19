/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Allow larger upload bodies to pass through Next.js middleware/proxy layer.
    // Default is 10MB which can cause ECONNRESET/socket hang up during proxying.
    middlewareClientMaxBodySize: "50mb",
  },
  async rewrites() {
    const gatewayBase = process.env.GATEWAY_BASE_URL || "http://127.0.0.1:8001";
    const coreBase = process.env.CORE_BASE_URL || "http://127.0.0.1:8000";
    return [
      // Auth routes go directly to the Common Gateway Service.
      {
        source: "/api/:path(signup|login|session|logout)",
        destination: `${gatewayBase}/api/:path`,
      },
      {
        source: "/api/:path*",
        destination: `${coreBase}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
