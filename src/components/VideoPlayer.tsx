import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, SyntheticEvent } from 'react'
import {
  CompressIcon,
  ExpandIcon,
  PauseIcon,
  PlayIcon,
  VolumeHighIcon,
  VolumeLowIcon,
  VolumeMuteIcon,
} from './icons'
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
  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)

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

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null
      const isButton = target instanceof HTMLButtonElement || target instanceof HTMLAnchorElement
      switch (event.key) {
        case 'f':
        case 'F':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'm':
        case 'M':
          event.preventDefault()
          toggleMute()
          break
        case ' ':
          if (isButton) break
          event.preventDefault()
          togglePlay()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
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

  function handleVolumeChange(event: ChangeEvent<HTMLInputElement>) {
    applyVolume(Number(event.target.value))
  }

  function applyVolume(value: number) {
    const video = videoRef.current
    if (!video) return
    const clamped = Math.min(1, Math.max(0, value))
    video.volume = clamped
    if (clamped > 0 && video.muted) {
      video.muted = false
      setMuted(false)
    }
    setVolume(clamped)
  }

  function handleVolumeSync(event: SyntheticEvent<HTMLVideoElement>) {
    setVolume(event.currentTarget.volume)
    setMuted(event.currentTarget.muted)
  }

  function toggleMute() {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
  }

  const volumeIcon = muted || volume === 0
    ? <VolumeMuteIcon />
    : volume < 0.5
      ? <VolumeLowIcon />
      : <VolumeHighIcon />

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
            muted={muted}
            onClick={togglePlay}
            onContextMenu={(event) => event.preventDefault()}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={handleTimeUpdate}
            onVolumeChange={handleVolumeSync}
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
            <div className={styles.volume}>
              <button
                type="button"
                className={styles.controlButton}
                onClick={toggleMute}
                aria-label={muted ? 'Ativar som' : 'Silenciar'}
                title={muted ? 'Ativar som' : 'Silenciar'}
              >
                {volumeIcon}
              </button>
              <input
                type="range"
                className={styles.volumeSlider}
                min={0}
                max={1}
                step={0.01}
                value={muted ? 0 : volume}
                onChange={handleVolumeChange}
                aria-label="Volume"
              />
            </div>
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