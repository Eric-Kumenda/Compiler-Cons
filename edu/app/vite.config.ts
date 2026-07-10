import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      "7f5b-102-135-170-93.ngrok-free.app",
      "4df4-102-135-170-100.ngrok-free.app"
    ],
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
