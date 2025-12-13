import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
    ],
    server: {
        port: 5173,
        headers: {
            "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
            "Cross-Origin-Embedder-Policy": "unsafe-none",
        },
        proxy: {
            '/api': {
                target: 'https://localhost:8443',
                changeOrigin: true,
                secure: false
            },
            '/ws': {
                target: 'https://localhost:8443',
                ws: true,
                secure: false
            }
        }
    },
    define: {
        'global': 'globalThis'
    }
})