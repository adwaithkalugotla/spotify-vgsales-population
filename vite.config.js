import { defineConfig } from "vite";
import { resolve } from "path";

// NOTE: Vite does not need BROWSER env vars for deployment.
// Keeping config clean helps avoid platform-specific behavior.

export default defineConfig({
  base: "/", // correct for Vercel root deployment
  build: {
    rollupOptions: {
      // Multi-page inputs: add every HTML entry you want copied to dist/
      input: {
        dashboard: resolve(__dirname, "index.html"),

        // Charts (adjust these paths if your files are named differently)
        histogram: resolve(__dirname, "histogram/index.html"),
        pie_chart: resolve(__dirname, "pie_chart/index.html"),
        scatterplot: resolve(__dirname, "scatterplot/index.html"),
        stacked_bar_chart: resolve(__dirname, "stacked_bar_chart/index.html"),
      },
    },
    assetsDir: "assets",
  },
  server: {
    port: 3000,
    open: true,
    hmr: {
      overlay: true,
    },
  },
});
