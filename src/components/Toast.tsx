import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Undo2 } from 'lucide-react'
import styles from './Toast.module.css'

/** `--toast-duration` alimenta a linha de contagem regressiva. */
type TimerStyle = CSSProperties & { '--toast-duration': string }

type ToastProps = {
  message: string
  actionLabel?: string
  onAction?: () => void
  onDismiss: () => void
  durationMs?: number
}

/**
 * Aviso temporário com ação opcional. Fica no palco, acima da barra de
 * controles, para não colidir com o auto-hide e aparecer mesmo com a lista
 * fechada (o "limpar" também existe na barra superior).
 */
function Toast({ message, actionLabel, onAction, onDismiss, durationMs = 5000 }: ToastProps) {
  useEffect(() => {
    const timer = window.setTimeout(onDismiss, durationMs)
    return () => window.clearTimeout(timer)
  }, [onDismiss, durationMs])

  return (
    <div className={styles.toast} role="status">
      <span className={styles.message}>{message}</span>
      {onAction && actionLabel && (
        <button type="button" className={styles.action} onClick={onAction}>
          <Undo2 size={14} />
          {actionLabel}
        </button>
      )}
      <span
        className={styles.timer}
        style={{ '--toast-duration': `${durationMs}ms` } as TimerStyle}
        aria-hidden="true"
      />
    </div>
  )
}

export default Toast