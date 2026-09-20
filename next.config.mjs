/** @type {import('next').NextConfig} */
const securityHeaders = [
  {
    key: "X-DNS-Prefetch-Control",
    value: "on",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://www.googletagmanager.com https://*.google-analytics.com https://*.google.com https://*.googleadservices.com https://*.doubleclick.net https://connect.facebook.net https://*.facebook.net https://analytics.tiktok.com https://*.tiktok.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://vercel.live",
      "font-src 'self' https://fonts.gstatic.com data: https://vercel.live https://assets.vercel.com",
      "img-src 'self' data: blob: https: https://images.unsplash.com https://*.supabase.co https://*.supabase.in https://m.media-amazon.com https://images-na.ssl-images-amazon.com https://vercel.live https://vercel.com https://www.facebook.com https://analytics.tiktok.com",
      "media-src 'self' data: blob:",
      "connect-src 'self' https: wss: https://*.supabase.co https://*.supabase.in wss://*.supabase.co https://generativelanguage.googleapis.com https://vercel.live wss://ws-us3.pusher.com",
      "worker-src 'self' blob:",
      "frame-ancestors 'self'",
      "frame-src 'self' https://vercel.live https://www.facebook.com https://*.facebook.com https://*.doubleclick.net",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
      {
        protocol: "https",
        hostname: "*.supabase.in",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "cdn.fourthwall.com",
      },
      {
        protocol: "https",
        hostname: "*.fourthwall.com",
      },
      {
        protocol: "https",
        hostname: "*.fourthwall.dev",
      },
      {
        protocol: "https",
        hostname: "*.linksynergy.com",
      },
      {
        protocol: "https",
        hostname: "images.amazon.com",
      },
      {
        protocol: "https",
        hostname: "ws-na.amazon-adsystem.com",
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
