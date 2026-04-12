import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In production we serve from https://<user>.github.io/Plex/, so the base
// path must match the repo name. In dev we keep it at root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/Plex/' : '/',
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',
  },
}))
