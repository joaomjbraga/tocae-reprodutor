import { app, BrowserWindow, Menu, dialog, protocol } from 'electron'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { Readable } from 'node:stream'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
process.env.APP_ROOT = path.join(__dirname, '..')
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')
const VITE_PUBLIC = VITE_DEV_SERVER_URL
  ? path.join(process.env.APP_ROOT, 'public')
  : RENDERER_DIST

process.env.VITE_PUBLIC = VITE_PUBLIC

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'media',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
      bypassCSP: true,
    },
  },
])

let win: BrowserWindow | null = null
let aboutWin: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    title: 'Tocaê Reprodutor',
    width: 960,
    height: 600,
    minWidth: 480,
    minHeight: 320,
    backgroundColor: '#101014',
    show: false,
    icon: path.join(VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  win.once('ready-to-show', () => win?.show())

  win.on('closed', () => { win = null })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL).catch(console.error)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html')).catch(console.error)
  }
}

function createAboutWindow(): void {
  if (aboutWin) {
    aboutWin.focus()
    return
  }

  aboutWin = new BrowserWindow({
    title: 'Sobre o Tocaê',
    width: 420,
    height: 340,
    resizable: false,
    maximizable: false,
    minimizable: false,
    parent: win ?? undefined,
    backgroundColor: '#101014',
    show: false,
    icon: path.join(VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  })

  aboutWin.removeMenu()
  aboutWin.once('ready-to-show', () => aboutWin?.show())
  aboutWin.on('closed', () => { aboutWin = null })

  if (VITE_DEV_SERVER_URL) {
    aboutWin.loadURL(`${VITE_DEV_SERVER_URL}#about`).catch(console.error)
  } else {
    aboutWin.loadFile(path.join(RENDERER_DIST, 'index.html'), { hash: 'about' }).catch(console.error)
  }
}

async function openVideoDialog(): Promise<void> {
  const window = win
  if (!window) return
  const result = await dialog.showOpenDialog(window, {
    title: 'Abrir vídeo',
    properties: ['openFile'],
    filters: [
      { name: 'Vídeos', extensions: ['mp4', 'webm', 'mkv', 'avi', 'mov', 'm4v', 'ogv', 'ogg'] },
      { name: 'Todos os arquivos', extensions: ['*'] },
    ],
  })
  if (result.canceled || result.filePaths.length === 0) return
  window.webContents.send('video:open', result.filePaths[0])
}

function buildMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Abrir',
      accelerator: 'CmdOrCtrl+O',
      click: () => void openVideoDialog(),
    },
    {
      label: 'Sobre',
      click: () => createAboutWindow(),
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (!win) return
    if (win.isMinimized()) win.restore()
    win.focus()
  })

  app.whenReady().then(() => {
    protocol.handle('media', async (request) => {
      const { pathname } = new URL(request.url)
      const filePath = decodeURIComponent(pathname.slice(1))

      const result = await stat(filePath)
      if (!result.isFile()) {
        return new Response('Not found', { status: 404 })
      }

      const size = result.size
      const range = request.headers.get('Range')
      const rangeMatch = /bytes=(\d*)-(\d*)/.exec(range ?? '')

      if (rangeMatch) {
        const start = rangeMatch[1] ? Number(rangeMatch[1]) : 0
        const end = rangeMatch[2] ? Number(rangeMatch[2]) : size - 1
        const stream = createReadStream(filePath, { start, end })
        return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
          status: 206,
          headers: {
            'Content-Type': mimeTypeFor(filePath),
            'Accept-Ranges': 'bytes',
            'Content-Length': String(end - start + 1),
            'Content-Range': `bytes ${start}-${end}/${size}`,
          },
        })
      }

      if (size === 0) {
        const empty = createReadStream(filePath)
        return new Response(Readable.toWeb(empty) as unknown as ReadableStream, {
          headers: { 'Content-Type': mimeTypeFor(filePath) },
        })
      }

      const stream = createReadStream(filePath)
      return new Response(Readable.toWeb(stream) as unknown as ReadableStream, {
        headers: {
          'Content-Type': mimeTypeFor(filePath),
          'Accept-Ranges': 'bytes',
          'Content-Length': String(size),
        },
      })
    })

    buildMenu()
    createWindow()
  })
}

function mimeTypeFor(filePath: string): string {
  const extension = path.extname(filePath).toLowerCase()
  switch (extension) {
    case '.mp4':
    case '.m4v':
      return 'video/mp4'
    case '.webm':
      return 'video/webm'
    case '.mkv':
      return 'video/x-matroska'
    case '.avi':
      return 'video/x-msvideo'
    case '.mov':
    case '.qt':
      return 'video/quicktime'
    case '.ogv':
    case '.ogg':
      return 'video/ogg'
    case '.mpg':
    case '.mpeg':
      return 'video/mpeg'
    default:
      return 'application/octet-stream'
  }
}