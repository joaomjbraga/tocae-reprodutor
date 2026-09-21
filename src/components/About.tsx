import styles from './About.module.css'
import wordmark from '../assets/tocae-wordmark.png'
import pkg from '../../package.json'

const AUTHOR = String(pkg.author ?? '')
const EMAIL = AUTHOR.match(/<([^>]+)>/)?.[1] ?? ''
const NAME = AUTHOR.replace(/<[^>]+>/, '').trim()

function About() {
  return (
    <div className={styles.about}>
      <img
        className={styles.wordmark}
        src={wordmark}
        alt="Tocaê Reprodutor"
        draggable={false}
      />
      <h1 className={styles.title}>Tocaê Reprodutor</h1>
      <p className={styles.description}>{pkg.description}</p>

      <dl className={styles.info}>
        <div className={styles.row}>
          <dt>Versão</dt>
          <dd>{pkg.version}</dd>
        </div>
        <div className={styles.row}>
          <dt>Autor</dt>
          <dd>{NAME}</dd>
        </div>
        <div className={styles.row}>
          <dt>E-mail</dt>
          <dd>{EMAIL}</dd>
        </div>
      </dl>
    </div>
  )
}

export default About