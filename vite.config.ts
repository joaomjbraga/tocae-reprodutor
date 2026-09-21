import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'

const aliases = {
  '@': path.resolve(import.meta.dirname, 'src'),
  '@shared': path.resolve(import.meta.dirname, 'shared'),
}

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        vite: { resolve: { alias: aliases } },
      },
      preload: {
        input: path.join(import.meta.dirname, 'electron/preload.ts'),
        vite: { resolve: { alias: aliases } },
      },
    }),
  ],
  resolve: { alias: aliases },
})