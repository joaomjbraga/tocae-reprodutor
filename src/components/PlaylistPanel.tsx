import { useState } from 'react'
import type { DragEvent } from 'react'
import { GripVertical, ListVideo, Play, Trash2, X } from 'lucide-react'
import styles from './PlaylistPanel.module.css'

type PlaylistPanelProps = {
  items: { id: string; name: string }[]
  currentIndex: number
  onPlay: (index: number) => void
  onMove: (from: number, to: number) => void
  onRemove: (id: string) => void
  onClear: () => void
  onClose: () => void
}

function PlaylistPanel({
  items,
  currentIndex,
  onPlay,
  onMove,
  onRemove,
  onClear,
  onClose,
}: PlaylistPanelProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dropIndex, setDropIndex] = useState<number | null>(null)

  function resetDrag() {
    setDragIndex(null)
    setDropIndex(null)
  }

  function handleDragStart(event: DragEvent<HTMLLIElement>, index: number) {
    setDragIndex(index)
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('text/plain', String(index))
  }

  function handleDragOver(event: DragEvent<HTMLLIElement>, index: number) {
    if (dragIndex === null || index === dragIndex) return
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
    const bounds = event.currentTarget.getBoundingClientRect()
    const below = event.clientY > bounds.top + bounds.height / 2
    setDropIndex(below ? index + 1 : index)
  }

  function handleDrop(event: DragEvent<HTMLOListElement>) {
    event.preventDefault()
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

  return (
    <aside className={styles.panel} aria-label="Lista de reprodução">
      <header className={styles.header}>
        <h2 className={styles.title}>
          <ListVideo size={15} />
          Lista
          {items.length > 0 && <span className={styles.count}>{items.length}</span>}
        </h2>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label="Ocultar lista"
          title="Ocultar lista (L)"
        >
          <X size={15} />
        </button>
      </header>

      {items.length === 0 ? (
        <p className={styles.empty}>A lista está vazia. Abra vídeos para tocar em sequência.</p>
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
                draggable
                onDragStart={(event) => handleDragStart(event, index)}
                onDragEnd={resetDrag}
                onDragOver={(event) => handleDragOver(event, index)}
                className={[
                  styles.row,
                  isActive ? styles.active : '',
                  dragIndex === index ? styles.dragging : '',
                  showLineBefore ? styles.dropBefore : '',
                  showLineAfter ? styles.dropAfter : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <button
                  type="button"
                  className={styles.item}
                  onClick={() => onPlay(index)}
                  title={item.name}
                >
                  <span className={styles.handle} aria-hidden="true">
                    <GripVertical size={13} />
                  </span>
                  {isActive ? (
                    <Play size={12} className={styles.playingIcon} />
                  ) : (
                    <span className={styles.index}>{index + 1}</span>
                  )}
                  <span className={styles.name}>{item.name}</span>
                </button>
                <button
                  type="button"
                  className={styles.remove}
                  onClick={() => onRemove(item.id)}
                  aria-label={`Remover ${item.name} da lista`}
                  title="Remover da lista"
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
            <Trash2 size={13} />
            Limpar lista
          </button>
        </footer>
      )}
    </aside>
  )
}

export default PlaylistPanel
