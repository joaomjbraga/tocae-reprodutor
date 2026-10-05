import { IPC_CHANNELS } from '@shared/ipc'
import type { AppCommand } from '@shared/ipc'
import { getMainWindow } from './windows'

export function sendCommand(command: AppCommand): void {
  getMainWindow()?.webContents.send(IPC_CHANNELS.COMMAND, command)
}
