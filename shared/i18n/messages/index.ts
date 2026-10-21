import type { Locale } from '../locales'
import { enMessages } from './en'
import { ptBRMessages } from './pt-BR'
import type { MessageKey, Messages } from './pt-BR'

export type { MessageKey, Messages }

/** Valores aceitos nos marcadores `{chave}` das mensagens. */
export type TranslationParams = Record<string, string | number>

const MESSAGES: Record<Locale, Messages> = {
  'pt-BR': ptBRMessages,
  en: enMessages,
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] ?? MESSAGES['pt-BR']
}

/** Substitui `{chave}` pelos parâmetros informados. */
const PLACEHOLDER = /\{(\w+)\}/g

export function translate(locale: Locale, key: MessageKey, params?: TranslationParams): string {
  const template = getMessages(locale)[key] ?? key
  if (!params) return template

  return template.replace(PLACEHOLDER, (match, name: string) => {
    const value = params[name]
    return value === undefined ? match : String(value)
  })
}
