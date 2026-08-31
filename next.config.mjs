/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        // Page documents (everything except the hashed, immutable build assets):
        // force browsers to revalidate so a new deploy shows up immediately
        // instead of serving a stale cached app bundle.
        source: "/((?!_next/static/|_next/image).*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
