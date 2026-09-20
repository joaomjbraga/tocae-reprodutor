import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(import.meta.dirname, 'electron/preload.ts'),
      },
    })],
})
