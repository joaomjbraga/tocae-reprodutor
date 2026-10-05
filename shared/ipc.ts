import type { PlaylistItem } from './playlist'

export const IPC_CHANNELS = {
  COMMAND: 'app:command',
  PLAYLIST_READ: 'playlist:read',
  PLAYLIST_WRITE: 'playlist:write',
  VIDEO_PICK: 'video:pick',
  WINDOW_OPEN: 'window:open',
  UPDATE_EVENT: 'update:event',
  UPDATE_INSTALL: 'update:install',
  UPDATE_CHECK: 'update:check',
} as const

export type AppCommand =
  | { type: 'open-videos'; paths: string[] }
  | { type: 'next-video' }
  | { type: 'previous-video' }
  | { type: 'toggle-playlist' }
  | { type: 'clear-playlist' }

export type WindowTarget = 'about' | 'shortcuts'

/**
 * Estado do ciclo de atualização, do main para o renderer.
 *
 * `downloading` e `ready` existem porque o download é automático: quem chama
 * `checkForUpdates()` recebe uma promessa resolvida no availability check, não
 * no fim do download.
 */
export type UpdateEvent =
  | { status: 'available'; version: string }
  | { status: 'downloading'; percent: number }
  | { status: 'ready'; version: string }
  | { status: 'error'; message: string }

export interface TocaeApi {
  onCommand(callback: (command: AppCommand) => void): () => void
  readPlaylist(): Promise<PlaylistItem[]>
  writePlaylist(items: PlaylistItem[]): Promise<void>
  openVideoDialog(): Promise<void>
  openWindow(target: WindowTarget): Promise<void>
  getPathForFile(file: File): string
  onUpdateEvent(callback: (event: UpdateEvent) => void): () => void
  installUpdate(): void
  checkForUpdate(): void
}