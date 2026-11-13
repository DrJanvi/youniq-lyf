import type { NextConfig } from "next";

const invoiceAssets = [
  "./public/logo-with-name.svg",
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
