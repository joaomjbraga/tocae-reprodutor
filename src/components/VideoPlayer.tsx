import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, SyntheticEvent } from 'react'
import {
  Maximize,
  Minimize,
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume1,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { formatTime } from '../lib/format'
import wordmark from '../assets/tocae-wordmark.png'
import styles from './VideoPlayer.module.css'

type VideoPlayerProps = {
  source: string | null
  message: string | null
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  onEnded: () => void
  onFailed: () => void
  onFilesSelected: (files: File[]) => void
}

function VideoPlayer({
  source,
  message,
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  onEnded,
  onFailed,
  onFilesSelected,
}: VideoPlayerProps) {
  const areaRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const failedSourceRef = useRef<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [dragging, setDragging] = useState(false)
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
    failedSourceRef.current = null
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
  }, [source])

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

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? [])
    event.target.value = ''
    if (files.length > 0) onFilesSelected(files)
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault()
    setDragging(false)
    const files = Array.from(event.dataTransfer.files)
    if (files.length > 0) onFilesSelected(files)
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

  function handleEnded() {
    setPlaying(false)
    onEnded()
  }

  function handleError(event: SyntheticEvent<HTMLVideoElement>) {
    const video = event.currentTarget
    const code = video.error?.code ?? 0
    if (code === 0 || code === 1 || code === 2) return
    if (failedSourceRef.current === source) return
    failedSourceRef.current = source
    setPlaying(false)
    onFailed()
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

  const volumeIcon = muted || volume === 0 ? (
    <VolumeX />
  ) : volume < 0.5 ? (
    <Volume1 />
  ) : (
    <Volume2 />
  )

  function toggleFullscreen() {
    const area = areaRef.current
    if (!area) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void area.requestFullscreen()
    }
  }

  const hasVideo = source !== null
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
            key={source}
            ref={videoRef}
            className={styles.video}
            src={source ?? undefined}
            autoPlay
            controls={false}
            muted={muted}
            onClick={togglePlay}
            onContextMenu={(event) => event.preventDefault()}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={handleEnded}
            onError={handleError}
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
            <Play size={30} />
          </button>
          <div className={styles.controlsBar}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={paused ? 'Reproduzir' : 'Pausar'}
              title={paused ? 'Reproduzir' : 'Pausar'}
            >
              {paused ? <Play /> : <Pause />}
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onPrevious}
              disabled={!hasPrevious}
              aria-label="Vídeo anterior"
              title="Vídeo anterior (P)"
            >
              <SkipBack />
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onNext}
              disabled={!hasNext}
              aria-label="Próximo vídeo"
              title="Próximo vídeo (N)"
            >
              <SkipForward />
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
              {isFullscreen ? <Minimize /> : <Maximize />}
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
          <p>{message ?? 'Abra um vídeo ou arraste-o para aqui'}</p>
        </div>
      )}

      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
      />
    </section>
  )
}

export default VideoPlayer
