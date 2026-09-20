import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...params) => listener(event, ...params))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, listener] = args
    return ipcRenderer.off(channel, listener)
  },
})