/// <reference types="vitest" />

import legacy from '@vitejs/plugin-legacy'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy()
  ],
  build: {
    rollupOptions: {
      output: {
        // separa as libs grandes em chunks próprios: entre releases o vendor não
        // muda → o navegador reusa do cache (só o código do app é rebaixado).
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          if (id.includes('@ionic') || id.includes('ionicons')) return 'ionic';
          if (id.includes('framer-motion')) return 'motion';
          if (id.includes('@supabase')) return 'supabase';
          if (id.includes('/react') || id.includes('react-dom') || id.includes('react-router')) return 'react';
          return 'vendor';
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
