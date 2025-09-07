// vite.config.mjs
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,        // listen on all network interfaces
    port: 3000,        // set a fixed port
    strictPort: true,  // fail if the port is already in use
  },
})
