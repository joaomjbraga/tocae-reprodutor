import { CircleCheck, Download, Sparkles, TriangleAlert } from 'lucide-react'
import type { UpdateState } from '../hooks/useUpdate'
import styles from './UpdateBanner.module.css'

type UpdateBannerProps = {
  state: UpdateState
  onInstall: () => void
  onDismiss: () => void
}

/**
 * Aviso de nova versão, ancorado no topo do palco.
 *
 * Diferente do toast de "Limpar lista", este não desaparece sozinho: uma
 * atualização disponível é algo que o usuário pode querer adiar até o fim do
 * vídeo, então o banner só sai quando ele pede para instalar ou dispensa.
 */
function UpdateBanner({ state, onInstall, onDismiss }: UpdateBannerProps) {
  if (state.status === 'idle') return null

  if (state.status === 'error') {
    return (
      <div className={`${styles.banner} ${styles.bannerError}`} role="status">
        <TriangleAlert size={14} className={styles.icon} aria-hidden="true" />
        <span className={styles.message}>Não foi possível verificar atualizações.</span>
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Dispensar aviso">
          ×
        </button>
      </div>
    )
  }

  if (state.status === 'available') {
    return (
      <div className={`${styles.banner} ${styles.bannerAccent}`} role="status">
        <Sparkles size={14} className={styles.icon} aria-hidden="true" />
        <span className={styles.message}>Nova versão {state.version} disponível.</span>
        <button type="button" className={styles.action} onClick={onInstall}>
          <Download size={14} />
          Atualizar
        </button>
        <button type="button" className={styles.dismiss} onClick={onDismiss} aria-label="Agora não">
          ×
        </button>
      </div>
    )
  }

  if (state.status === 'downloading') {
    return (
      <div className={`${styles.banner} ${styles.bannerAccent}`} role="status">
        <Download size={14} className={styles.icon} aria-hidden="true" />
        <span className={styles.message}>Baixando {state.version}… {state.percent}%</span>
        <span className={styles.progress} aria-hidden="true">
          <span className={styles.progressFill} style={{ width: `${state.percent}%` }} />
        </span>
      </div>
    )
  }

  return (
    <div className={`${styles.banner} ${styles.bannerAccent}`} role="status">
      <CircleCheck size={14} className={styles.icon} aria-hidden="true" />
      <span className={styles.message}>Versão {state.version} pronta para instalar.</span>
      <button type="button" className={styles.action} onClick={onInstall}>
        <Download size={14} />
        Reiniciar e atualizar
      </button>
    </div>
  )
}

export default UpdateBanner