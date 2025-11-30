import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./RSVP/",
  server: {
    host: "::",
    port: 8080,
    // Proxy API calls to backend running on port 5000 during development so cookies are same-origin
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
