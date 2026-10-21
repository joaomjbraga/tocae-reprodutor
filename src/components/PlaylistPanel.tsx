import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, DragEvent, KeyboardEvent } from 'react'
import { GripVertical, ListVideo, Play, Trash2, X } from 'lucide-react'
import type { MessageKey, TranslationParams } from '@shared/i18n'
import { useI18n } from '../i18n'
import styles from './PlaylistPanel.module.css'

/** `--i` alimenta o atraso em cascata da animação de entrada das linhas. */
type RowStyle = CSSProperties & { '--i': number }

type PlaylistPanelProps = {
  items: { id: string; name: string }[]
  currentIndex: number
  /** `closing` marca a saída animada (o painel segue montado). */
  closing: boolean
  loading: boolean
  /** Vídeos que o usuário tentou adicionar e já estavam na lista. */
  pulseIds: ReadonlySet<string>
  onPlay: (index: number) => void
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
  onFilesSelected: (files: File[]) => void
  onAnnounce: (key: MessageKey, params?: TranslationParams) => void
}

function PlaylistPanel({
  items,
  currentIndex,
  closing,
  loading,
  pulseIds,
  onPlay,
  onMove,
  onRemove,
  onClear,
  onClose,
  onFilesSelected,
  onAnnounce,
}: PlaylistPanelProps) {
  const { t } = useI18n()
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)
  const [droppingFiles, setDroppingFiles] = useState(false)
  // entered/leave disparam em cascata nos filhos; o contador evita o piscar.
  const fileDragDepthRef = useRef(0)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [focusIndex, setFocusIndex] = useState<number | null>(null)

  // Depois de mover com o teclado, o foco precisa seguir o item, senão o
  // próximo Alt+↓ opera sobre o índice antigo.
  useEffect(() => {
    if (focusIndex === null) return
    itemRefs.current[focusIndex]?.focus()
    setFocusIndex(null)
  }, [focusIndex, items])

  function resetDrag() {
    setDragIndex(null)
    setDropIndex(null)
  }

  function hasFiles(event: DragEvent) {
    return event.dataTransfer.types.includes('Files')
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>, index: number) {
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, index: number) {
    if (hasFiles(event)) return
    if (dragIndex === null || index === dragIndex) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const bounds = event.currentTarget.getBoundingClientRect()
    const below = event.clientY > bounds.top + bounds.height / 2
    setDropIndex(below ? index + 1 : index)
  }

  function handleDrop(event: DragEvent<HTMLOListElement>) {
    event.preventDefault()
    if (hasFiles(event)) return
    if (dragIndex !== null && dropIndex !== null) {
      const target = dropIndex > dragIndex ? dropIndex - 1 : dropIndex
      onMove(dragIndex, target)
    }
    resetDrag()
  }

  function handleDragLeave(event: DragEvent<HTMLOListElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && event.currentTarget.contains(next)) return
    setDropIndex(null)
  }

  // Arrastar arquivos do sistema sobre o painel: antes o <ol> chamava
  // preventDefault e engolia o drop sem adicionar nada.
  function handleFileDragEnter(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) return
    event.preventDefault()
    fileDragDepthRef.current += 1
    setDroppingFiles(true)
  }

  function handleFileDragOver(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }

  function handleFileDragLeave() {
    fileDragDepthRef.current = Math.max(0, fileDragDepthRef.current - 1)
    if (fileDragDepthRef.current === 0) setDroppingFiles(false)
  }

  function handleFileDrop(event: DragEvent<HTMLElement>) {
    if (!hasFiles(event)) return
    event.preventDefault()
    fileDragDepthRef.current = 0
    setDroppingFiles(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
  }

  function handleItemKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!event.altKey) return
    const delta = event.key === 'ArrowUp' ? -1 : event.key === 'ArrowDown' ? 1 : 0
    if (delta === 0) return
    const target = index + delta
    if (target < 0 || target >= items.length) return
    event.preventDefault()
    onMove(index, target)
    setFocusIndex(target)
    onAnnounce('playlist.moved', { position: target + 1, total: items.length })
  }

  return (
    <aside
      className={`${styles.panel} ${closing ? styles.closing : ''} ${droppingFiles ? styles.dropping : ''}`}
      aria-label={t('playlist.label')}
      inert={closing ? true : undefined}
      onDragEnter={handleFileDragEnter}
      onDragOver={handleFileDragOver}
      onDragLeave={handleFileDragLeave}
      onDrop={handleFileDrop}
    >
      <header className={styles.header}>
        <h2 className={styles.title}>
          <ListVideo size={14} />
          {t('playlist.title')}
          {items.length > 0 && <span className={styles.count}>{items.length}</span>}
        </h2>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label={t('playlist.hide')}
          title={t('playlist.hideTitle')}
        >
          <X size={14} />
        </button>
      </header>

      {loading ? (
        <ul className={styles.skeleton} aria-label={t('playlist.loading')} aria-busy="true">
          {[0, 1, 2].map((slot) => (
            <li key={slot} className={styles.skeletonRow}>
              <span className={styles.skeletonBlock} />
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <p className={styles.empty}>
          <ListVideo size={28} className={styles.emptyIcon} aria-hidden="true" />
          {t('playlist.empty')}
        </p>
      ) : (
        <ol
          className={styles.list}
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          {items.map((item, index) => {
            const isActive = index === currentIndex
            const showLineBefore = dropIndex === index && dragIndex !== index
            const showLineAfter =
              dropIndex === index + 1 && dragIndex !== index && index === items.length - 1

            return (
              <li
                key={item.id}
                style={{ '--i': index } as RowStyle}
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragEnd={resetDrag}
                onDragOver={(event) => handleDragOver(event, index)}
                className={[
                  styles.row,
                  isActive ? styles.active : '',
                  dragIndex === index ? styles.dragging : '',
                  pulseIds.has(item.id) ? styles.pulse : '',
                  showLineBefore ? styles.dropBefore : '',
                  showLineAfter ? styles.dropAfter : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  className={styles.item}
                  ref={(node) => {
                    itemRefs.current[index] = node
                  }}
                  onClick={() => onPlay(index)}
                  onKeyDown={(event) => handleItemKeyDown(event, index)}
                  title={t('playlist.itemTitle', { name: item.name })}
                  aria-current={isActive ? 'true' : undefined}
                >
                  <span className={styles.handle} aria-hidden="true">
                    <GripVertical size={12} />
                  </span>
                  {isActive ? (
                    <Play size={12} className={styles.playingIcon} aria-hidden="true" />
                  ) : (
                    <span className={styles.index} aria-hidden="true">
                      {index + 1}
                    </span>
                  )}
                  <span className={styles.name}>{item.name}</span>
                </button>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(item.id)}
                  aria-label={t('playlist.remove', { name: item.name })}
                  title={t('playlist.removeTitle')}
                >
                  <Trash2 size={14} />
                </button>
              </li>
            )
          })}
        </ol>
      )}

      {items.length > 0 && (
        <footer className={styles.footer}>
          <button type="button" className={styles.clear} onClick={onClear}>
            <Trash2 size={14} />
            {t('playlist.clear')}
          </button>
        </footer>
      )}
    </aside>
  )
}

export default PlaylistPanel