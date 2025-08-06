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
    proxy: {
      '/api': 'http://localhost:8000', // or your backend port
    }
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
