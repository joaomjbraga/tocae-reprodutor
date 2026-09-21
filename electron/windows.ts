import { BrowserWindow } from 'electron'
import path from 'node:path'
import {
  ABOUT_TITLE,
  APP_TITLE,
  ICON_PATH,
  PRELOAD_PATH,
  RENDERER_DIST,
  SHORTCUTS_TITLE,
  VITE_DEV_SERVER_URL,
} from './paths'

let mainWindow: BrowserWindow | null = null
let aboutWindow: BrowserWindow | null = null
let shortcutsWindow: BrowserWindow | null = null

export function getMainWindow(): BrowserWindow | null {
  return mainWindow
}

export function createMainWindow(): BrowserWindow {
  mainWindow = new BrowserWindow({
    title: APP_TITLE,
    width: 960,
    height: 600,
    minWidth: 480,
    minHeight: 320,
    backgroundColor: '#101014',
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      devTools: false,
    },
  })

  mainWindow.once('ready-to-show', () => mainWindow?.show())
  mainWindow.on('closed', () => { mainWindow = null })

  loadRenderer(mainWindow)
  return mainWindow
}

export function createAboutWindow(): void {
  if (aboutWindow) {
    aboutWindow.focus()
    return
  }

  aboutWindow = new BrowserWindow({
    title: ABOUT_TITLE,
    width: 420,
    height: 340,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: mainWindow ?? undefined,
    backgroundColor: '#101014',
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  aboutWindow.removeMenu()
  aboutWindow.once('ready-to-show', () => aboutWindow?.show())
  aboutWindow.on('closed', () => { aboutWindow = null })

  loadRenderer(aboutWindow, { hash: 'about' })
}

export function createShortcutsWindow(): void {
  if (shortcutsWindow) {
    shortcutsWindow.focus()
    return
  }

  shortcutsWindow = new BrowserWindow({
    title: SHORTCUTS_TITLE,
    width: 380,
    height: 320,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: mainWindow ?? undefined,
    backgroundColor: '#101014',
    show: false,
    icon: ICON_PATH,
    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  shortcutsWindow.removeMenu()
  shortcutsWindow.once('ready-to-show', () => shortcutsWindow?.show())
  shortcutsWindow.on('closed', () => { shortcutsWindow = null })

  loadRenderer(shortcutsWindow, { hash: 'shortcuts' })
}

export function focusMainWindow(): void {
  if (!mainWindow) return
  if (mainWindow.isMinimized()) mainWindow.restore()
  mainWindow.focus()
}

function loadRenderer(window: BrowserWindow, options: { hash?: string } = {}): void {
  if (VITE_DEV_SERVER_URL) {
    window.loadURL(options.hash ? `${VITE_DEV_SERVER_URL}#${options.hash}` : VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    window.loadFile(path.join(RENDERER_DIST, 'index.html'), options).catch(console.error)
  }
}