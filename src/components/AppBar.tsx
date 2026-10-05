import { FolderOpen, Info, Keyboard, ListVideo, Trash2 } from 'lucide-react'
import styles from './AppBar.module.css'

type AppBarProps = {
  hasItems: boolean
  panelVisible: boolean
  onOpenVideos: () => void
  onTogglePanel: () => void
  onClear: () => void
  onOpenShortcuts: () => void
  onOpenAbout: () => void
}

function AppBar({
  hasItems,
  panelVisible,
  onOpenVideos,
  onTogglePanel,
  onClear,
  onOpenShortcuts,
  onOpenAbout,
}: AppBarProps) {
  return (
    <header className={styles.appBar}>
      <button
        type="button"
        className={styles.button}
        onClick={onOpenVideos}
        title="Abrir vídeos (Ctrl+O)"
        aria-label="Abrir vídeos"
      >
        <FolderOpen size={16} />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      <button
        type="button"
        className={`${styles.button} ${panelVisible ? styles.active : ''}`}
        onClick={onTogglePanel}
        title="Mostrar ou ocultar a lista (L)"
        aria-label="Mostrar ou ocultar a lista de reprodução"
        aria-pressed={panelVisible}
      >
        <ListVideo size={16} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={onClear}
        disabled={!hasItems}
        title="Limpar lista"
        aria-label="Limpar lista"
      >
        <Trash2 size={16} />
      </button>

      <span className={styles.spacer} />

      <button
        type="button"
        className={styles.button}
        onClick={onOpenShortcuts}
        title="Atalhos de teclado"
        aria-label="Atalhos de teclado"
      >
        <Keyboard size={16} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={onOpenAbout}
        title="Sobre o Tocaê"
        aria-label="Sobre o Tocaê Reprodutor"
      >
        <Info size={16} />
      </button>
    </header>
  )
}

export default AppBar
