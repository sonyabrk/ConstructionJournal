import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://ecxrmp-128-71-101-249.ru.tuna.am',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/authhh')
      }
    }
  }
})
