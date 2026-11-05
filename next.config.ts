import type { NextConfig } from "next";

const invoiceAssets = [
  "./public/logo-with-name.svg",
  "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-400-normal.woff",
  "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-arabic-700-normal.woff",
  "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-latin-400-normal.woff",
  "./node_modules/@fontsource/noto-sans-arabic/files/noto-sans-arabic-latin-700-normal.woff",
];

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  outputFileTracingIncludes: {
    "/api/orders": invoiceAssets,
    "/api/orders/*/invoice": invoiceAssets,
    "/api/admin/orders/*/invoice-email": invoiceAssets,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
