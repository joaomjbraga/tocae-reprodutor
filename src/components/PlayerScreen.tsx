import { useCallback, useEffect, useRef, useState } from 'react'
import { ListVideo } from 'lucide-react'
import AppBar from './AppBar'
import PlaylistPanel from './PlaylistPanel'
import Toast from './Toast'
import UpdateBanner from './UpdateBanner'
import VideoPlayer from './VideoPlayer'
import { usePlaylist } from '../hooks/usePlaylist'
import { useUpdate } from '../hooks/useUpdate'
import type { PlaylistSnapshot } from '../hooks/usePlaylist'
import styles from './PlayerScreen.module.css'

/** Deve cobrir a saída animada do painel (--duration-exit) antes de desmontar. */
const PANEL_EXIT_MS = 160

type ToastState = { message: string; snapshot: PlaylistSnapshot }

function PlayerScreen() {
  const playlist = usePlaylist()
  const update = useUpdate()
  const api = window.tocae
  // O painel fica montado durante a saída para poder animar; `panelLeaving`
  // marca o estado intermediário.
  const [panelLeaving, setPanelLeaving] = useState(false)
  const panelTimerRef = useRef<number | null>(null)
  // Uma única região viva para tudo que muda sozinho: item tocando, erro e
  // resultado de um reordenamento pelo teclado.
  const [announcement, setAnnouncement] = useState('')
  const [toast, setToast] = useState<ToastState | null>(null)
  const announcedIdRef = useRef<string | null>(null)

  const announce = useCallback((message: string) => setAnnouncement(message), [])

  // "Limpar" passa pelo mesmo caminho vindo da barra, do painel ou do atalho do
  // processo principal, para que o desfazer exista nos três casos.
  const handleClear = useCallback(() => {
    const snapshot = playlist.clear()
    if (snapshot) setToast({ message: 'Lista limpa', snapshot })
  }, [playlist])

  const handleUndoClear = useCallback(() => {
    if (toast) playlist.restore(toast.snapshot)
    setToast(null)
  }, [playlist, toast])

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
          handleClear()
          break
      }
    })
  }, [api, playlist, handleClear])

  // Mantém o painel montado durante a animação de saída e cancela a saída se
  // ele for reaberto no meio do caminho.
  useEffect(() => {
    if (playlist.panelVisible) {
      setPanelLeaving(false)
      if (panelTimerRef.current !== null) {
        window.clearTimeout(panelTimerRef.current)
        panelTimerRef.current = null
      }
      return
    }

    setPanelLeaving(true)
    panelTimerRef.current = window.setTimeout(() => setPanelLeaving(false), PANEL_EXIT_MS)
    return () => {
      if (panelTimerRef.current !== null) window.clearTimeout(panelTimerRef.current)
    }
  }, [playlist.panelVisible])

  // Anuncia o item em reprodução uma vez por item (voltar para o anterior
  // anuncia de novo, porque o id muda).
  useEffect(() => {
    const current = playlist.current
    if (!current) {
      announcedIdRef.current = null
      return
    }
    if (announcedIdRef.current === current.id) return
    announcedIdRef.current = current.id
    setAnnouncement(`Tocando ${playlist.currentIndex + 1} de ${playlist.items.length}: ${current.name}`)
  }, [playlist.current, playlist.currentIndex, playlist.items.length])

  useEffect(() => {
    if (playlist.error) setAnnouncement(playlist.error)
  }, [playlist.error])

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
        onClear={handleClear}
        onOpenShortcuts={() => void api?.openWindow('shortcuts')}
        onOpenAbout={() => void api?.openWindow('about')}
      />

      <div className={styles.layout}>
        <div className={styles.stage}>
          <p className="sr-only" role="status" aria-live="polite">
            {announcement}
          </p>
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
          {!(playlist.panelVisible || panelLeaving) && (
            <button
              type="button"
              className={styles.showList}
              onClick={playlist.togglePanel}
              title="Mostrar lista (L)"
              aria-label="Mostrar lista de reprodução"
            >
              <ListVideo size={16} />
            </button>
          )}
          <UpdateBanner state={update.state} onInstall={update.install} onDismiss={update.dismiss} />
          {toast && (
            <Toast
              message={toast.message}
              actionLabel="Desfazer"
              onAction={handleUndoClear}
              onDismiss={() => setToast(null)}
            />
          )}
        </div>

        {(playlist.panelVisible || panelLeaving) && (
          <PlaylistPanel
            items={playlist.items}
            currentIndex={playlist.currentIndex}
            closing={!playlist.panelVisible}
            loading={!playlist.loaded}
            pulseIds={playlist.pulseIds}
            onPlay={playlist.playIndex}
            onMove={playlist.move}
            onRemove={playlist.remove}
            onClear={handleClear}
            onClose={playlist.togglePanel}
            onFilesSelected={playlist.addFiles}
            onAnnounce={announce}
          />
        )}
      </div>
    </div>
  )
}

export default PlayerScreen