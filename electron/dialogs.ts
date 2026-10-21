import { dialog, ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import { VIDEO_EXTENSIONS } from '@shared/media'
import { translate } from '@shared/i18n'
import { sendCommand } from './commands'
import { getAppLocale } from './locale'
import { getMainWindow } from './windows'

export async function openVideoDialog(): Promise<void> {
  const window = getMainWindow()
  if (!window) return

  // O diálogo nativo é do sistema, então o texto acompanha o idioma do app.
  const locale = getAppLocale()

  const result = await dialog.showOpenDialog(window, {
    title: translate(locale, 'dialog.openTitle'),
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: translate(locale, 'dialog.videosFilter'), extensions: [...VIDEO_EXTENSIONS] },
      { name: translate(locale, 'dialog.allFilesFilter'), extensions: ['*'] },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) return
  sendCommand({ type: 'open-videos', paths: result.filePaths })
}

export function registerDialogIpc(): void {
  ipcMain.handle(IPC_CHANNELS.VIDEO_PICK, () => openVideoDialog())
}
