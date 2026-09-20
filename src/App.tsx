import About from './components/About'
import VideoPlayer from './components/VideoPlayer'
import styles from './App.module.css'

function App() {
  if (window.location.hash === '#about') {
    return <About />
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