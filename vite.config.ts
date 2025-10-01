import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import type { ProxyOptions } from 'vite'

const proxyOptions: ProxyOptions = {
  target: 'http://89.208.14.230:8080',
  changeOrigin: true,
  secure: false,
  rewrite: (path) => path.replace(/^\/api/, '')
}

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': proxyOptions
    }
  }
})