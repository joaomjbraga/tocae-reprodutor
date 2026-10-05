import styles from './Shortcuts.module.css'
import wordmark from '../assets/tocae-wordmark.png'

const SHORTCUTS = [
  { key: 'Ctrl+O', action: 'Abrir vídeos' },
  { key: 'Espaço', action: 'Reproduzir ou pausar' },
  { key: 'F', action: 'Entrar ou sair da tela cheia' },
  { key: 'M', action: 'Silenciar ou ativar o som' },
  { key: 'N', action: 'Próximo vídeo da lista' },
  { key: 'P', action: 'Vídeo anterior da lista' },
  { key: 'L', action: 'Mostrar ou ocultar a lista' },
  { key: 'Alt+↑ / Alt+↓', action: 'Mover o item focado na lista' },
]

function Shortcuts() {
  return (
    <div className={styles.shortcuts}>
      <img
        className={styles.wordmark}
        src={wordmark}
        alt="Tocaê Reprodutor"
        draggable={false}
      />
      <h1 className={styles.title}>Atalhos de teclado</h1>

      <ul className={styles.list}>
        {SHORTCUTS.map(({ key, action }) => (
          <li key={action} className={styles.row}>
            <kbd className={styles.key}>{key}</kbd>
            <span className={styles.action}>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Shortcuts