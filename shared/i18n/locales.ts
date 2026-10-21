/**
 * Idiomas suportados pelo app.
 *
 * O código do idioma segue o padrão BCP 47 (`pt-BR`, `en`) para poder ser
 * comparado com o que o sistema operacional e o Electron reportam
 * (`app.getLocale()`).
 */

export const SUPPORTED_LOCALES = ['pt-BR', 'en'] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

/** Usado quando nada pode ser detectado: o app nunca fica sem idioma. */
export const DEFAULT_LOCALE: Locale = 'pt-BR'

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * Casa um idioma do sistema com um idioma suportado.
 *
 * Aceita variantes: `pt-BR` casa exato, `en-GB` cai no `en` por idioma base e
 * `pt-PT` cai no único português disponível. Devolve `null` quando não há
 * correspondência (ex.: `fr`), para que a decisão de usar o padrão fique
 * explícita na hora de resolver.
 */
export function matchLocale(candidate: string | null | undefined): Locale | null {
  if (!candidate) return null

  const normalized = candidate.trim().replace(/_/g, '-').toLowerCase()
  if (!normalized) return null

  const exact = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase() === normalized)
  if (exact) return exact

  const base = normalized.split('-')[0]
  const byBase = SUPPORTED_LOCALES.find((locale) => locale.toLowerCase().split('-')[0] === base)
  return byBase ?? null
}

/** Nome do idioma no próprio idioma (endônimo), para o seletor. */
export const LOCALE_NAMES: Record<Locale, string> = {
  'pt-BR': 'Português (Brasil)',
  en: 'English',
}
