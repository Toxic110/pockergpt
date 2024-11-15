import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "https://toxic110.github.io/pockergpt/",
  plugins: [react()],
});
