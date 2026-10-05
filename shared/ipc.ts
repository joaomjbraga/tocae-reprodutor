import type { PlaylistItem } from './playlist'

export const IPC_CHANNELS = {
  COMMAND: 'app:command',
  PLAYLIST_READ: 'playlist:read',
  PLAYLIST_WRITE: 'playlist:write',
  VIDEO_PICK: 'video:pick',
  WINDOW_OPEN: 'window:open',
} as const

export type AppCommand =
  | { type: 'open-videos'; paths: string[] }
  | { type: 'next-video' }
  | { type: 'previous-video' }
  | { type: 'toggle-playlist' }
  | { type: 'clear-playlist' }

export type WindowTarget = 'about' | 'shortcuts'

export interface TocaeApi {
  onCommand(callback: (command: AppCommand) => void): () => void
  readPlaylist(): Promise<PlaylistItem[]>
  writePlaylist(items: PlaylistItem[]): Promise<void>
  openVideoDialog(): Promise<void>
  openWindow(target: WindowTarget): Promise<void>
  getPathForFile(file: File): string
}
