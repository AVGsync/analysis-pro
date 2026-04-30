import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiTarget = process.env.VITE_API_URL || 'http://localhost:8080'

function stripSecureCookieFlag(proxyRes) {
  const cookies = proxyRes.headers['set-cookie']
  if (!cookies) return
  proxyRes.headers['set-cookie'] = cookies.map(cookie =>
    cookie
      .replace(/;\s*Secure/gi, '')
      .replace(/;\s*SameSite=[^;]*/gi, '; SameSite=Strict')
  )
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
        configure(proxy) {
          proxy.on('proxyRes', stripSecureCookieFlag)
        },
      },
    },
  },
})
