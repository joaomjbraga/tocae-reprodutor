import { dialog, ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import { VIDEO_EXTENSIONS } from '@shared/media'
import { sendCommand } from './commands'
import { getMainWindow } from './windows'

export async function openVideoDialog(): Promise<void> {
  const window = getMainWindow()
  if (!window) return

  const result = await dialog.showOpenDialog(window, {
    title: 'Abrir vídeos',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Vídeos', extensions: [...VIDEO_EXTENSIONS] },
      { name: 'Todos os arquivos', extensions: ['*'] },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) return
  sendCommand({ type: 'open-videos', paths: result.filePaths })
}

export function registerDialogIpc(): void {
  ipcMain.handle(IPC_CHANNELS.VIDEO_PICK, () => openVideoDialog())
}
