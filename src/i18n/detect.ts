import { DEFAULT_LOCALE, matchLocale } from '@shared/i18n'
import type { Locale } from '@shared/i18n'

/**
 * Idioma do navegador.
 *
 * No Electron ele acompanha `app.getLocale()`, que por sua vez vem do sistema
 * operacional. Fora do Electron serve como aproximação para o app aberto
 * direto no navegador.
 */
export function detectSystemLocale(): Locale {
  const candidates = [navigator.language, ...(navigator.languages ?? [])]

  for (const candidate of candidates) {
    const matched = matchLocale(candidate)
    if (matched) return matched
  }

  return DEFAULT_LOCALE
}
