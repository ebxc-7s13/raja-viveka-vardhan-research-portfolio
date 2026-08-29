/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production';

const path = require('path');

const nextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias['@'] = path.resolve(__dirname, 'src');
    return config;
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        // Prevent browsers from MIME-sniffing responses
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        // Block all framing (clickjacking protection)
        { key: 'X-Frame-Options', value: 'DENY' },
        // XSS filter (legacy but harmless)
        { key: 'X-XSS-Protection', value: '1; mode=block' },
        // Control referrer information leakage
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        // Restrict browser features
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()' },
        // Strict Content Security Policy
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            // Production: no unsafe-eval; dev: allow it for Next.js HMR
            isProd
              ? "script-src 'self' 'unsafe-inline'"
              : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            // Only allow images from self, data URIs, and HTTPS sources
            "img-src 'self' data: https:",
            // Fonts from self and data URIs only
            "font-src 'self' data:",
            // Only allow API calls to self
            "connect-src 'self'",
            // Block all iframe embedding
            "frame-ancestors 'none'",
            // Restrict base tag injection
            "base-uri 'self'",
            // Forms can only submit to self
            "form-action 'self'",
            // Block object/embed tags
            "object-src 'none'",
            // Block plugin content
            "plugin-types 'none'",
          ].join('; '),
        },
        // HSTS — force HTTPS for 2 years, include subdomains, enable preload
        {
          key: 'Strict-Transport-Security',
          value: 'max-age=63072000; includeSubDomains; preload',
        },
        // Prevent DNS prefetching leaks
        { key: 'X-DNS-Prefetch-Control', value: 'off' },
      ],
    },
  ],
};

module.exports = nextConfig;
