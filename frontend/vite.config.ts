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
    port: 3000,
    host: '0.0.0.0',
    // Fix HMR configuration for Docker development
    hmr: {
      host: 'localhost',
      port: 3000
    },
    // Allow requests from Docker containers
    cors: true,
    // Allow all hosts for Docker development
    allowedHosts: true,
    proxy: {
      '/api': 'http://localhost:8000', // Use localhost for development
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
