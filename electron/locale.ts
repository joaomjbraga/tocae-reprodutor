import { BrowserWindow, app, ipcMain } from 'electron'
import { IPC_CHANNELS } from '@shared/ipc'
import type { LocaleInfo, LocaleSource } from '@shared/ipc'
import { DEFAULT_LOCALE, isLocale, matchLocale } from '@shared/i18n'
import type { Locale } from '@shared/i18n'
import { readSettings, writeSettings } from './settings'

/**
 * Idioma em uso no processo principal.
 *
 * Fica aqui, e não em `windows.ts`, para que tanto as janelas quanto os
 * diálogos nativos leiam o mesmo valor sem criar um ciclo de imports.
 */
let current: Locale = DEFAULT_LOCALE

/** `null` enquanto o usuário não escolheu um idioma (seguindo o sistema). */
let preference: Locale | null = null

type LocaleListener = (locale: Locale) => void
const listeners = new Set<LocaleListener>()

export function getAppLocale(): Locale {
  return current
}

/** Idioma do sistema operacional, já normalizado para os idiomas suportados. */
export function getSystemLocale(): Locale {
  return matchLocale(app.getLocale()) ?? DEFAULT_LOCALE
}

export function getLocaleInfo(): LocaleInfo {
  return {
    locale: current,
    system: getSystemLocale(),
    source: preference === null ? 'system' : 'user',
  }
}

/** Registra um ouvinte avisado quando o idioma muda (títulos das janelas). */
export function onLocaleChange(listener: LocaleListener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify(locale: Locale): void {
  for (const listener of listeners) listener(locale)
}

/**
 * Aplica um idioma: grava a preferência, atualiza o valor em uso e propaga
 * para todos os renderers (as janelas "Sobre" e "Atalhos" são outras
 * instâncias do app e precisam mudar junto).
 */
export async function applyLocale(next: Locale | null): Promise<LocaleInfo> {
  preference = next
  current = next ?? getSystemLocale()

  await writeSettings({ locale: preference })

  const source: LocaleSource = preference === null ? 'system' : 'user'
  notify(current)

  for (const window of BrowserWindow.getAllWindows()) {
    window.webContents.send(IPC_CHANNELS.COMMAND, {
      type: 'locale-changed',
      locale: current,
      source,
    })
  }

  return getLocaleInfo()
}

/** Carrega a preferência gravada e define o idioma inicial. */
export async function initLocale(): Promise<void> {
  const settings = await readSettings()
  preference = settings.locale
  current = preference ?? getSystemLocale()
  notify(current)
}

export function registerLocaleIpc(): void {
  ipcMain.handle(IPC_CHANNELS.LOCALE_GET, () => getLocaleInfo())

  ipcMain.handle(IPC_CHANNELS.LOCALE_SET, async (_event, locale: unknown) => {
    if (locale === null || locale === undefined) return applyLocale(null)
    // Valor desconhecido: mantém o idioma atual em vez de cair no padrão.
    if (!isLocale(locale)) return getLocaleInfo()
    return applyLocale(locale)
  })
}
