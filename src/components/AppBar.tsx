import { FolderOpen, Info, Keyboard, ListVideo, Trash2 } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n'
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
  const { t } = useI18n()

  return (
    <header className={styles.appBar}>
      <button
        type="button"
        className={styles.button}
        onClick={onOpenVideos}
        title={t('appbar.openVideosTitle')}
        aria-label={t('appbar.openVideos')}
      >
        <FolderOpen size={16} />
      </button>

      <span className={styles.separator} aria-hidden="true" />

      <button
        type="button"
        className={`${styles.button} ${panelVisible ? styles.active : ''}`}
        onClick={onTogglePanel}
        title={t('appbar.togglePlaylistTitle')}
        aria-label={t('appbar.togglePlaylist')}
        aria-pressed={panelVisible}
      >
        <ListVideo size={16} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={onClear}
        disabled={!hasItems}
        title={t('appbar.clearPlaylist')}
        aria-label={t('appbar.clearPlaylist')}
      >
        <Trash2 size={16} />
      </button>

      <span className={styles.spacer} />

      <LanguageSwitcher />

      <button
        type="button"
        className={styles.button}
        onClick={onOpenShortcuts}
        title={t('appbar.shortcuts')}
        aria-label={t('appbar.shortcuts')}
      >
        <Keyboard size={16} />
      </button>

      <button
        type="button"
        className={styles.button}
        onClick={onOpenAbout}
        title={t('appbar.about')}
        aria-label={t('appbar.about')}
      >
        <Info size={16} />
      </button>
    </header>
  )
}

export default AppBar
