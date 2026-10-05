import { useEffect } from 'react'
import { ListVideo } from 'lucide-react'
import AppBar from './AppBar'
import PlaylistPanel from './PlaylistPanel'
import VideoPlayer from './VideoPlayer'
import { usePlaylist } from '../hooks/usePlaylist'
import styles from './PlayerScreen.module.css'

function PlayerScreen() {
  const playlist = usePlaylist()
  const api = window.tocae

  useEffect(() => {
    if (!api) return

    return api.onCommand((command) => {
      switch (command.type) {
        case 'open-videos':
          playlist.addPaths(command.paths)
          break
        case 'next-video':
          playlist.next()
          break
        case 'previous-video':
          playlist.previous()
          break
        case 'toggle-playlist':
          playlist.togglePanel()
          break
        case 'clear-playlist':
          playlist.clear()
          break
      }
    })
  }, [api, playlist])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      if (target instanceof HTMLInputElement && target.type !== 'range') return

      if ((event.ctrlKey || event.metaKey) && (event.key === 'o' || event.key === 'O')) {
        event.preventDefault()
        void api?.openVideoDialog()
        return
      }

      switch (event.key) {
        case 'n':
        case 'N':
          event.preventDefault()
          playlist.next()
          break
        case 'p':
        case 'P':
          event.preventDefault()
          playlist.previous()
          break
        case 'l':
        case 'L':
          event.preventDefault()
          playlist.togglePanel()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [api, playlist])

  return (
    <div className={styles.screen}>
      <AppBar
        hasItems={playlist.items.length > 0}
        panelVisible={playlist.panelVisible}
        onOpenVideos={() => void api?.openVideoDialog()}
        onTogglePanel={playlist.togglePanel}
        onClear={playlist.clear}
        onOpenShortcuts={() => void api?.openWindow('shortcuts')}
        onOpenAbout={() => void api?.openWindow('about')}
      />

      <div className={styles.layout}>
        <div className={styles.stage}>
          <VideoPlayer
            source={playlist.source}
            message={playlist.error}
            hasNext={playlist.hasNext}
            hasPrevious={playlist.hasPrevious}
            onNext={playlist.next}
            onPrevious={playlist.previous}
            onEnded={playlist.next}
            onFailed={playlist.failCurrent}
            onFilesSelected={playlist.addFiles}
          />
          {!playlist.panelVisible && (
            <button
              type="button"
              className={styles.showList}
              onClick={playlist.togglePanel}
              title="Mostrar lista (L)"
              aria-label="Mostrar lista de reprodução"
            >
              <ListVideo size={18} />
            </button>
          )}
        </div>

        {playlist.panelVisible && (
          <PlaylistPanel
            items={playlist.items}
            currentIndex={playlist.currentIndex}
            onPlay={playlist.playIndex}
            onMove={playlist.move}
            onRemove={playlist.remove}
            onClear={playlist.clear}
            onClose={playlist.togglePanel}
          />
        )}
      </div>
    </div>
  )
}

export default PlayerScreen
