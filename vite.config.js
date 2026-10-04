import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function spaRoutesPlugin() {
  return {
    name: 'spa-routes-fallback',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist')
      const indexHtmlPath = path.join(distDir, 'index.html')

      if (fs.existsSync(indexHtmlPath)) {
        const indexHtml = fs.readFileSync(indexHtmlPath, 'utf-8')

        // 1. Create dist/404.html for GitHub Pages universal SPA fallback
        fs.writeFileSync(path.join(distDir, '404.html'), indexHtml)

        // 2. Pre-generate physical directory index.html files for direct route URLs
        const routes = ['analytics', 'analytics/overview']
        routes.forEach((route) => {
          const routeDir = path.join(distDir, route)
          fs.mkdirSync(routeDir, { recursive: true })
          fs.writeFileSync(path.join(routeDir, 'index.html'), indexHtml)
        })
      }
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), spaRoutesPlugin()],
  base: '/',
})

