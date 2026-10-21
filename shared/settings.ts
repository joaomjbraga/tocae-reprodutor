import type { Locale } from './i18n'

export interface Settings {
  /**
   * Idioma escolhido pelo usuário. `null` significa "seguir o sistema", que
   * é o estado inicial de uma instalação nova.
   */
  locale: Locale | null
}

export const DEFAULT_SETTINGS: Settings = {
  locale: null,
}
