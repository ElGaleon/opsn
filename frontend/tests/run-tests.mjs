import { mkdir } from "node:fs/promises";
import { build } from "esbuild";

await mkdir("dist-tests", { recursive: true });
await build({
  entryPoints: ["tests/dashboardMetrics.test.ts"],
  outfile: "dist-tests/dashboardMetrics.test.mjs",
  bundle: true,
  format: "esm",
  platform: "node",
  alias: {
    "@app": "./src/app",
    "@features": "./src/features",
    "@shared": "./src/shared",
  },
});

await import("../dist-tests/dashboardMetrics.test.mjs");
