import { dialog } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import { VIDEO_EXTENSIONS } from './media/mime'
import { getMainWindow } from './windows'

export async function openVideoDialog(): Promise<void> {
  const window = getMainWindow()
  if (!window) return

  const result = await dialog.showOpenDialog(window, {
    title: 'Abrir vídeo',
    properties: ['openFile'],
    filters: [
      { name: 'Vídeos', extensions: [...VIDEO_EXTENSIONS] },
      { name: 'Todos os arquivos', extensions: ['*'] },
    ],
  })

  if (result.canceled || result.filePaths.length === 0) return
  window.webContents.send(IPC_CHANNELS.VIDEO_OPEN, result.filePaths[0])
}