import About from './components/About'
import PlayerScreen from './components/PlayerScreen'
import Shortcuts from './components/Shortcuts'
import styles from './App.module.css'

function App() {
  if (window.location.hash === '#about') {
    return <About />
  }

  if (window.location.hash === '#shortcuts') {
    return <Shortcuts />
  }

  return (
    <div className={styles.app}>
      <main className={styles.content}>
        <PlayerScreen />
      </main>
    </div>
  )
}

export default App