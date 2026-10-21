import { useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n'
import styles from './Shortcuts.module.css'
import wordmark from '../assets/tocae-wordmark.png'

function Shortcuts() {
  const { t } = useI18n()

  // O título da janela vem do <title> do documento: mantê-lo em dia aqui faz
  // a janela acompanhar o idioma sem depender do processo principal.
  useEffect(() => {
    document.title = t('window.shortcuts')
  }, [t])

  const shortcuts = [
    { key: 'Ctrl+O', action: t('shortcuts.openVideos') },
    { key: t('shortcuts.key.space'), action: t('shortcuts.playPause') },
    { key: 'F', action: t('shortcuts.fullscreen') },
    { key: 'M', action: t('shortcuts.mute') },
    { key: 'N', action: t('shortcuts.next') },
    { key: 'P', action: t('shortcuts.previous') },
    { key: 'L', action: t('shortcuts.toggleList') },
    { key: 'Alt+↑ / Alt+↓', action: t('shortcuts.move') },
  ]

  return (
    <div className={styles.shortcuts}>
      <div className={styles.corner}>
        <LanguageSwitcher />
      </div>

      <img
        className={styles.wordmark}
        src={wordmark}
        alt="Tocaê Reprodutor"
        draggable={false}
      />
      <h1 className={styles.title}>{t('shortcuts.title')}</h1>

      <ul className={styles.list}>
        {shortcuts.map(({ key, action }) => (
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
