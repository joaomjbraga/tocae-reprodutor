import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, CSSProperties, DragEvent, SyntheticEvent } from 'react'
import {
  Loader2,
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
import { useI18n } from '../i18n'
import wordmark from '../assets/tocae-wordmark.png'
import styles from './VideoPlayer.module.css'

/** Tempo parado até os controles do player se esconderem. */
const IDLE_DELAY_MS = 2500

/** A timeline desenha o progresso com um custom property lido pelo CSS do trilho. */
type SeekStyle = CSSProperties & { '--progress': string }

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
  const { t } = useI18n()
  const areaRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const failedSourceRef = useRef<string | null>(null)
  const idleTimerRef = useRef<number | null>(null)
  const [playing, setPlaying] = useState(false)
  const [buffering, setBuffering] = useState(false)
  const [idle, setIdle] = useState(false)
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
    setBuffering(false)
    setIdle(false)
  }, [source])

  // Controles se escondem depois de um tempo parado durante a reprodução,
  // como em qualquer player de vídeo. Qualquer interação traz de volta.
  useEffect(() => {
    if (!playing) {
      setIdle(false)
      return
    }

    const wake = () => {
      setIdle(false)
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
      idleTimerRef.current = window.setTimeout(() => setIdle(true), IDLE_DELAY_MS)
    }

    wake()
    const events: (keyof WindowEventMap)[] = ['mousemove', 'keydown', 'pointerdown', 'touchstart', 'wheel']
    events.forEach((type) => window.addEventListener(type, wake, { passive: true }))
    return () => {
      events.forEach((type) => window.removeEventListener(type, wake))
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current)
    }
  }, [playing])

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
    <VolumeX size={16} />
  ) : volume < 0.5 ? (
    <Volume1 size={16} />
  ) : (
    <Volume2 size={16} />
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
  const progressPercent = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0

  return (
    <section
      ref={areaRef}
      className={`${styles.videoArea} ${dragging ? styles.dragging : ''} ${playing ? styles.playing : styles.paused} ${idle ? styles.idle : ''}`}
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
            onPlay={() => {
              setPlaying(true)
              setBuffering(false)
            }}
            onPause={() => setPlaying(false)}
            onWaiting={() => setBuffering(true)}
            onPlaying={() => setBuffering(false)}
            onCanPlay={() => setBuffering(false)}
            onSeeked={() => setBuffering(false)}
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
            aria-label={t('player.play')}
            title={t('player.play')}
          >
            <Play size={24} />
          </button>
          {buffering && (
            <div className={styles.buffer} role="status" aria-live="polite">
              <Loader2 size={28} className={styles.spinner} />
              <span className="sr-only">{t('player.loadingVideo')}</span>
            </div>
          )}
          <div className={styles.controlsBar}>
            <button
              type="button"
              className={styles.controlButton}
              onClick={togglePlay}
              aria-label={paused ? t('player.play') : t('player.pause')}
              title={paused ? t('player.play') : t('player.pause')}
            >
              {paused ? <Play size={16} /> : <Pause size={16} />}
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onPrevious}
              disabled={!hasPrevious}
              aria-label={t('player.previous')}
              title={t('player.previousTitle')}
            >
              <SkipBack size={16} />
            </button>
            <button
              type="button"
              className={styles.controlButton}
              onClick={onNext}
              disabled={!hasNext}
              aria-label={t('player.next')}
              title={t('player.nextTitle')}
            >
              <SkipForward size={16} />
            </button>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <input
              type="range"
              className={styles.seek}
              style={{ '--progress': `${progressPercent}%` } as SeekStyle}
              min={0}
              max={duration || 0}
              step="any"
              value={currentTime}
              onChange={handleSeek}
              onPointerDown={() => setSeeking(true)}
              onPointerUp={() => setSeeking(false)}
              onPointerCancel={() => setSeeking(false)}
              aria-label={t('player.timeline')}
              aria-valuetext={t('player.timelineValue', {
                current: formatTime(currentTime),
                total: formatTime(duration),
              })}
            />
            <span className={styles.time}>{formatTime(duration)}</span>
            <div className={styles.volume}>
              <button
                type="button"
                className={styles.controlButton}
                onClick={toggleMute}
                aria-label={muted ? t('player.unmute') : t('player.mute')}
                title={muted ? t('player.unmute') : t('player.mute')}
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
                aria-label={t('player.volume')}
              />
            </div>
            <button
              type="button"
              className={styles.controlButton}
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}
              title={isFullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
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
          <p>{message ?? t('player.dropHint')}</p>
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
