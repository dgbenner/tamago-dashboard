import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
// The published site lives at dgbenner.github.io/tamago-dashboard/. The dev server stays at the root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/tamago-dashboard/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
}))
