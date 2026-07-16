import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://16.192.149.204:8080/api/:path*',
      },
    ]
  },
}

export default nextConfig