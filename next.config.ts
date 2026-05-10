import type { NextConfig } from "next";

const wfdPdfTracingIncludes = [
  "./node_modules/pdf-parse/dist/worker/pdf.worker.mjs",
  "./node_modules/pdf-parse/dist/worker/**/*",
  "./node_modules/pdf-parse/dist/pdf-parse/**/*",
  "./node_modules/pdfjs-dist/legacy/build/pdf.worker.mjs",
  "./node_modules/pdfjs-dist/legacy/build/pdf.mjs",
  "./node_modules/@napi-rs/canvas/**/*",
  "./node_modules/@napi-rs/canvas-linux-x64-gnu/**/*",
  "./node_modules/@napi-rs/canvas-linux-x64-musl/**/*",
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  outputFileTracingIncludes: {
    "/api/wfd": wfdPdfTracingIncludes,
    "/api/cron/sync-wfd": wfdPdfTracingIncludes,
  },
};

export default nextConfig;
