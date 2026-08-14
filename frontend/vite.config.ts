import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

const envDir = path.resolve(__dirname, "..");

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, envDir, "");
  const allowedHost = (env.ALLOWED_HOST ?? "localhost:5173")
    .replace(/^https?:\/\//, "")
    .split(":")[0];

  return {
    envDir,
    plugins: [react()],
    resolve: {
      alias: {
        "@app": path.resolve(__dirname, "src/app"),
        "@features": path.resolve(__dirname, "src/features"),
        "@shared": path.resolve(__dirname, "src/shared"),
      },
    },
    server: {
      host: "0.0.0.0",
      port: 5173,
      allowedHosts: [allowedHost, "localhost"],
      proxy: {
        "/api": {
          target: "http://localhost:8000",
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
