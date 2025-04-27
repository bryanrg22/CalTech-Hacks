import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // anything that starts with /api → http://127.0.0.1:5050
      "/api": "http://127.0.0.1:5050",
    },
  },
})
