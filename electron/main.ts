import { app, BrowserWindow, Menu } from 'electron'
import { registerMediaSchemes, registerMediaProtocol } from './media/protocol'
import { registerDialogIpc } from './dialogs'
import { registerPlaylistIpc } from './playlist'
import { registerUpdater } from './updater'
import { createMainWindow, focusMainWindow, registerWindowIpc } from './windows'
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

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null)
    registerMediaProtocol()
    registerPlaylistIpc()
    registerDialogIpc()
    registerWindowIpc()
    createMainWindow()
    registerUpdater()
  })
}