import About from './components/About'
import Shortcuts from './components/Shortcuts'
import VideoPlayer from './components/VideoPlayer'
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
        <VideoPlayer />
      </main>
    </div>
  )
}

export default App