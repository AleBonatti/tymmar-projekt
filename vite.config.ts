import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: { "@": path.resolve(__dirname, "src") },
    },
    server: {
        proxy: {
            // inoltra tutte le chiamate /api → http://localhost:3000
            "/api": "http://localhost:3000",
        },
    },
});
