import { app, ipcMain } from 'electron'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { IPC_CHANNELS } from '@shared/ipc'
import type { PlaylistItem } from '@shared/playlist'

const STORE_FILE_NAME = 'playlist.json'

interface StoredPlaylist {
  version: number
  items: PlaylistItem[]
}

function storeFilePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE_NAME)
}

function isPlaylistItem(value: unknown): value is PlaylistItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Partial<PlaylistItem>
  return (
    typeof item.id === 'string' &&
    item.id.length > 0 &&
    typeof item.path === 'string' &&
    item.path.length > 0 &&
    typeof item.name === 'string'
  )
}

function withoutDuplicates(items: PlaylistItem[]): PlaylistItem[] {
  const seen = new Set<string>()
  return items.filter((item) => {
    if (seen.has(item.path)) return false
    seen.add(item.path)
    return true
  })
}

export async function readPlaylist(): Promise<PlaylistItem[]> {
  let raw: string
  try {
    raw = await readFile(storeFilePath(), 'utf8')
  } catch {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    const stored = parsed as Partial<StoredPlaylist> | null
    if (!stored || !Array.isArray(stored.items)) return []
    return withoutDuplicates(stored.items.filter(isPlaylistItem))
  } catch {
    return []
  }
}

export async function writePlaylist(items: PlaylistItem[]): Promise<void> {
  const file = storeFilePath()
  const tempFile = `${file}.tmp`
  const payload: StoredPlaylist = { version: 1, items: withoutDuplicates(items) }

  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(tempFile, JSON.stringify(payload, null, 2), 'utf8')
  await rename(tempFile, file)
}

export function registerPlaylistIpc(): void {
  ipcMain.handle(IPC_CHANNELS.PLAYLIST_READ, () => readPlaylist())

  ipcMain.handle(IPC_CHANNELS.PLAYLIST_WRITE, async (_event, items: unknown) => {
    if (!Array.isArray(items)) return
    await writePlaylist(items.filter(isPlaylistItem))
  })
}
