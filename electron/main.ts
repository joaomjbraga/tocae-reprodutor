import { app, BrowserWindow, Menu } from 'electron'
import { registerMediaSchemes, registerMediaProtocol } from './media/protocol'
import { registerDialogIpc } from './dialogs'
import { registerPlaylistIpc } from './playlist'
import { createMainWindow, focusMainWindow, registerWindowIpc } from './windows'
import { initLocale, registerLocaleIpc } from './locale'
import { DESKTOP_FILE_NAME } from './paths'

registerMediaSchemes()

const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  if (process.platform === 'linux') {
    app.setDesktopName(DESKTOP_FILE_NAME)
  }

  app.on('second-instance', focusMainWindow)

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow()
    }
  })

  app.whenReady().then(async () => {
    Menu.setApplicationMenu(null)
    registerMediaProtocol()
    registerPlaylistIpc()
    registerDialogIpc()
    registerWindowIpc()
    registerLocaleIpc()
    // O idioma precisa estar resolvido antes da primeira janela: os títulos
    // nascem já no idioma certo.
    await initLocale()
    createMainWindow()
  })
}