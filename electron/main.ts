import { app, BrowserWindow } from 'electron'
import { registerMediaSchemes, registerMediaProtocol } from './media/protocol'
import { createMainWindow, focusMainWindow } from './windows'
import { buildApplicationMenu } from './menu'
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
    registerMediaProtocol()
    buildApplicationMenu()
    createMainWindow()
  })
}