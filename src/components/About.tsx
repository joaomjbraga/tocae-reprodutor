import { useEffect } from 'react'
import LanguageSwitcher from './LanguageSwitcher'
import { useI18n } from '../i18n'
import styles from './About.module.css'
import wordmark from '../assets/tocae-wordmark.png'
import pkg from '../../package.json'

const AUTHOR = String(pkg.author ?? '')
const EMAIL = AUTHOR.match(/<([^>]+)>/)?.[1] ?? ''
const NAME = AUTHOR.replace(/<[^>]+>/, '').trim()

function About() {
  const { t } = useI18n()

  // O título da janela vem do <title> do documento: mantê-lo em dia aqui faz
  // a janela acompanhar o idioma sem depender do processo principal.
  useEffect(() => {
    document.title = t('window.about')
  }, [t])

  return (
    <div className={styles.about}>
      <div className={styles.corner}>
        <LanguageSwitcher />
      </div>

      <img
        className={styles.wordmark}
        src={wordmark}
        alt="Tocaê Reprodutor"
        draggable={false}
      />
      <h1 className={styles.title}>Tocaê Reprodutor</h1>
      <p className={styles.description}>{t('about.description')}</p>

      <dl className={styles.info}>
        <div className={styles.row}>
          <dt>{t('about.version')}</dt>
          <dd>{pkg.version}</dd>
        </div>
        <div className={styles.row}>
          <dt>{t('about.author')}</dt>
          <dd>{NAME}</dd>
        </div>
        <div className={styles.row}>
          <dt>{t('about.email')}</dt>
          <dd>{EMAIL}</dd>
        </div>
      </dl>
    </div>
  )
}

export default About
