import { app, ipcMain } from 'electron'
import electronUpdater from 'electron-updater'
const { autoUpdater } = electronUpdater
import type { UpdateInfo } from 'electron-updater'
import { IPC_CHANNELS } from '@shared/ipc'
import type { UpdateEvent } from '@shared/ipc'
import { getMainWindow } from './windows'

/**
 * Verificação de atualização via electron-updater.
 *
 * electron-updater consulta o feed configurado em `publish` no
 * electron-builder.json5 (GitHub Releases) e compara com a versão do app. O
 * download é automático; a instalação acontece por ação explícita do usuário,
 * porque em rpm/deb o pacote sempre pede elevação (pkexec) e não pode ser
 * instalado em silêncio.
 */

/** Momento da primeira verificação após o boot, em ms. */
const FIRST_CHECK_DELAY_MS = 4000
/** Intervalo entre verificações quando não há nada novo, em ms. */
const IDLE_CHECK_INTERVAL_MS = 6 * 60 * 60 * 1000

let checkTimer: number | null = null
let currentVersion: string | null = null

function send(event: UpdateEvent): void {
  getMainWindow()?.webContents.send(IPC_CHANNELS.UPDATE_EVENT, event)
}

/**
 * electron-updater só funciona num app empacotado: o feed e o caminho do
 * artefato vêm do app-update.yml, que o electron-builder só escreve no pacote.
 * Em desenvolvimento (`electron .` ou `vite dev`) o app não é empacotado e a
 * consulta não teria alvo.
 */
function isSupported(): boolean {
  return app.isPackaged
}

async function check(): Promise<void> {
  if (!isSupported() || currentVersion) return

  try {
    const result = await autoUpdater.checkForUpdates()
    const info = result?.updateInfo as UpdateInfo | undefined
    if (info?.version) currentVersion = info.version
  } catch {
    // Feed indisponível ou sem rede: silêncio. Uma janela de vídeo não deve
    // interromper a reprodução por causa de uma verificação.
  }
}

function scheduleNextCheck(): void {
  if (checkTimer !== null) window.clearTimeout(checkTimer)
  checkTimer = window.setTimeout(() => {
    void check()
    scheduleNextCheck()
  }, IDLE_CHECK_INTERVAL_MS)
}

export function registerUpdater(): void {
  if (!isSupported()) return

  autoUpdater.autoDownload = true
  autoUpdater.autoInstallOnAppQuit = false

  autoUpdater.on('update-available', (info) => {
    send({ status: 'available', version: info.version })
  })

  autoUpdater.on('download-progress', (progress) => {
    send({ status: 'downloading', percent: Math.round(progress.percent) })
  })

  autoUpdater.on('update-downloaded', (info) => {
    send({ status: 'ready', version: info.version })
  })

  autoUpdater.on('error', (error) => {
    send({ status: 'error', message: error.message })
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_CHECK, () => {
    void check()
  })

  ipcMain.handle(IPC_CHANNELS.UPDATE_INSTALL, () => {
    // rpm/deb exigem elevação: sai do app e deixa o gerenciador de pacotes
    // pedir a senha ao usuário.
    autoUpdater.quitAndInstall()
  })

  // Espera o app assentar antes de tocar a rede, para não competir com o
  // carregamento inicial dos vídeos.
  checkTimer = window.setTimeout(() => {
    void check()
    scheduleNextCheck()
  }, FIRST_CHECK_DELAY_MS)
}

export function stopUpdater(): void {
  if (checkTimer !== null) {
    window.clearTimeout(checkTimer)
    checkTimer = null
  }
}