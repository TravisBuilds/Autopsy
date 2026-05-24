import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/** Pin Turbopack root so dev does not crawl parent iCloud / Mobile Documents folders. */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  reactCompiler: true,
  turbopack: {
    root: projectRoot,
  },
  // Persistent Turbopack cache grows unbounded in long dev sessions and loads into heap.
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
};

export default nextConfig;
