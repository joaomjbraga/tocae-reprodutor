import { Menu } from 'electron'
import { createAboutWindow, createShortcutsWindow } from './windows'
import { openVideoDialog } from './dialogs'

export function buildApplicationMenu(): void {
  const template: Electron.MenuItemConstructorOptions[] = [
    {
      label: 'Abrir',
      accelerator: 'CmdOrCtrl+O',
      click: () => void openVideoDialog(),
    },
    {
      label: 'Atalhos',
      click: () => createShortcutsWindow(),
    },
    {
      label: 'Sobre',
      click: () => createAboutWindow(),
    },
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}