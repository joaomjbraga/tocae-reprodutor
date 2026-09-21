import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, SyntheticEvent } from 'react'
import { CompressIcon, ExpandIcon, PauseIcon, PlayIcon } from './icons'
import { formatTime } from '../lib/format'
import { toMediaUrl } from '../lib/media'
import wordmark from '../assets/tocae-wordmark.png'
import styles from './VideoPlayer.module.css'

function VideoPlayer() {
  const areaRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [src, setSrc] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [seeking, setSeeking] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const area = areaRef.current
    if (!area) return
    const onChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    area.addEventListener('fullscreenchange', onChange)
    return () => area.removeEventListener('fullscreenchange', onChange)
  }, [])

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    }
  }, [])

  useEffect(() => {
    const api = window.tocae
    if (!api) return
    return api.onVideoOpen((filePath) => loadPath(filePath))
  }, [])

  function loadFile(file: File | undefined) {
    if (!file) return
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current)
    objectUrlRef.current = URL.createObjectURL(file)
    setSrc(objectUrlRef.current)
    resetPlayback()
  }

  function loadPath(filePath: string) {
    setSrc(toMediaUrl(filePath))
    resetPlayback()
  }

  function resetPlayback() {
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    loadFile(event.target.files?.[0] ?? undefined)
    event.target.value = ''
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    loadFile(event.dataTransfer.files?.[0] ?? undefined)
  }

  function togglePlay() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
    } else {
      video.pause()
    }
  }

  function handleTimeUpdate(event: SyntheticEvent<HTMLVideoElement>) {
    if (!seeking) setCurrentTime(event.currentTarget.currentTime)
  }

  function handleSeek(event: ChangeEvent<HTMLInputElement>) {
    const video = videoRef.current
    if (!video) return
    const time = Number(event.target.value)
    video.currentTime = time
    setCurrentTime(time)
  }

  function toggleFullscreen() {
    const area = areaRef.current
    if (!area) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void area.requestFullscreen()
    }
  }

  const hasVideo = src !== null
  const paused = !playing

  return (
    <section
      ref={areaRef}
      className={`${styles.videoArea} ${dragging ? styles.dragging : ''} ${playing ? styles.playing : styles.paused}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
    >
      {hasVideo ? (
        <>
          <video
            key={src}
            ref={videoRef}
            className={styles.video}
            src={src ?? undefined}
            autoPlay
            controls={false}
            onClick={togglePlay}
            onContextMenu={(event) => event.preventDefault()}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
            onDurationChange={(event) => setDuration(event.currentTarget.duration)}
          />
          <button
            type="button"
            className={styles.playPause}
            onClick={togglePlay}
            aria-label="Reproduzir"
            title="Reproduzir"
          >
            <PlayIcon size={30} />
          </button>
          <div className={styles.controlsBar}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={paused ? 'Reproduzir' : 'Pausar'}
              title={paused ? 'Reproduzir' : 'Pausar'}
            >
              {paused ? <PlayIcon /> : <PauseIcon />}
            </button>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              className={styles.seek}
              min={0}
              max={duration || 0}
              step="any"
              value={currentTime}
              onChange={handleSeek}
              onPointerDown={() => setSeeking(true)}
              onPointerUp={() => setSeeking(false)}
              onPointerCancel={() => setSeeking(false)}
              aria-label="Linha do tempo do vídeo"
            />
            <span className={styles.time}>{formatTime(duration)}</span>
            <button
              type="button"
              className={styles.controlButton}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
            >
              {isFullscreen ? <CompressIcon /> : <ExpandIcon />}
            </button>
          </div>
        </>
      ) : (
        <div
          className={styles.placeholder}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
          }}
        >
          <img
            className={styles.wordmark}
            src={wordmark}
            alt="Tocaê Reprodutor"
            draggable={false}
          />
          <p>Abra um vídeo ou arraste-o para cá</p>
        </div>
      )}

      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="video/*"
        onChange={handleFileChange}
      />
    </section>
  )
}

export default VideoPlayer