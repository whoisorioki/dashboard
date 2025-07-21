import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Ensure you have the correct adapters installed
    },
  },
  server: {
    port: 5173,
    // Add proxy if needed for API requests
  },
  optimizeDeps: {
    include: [
      "@tanstack/query-sync-storage-persister",
      "@tanstack/react-query-persist-client",
      "@emotion/react",
      "@emotion/styled",
      "@mui/material/Tooltip",
    ],
  },
});
