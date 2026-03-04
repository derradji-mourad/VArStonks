import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import pythonVarPlugin from "./vite-plugin-python-var";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), pythonVarPlugin()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
