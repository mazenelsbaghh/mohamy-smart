/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    visualizer({ filename: 'dist/bundle-report.html', gzipSize: true, brotliSize: true }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          pdf: ['pdfjs-dist'],
          excel: ['xlsx'],
          motion: ['framer-motion'],
          calendar: ['@fullcalendar/core', '@fullcalendar/react', '@fullcalendar/daygrid', '@fullcalendar/interaction'],
          heroui: ['@heroui/react'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5078,
    strictPort: true,
    watch: {
      usePolling: true,
    },
    hmr: {
      clientPort: 5078,
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
})
