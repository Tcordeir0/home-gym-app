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
  // NOTA: vendor split via manualChunks foi REVERTIDO — separar Ionic/React em chunks
  // próprios quebrava a ordem de init (TDZ: "Cannot access 'j' before initialization"
  // no chunk ionic) por dependência circular entre as libs. O code-splitting por PÁGINA
  // (React.lazy em MainTabs) é seguro e continua valendo. Vendor fica junto no bundle.
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  }
})
