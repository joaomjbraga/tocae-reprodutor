import { contextBridge, ipcRenderer, webUtils } from 'electron'
import type { IpcRendererEvent } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { AppCommand, TocaeApi, WindowTarget } from '@shared/ipc'
import type { Locale } from '@shared/i18n'
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
  getLocale: () => ipcRenderer.invoke(IPC_CHANNELS.LOCALE_GET),
  setLocale: (locale: Locale | null) => ipcRenderer.invoke(IPC_CHANNELS.LOCALE_SET, locale),
}

contextBridge.exposeInMainWorld('tocae', api)
