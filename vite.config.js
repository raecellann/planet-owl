import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    open: false,
    watch: {
      // The repo-root `assets/` holds the raw source art. Watching it makes the
      // dev server crash with EBUSY while new exports are still being written.
      //
      // Anchored to that one directory on purpose. As a bare `**/assets/**`
      // glob this also matched `public/assets/**`, and because Vite caches the
      // public-directory listing at boot and only refreshes it from watcher
      // events, anything `npm run assets` wrote while the server was up was
      // invisible to it — every new file fell through to the SPA fallback and
      // rendered as a broken image until the server was restarted.
      ignored: [fileURLToPath(new URL('./assets/**', import.meta.url))],
    },
  },
})
