/// <reference types="vite/client" />
// client/vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // 👈 new port so it won’t clash with Sakhi
  },
})
