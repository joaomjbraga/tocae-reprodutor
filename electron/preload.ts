import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { AppCommand, TocaeApi, UpdateEvent, WindowTarget } from '@shared/ipc'
import type { PlaylistItem } from '@shared/playlist'

const api: TocaeApi = {
  onCommand(callback) {
    const listener = (_event: IpcRendererEvent, command: AppCommand) => callback(command)
    ipcRenderer.on(IPC_CHANNELS.COMMAND, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.COMMAND, listener)
  },
  readPlaylist: () => ipcRenderer.invoke(IPC_CHANNELS.PLAYLIST_READ),
  writePlaylist: (items: PlaylistItem[]) => ipcRenderer.invoke(IPC_CHANNELS.PLAYLIST_WRITE, items),
  openVideoDialog: () => ipcRenderer.invoke(IPC_CHANNELS.VIDEO_PICK),
  openWindow: (target: WindowTarget) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_OPEN, target),
  getPathForFile: (file: File) => webUtils.getPathForFile(file),
  onUpdateEvent(callback) {
    const listener = (_event: IpcRendererEvent, update: UpdateEvent) => callback(update)
    ipcRenderer.on(IPC_CHANNELS.UPDATE_EVENT, listener)
    return () => ipcRenderer.off(IPC_CHANNELS.UPDATE_EVENT, listener)
  },
  installUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_INSTALL),
  checkForUpdate: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATE_CHECK),
}

contextBridge.exposeInMainWorld('tocae', api)
