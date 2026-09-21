/// <reference types="vite-plugin-electron/electron-env" />

import type { TocaeApi } from '@shared/ipc'

declare global {
  interface Window {
    tocae: TocaeApi
  }
}