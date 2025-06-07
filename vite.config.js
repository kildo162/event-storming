import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vite.dev/config/
export default defineConfig({
  base: '/event-storming/',
  plugins: [react(), tsconfigPaths()],
  server: {
    hmr: {
      overlay: true,
      log: 'info',
    },
    watch: {
      usePolling: true,
    }
  },
})
