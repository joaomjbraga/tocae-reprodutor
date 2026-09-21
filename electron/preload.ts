import { contextBridge, ipcRenderer } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { TocaeApi } from '@shared/ipc'

const api: TocaeApi = {
  onVideoOpen(callback) {
    const listener = (_event: IpcRendererEvent, filePath: string) => callback(filePath)
    ipcRenderer.on(IPC_CHANNELS.VIDEO_OPEN, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.VIDEO_OPEN, listener)
  },
}

contextBridge.exposeInMainWorld('tocae', api)