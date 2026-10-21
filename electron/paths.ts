import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { translate } from '@shared/i18n'
import type { Locale } from '@shared/i18n'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const RENDERER_DIST = path.join(APP_ROOT, 'dist')

export const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(APP_ROOT, 'public')
  : RENDERER_DIST

export const ICON_PATH = path.join(
  VITE_PUBLIC,
  os.platform() === 'win32' ? 'icon.ico' : 'icon.png',
)
export const PRELOAD_PATH = path.join(__dirname, 'preload.mjs')

export const APP_TITLE = 'Tocaê Reprodutor'
export const DESKTOP_FILE_NAME = process.env['FLATPAK_ID']
  ? `${process.env['FLATPAK_ID']}.desktop`
  : 'tocae-reprodutor.desktop'

/** Títulos das janelas auxiliares, que dependem do idioma em uso. */
export function aboutTitle(locale: Locale): string {
  return translate(locale, 'window.about')
}

export function shortcutsTitle(locale: Locale): string {
  return translate(locale, 'window.shortcuts')
}