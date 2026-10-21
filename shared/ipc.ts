import type { Locale } from './i18n'
import type { PlaylistItem } from './playlist'

export const IPC_CHANNELS = {
  COMMAND: 'app:command',
  PLAYLIST_READ: 'playlist:read',
  PLAYLIST_WRITE: 'playlist:write',
  VIDEO_PICK: 'video:pick',
  WINDOW_OPEN: 'window:open',
  LOCALE_GET: 'locale:get',
  LOCALE_SET: 'locale:set',
} as const

export type AppCommand =
  | { type: 'open-videos'; paths: string[] }
  | { type: 'next-video' }
  | { type: 'previous-video' }
  | { type: 'toggle-playlist' }
  | { type: 'clear-playlist' }
  | { type: 'locale-changed'; locale: Locale; source: LocaleSource }

/** De onde veio o idioma em uso. */
export type LocaleSource = 'user' | 'system'

export interface LocaleInfo {
  /** Idioma em uso agora. */
  locale: Locale
  /** Idioma detectado do sistema operacional. */
  system: Locale
  /** `user` quando há escolha manual; `system` quando segue o sistema. */
  source: LocaleSource
}

export type WindowTarget = 'about' | 'shortcuts'

/**
 * Estado do ciclo de atualização, do main para o renderer.
 *
 * `downloading` e `ready` existem porque o download é automático: quem chama
 * `checkForUpdates()` recebe uma promessa resolvida no availability check, não
 * no fim do download.
 */
export interface TocaeApi {
  onCommand(callback: (command: AppCommand) => void): () => void
  readPlaylist(): Promise<PlaylistItem[]>
  writePlaylist(items: PlaylistItem[]): Promise<void>
  openVideoDialog(): Promise<void>
  openWindow(target: WindowTarget): Promise<void>
  getPathForFile(file: File): string
  /** Idioma em uso, o do sistema e a origem da escolha. */
  getLocale(): Promise<LocaleInfo>
  /**
   * Troca o idioma. `null` volta para "seguir o sistema". A troca é
   * persistida e propagada para as outras janelas.
   */
  setLocale(locale: Locale | null): Promise<void>
}
