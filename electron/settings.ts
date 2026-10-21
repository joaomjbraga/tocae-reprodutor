import { app } from 'electron'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { DEFAULT_SETTINGS } from '@shared/settings'
import type { Settings } from '@shared/settings'
import { isLocale } from '@shared/i18n'

const STORE_FILE_NAME = 'settings.json'

function storeFilePath(): string {
  return path.join(app.getPath('userData'), STORE_FILE_NAME)
}

/** Lê as preferências gravadas; arquivo ausente ou corrompido vira o padrão. */
export async function readSettings(): Promise<Settings> {
  let raw: string
  try {
    raw = await readFile(storeFilePath(), 'utf8')
  } catch {
    return { ...DEFAULT_SETTINGS }
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    const stored = parsed as Partial<Settings> | null
    if (!stored || typeof stored !== 'object') return { ...DEFAULT_SETTINGS }
    return { locale: isLocale(stored.locale) ? stored.locale : null }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

/** Grava as preferências de forma atômica (arquivo temporário + rename). */
export async function writeSettings(settings: Settings): Promise<void> {
  const file = storeFilePath()
  const tempFile = `${file}.tmp`

  await mkdir(path.dirname(file), { recursive: true })
  await writeFile(tempFile, JSON.stringify({ version: 1, ...settings }, null, 2), 'utf8')
  await rename(tempFile, file)
}
