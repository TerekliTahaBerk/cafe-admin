import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabase = supabaseUrl ? new URL(supabaseUrl) : null;
const isLocalSupabase =
  !!supabase && ["localhost", "127.0.0.1"].includes(supabase.hostname);

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      supabase
        ? {
            protocol: supabase.protocol.replace(":", "") as "http" | "https",
            hostname: supabase.hostname,
            port: supabase.port,
            pathname: "/storage/v1/object/public/**",
          }
        : {
            protocol: "https",
            hostname: "*.supabase.co",
            pathname: "/storage/v1/object/public/**",
          },
    ],
    // Local Supabase (supabase start) serves storage from 127.0.0.1.
    dangerouslyAllowLocalIP: isLocalSupabase,
  },
  experimental: {
    serverActions: {
      // Images are re-encoded client-side before upload, but the server still
      // accepts up to 5 MB (plus multipart overhead) as a hard limit.
      bodySizeLimit: "6mb",
    },
  },
};

export default nextConfig;
