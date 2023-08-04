/** @type {import('next').NextConfig} */
const nextConfig = {
    output: "standalone",
    async rewrites() {
        return {
            fallback: [
                {
                    source: "/assets/:path*",
                    destination: `${process.env.DOMAIN_ASSETS_STORA}/assets/:path*`
                },
            ],
        }
    }
}

module.exports = nextConfig
