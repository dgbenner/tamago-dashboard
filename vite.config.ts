import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// The published site lives at dgbenner.github.io/tamago-dashboard/. The dev server stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tamago-dashboard/' : '/',
  // Its own port, so it never lands on Tamago's dev server (5173) or the other way round.
  server: { port: 5180, strictPort: true },
  // Two pages: the metrics dashboard (index.html) and the standalone System Card (system-card.html), not part of the dashboard.
  build: { rollupOptions: { input: { main: path.resolve(import.meta.dirname, 'index.html'), systemCard: path.resolve(import.meta.dirname, 'system-card.html') } } },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
