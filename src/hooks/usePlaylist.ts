import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { PlaylistItem } from '@shared/playlist'
import { baseNameFor } from '../lib/format'
import { isVideoFile, toMediaUrl } from '../lib/media'

const UNRESOLVED_ERROR = 'Não foi possível localizar os arquivos arrastados.'
const PLAYBACK_ERROR = 'Não foi possível reproduzir este vídeo.'

interface PlaylistState {
  items: PlaylistItem[]
  currentIndex: number
  error: string | null
  panelVisible: boolean
  loaded: boolean
  /** Ids duplicados recém-detectados, para o realce temporário das linhas. */
  pulseIds: string[]
}

/** O que "Limpar lista" remove, guardado para permitir o desfazer. */
export interface PlaylistSnapshot {
  items: PlaylistItem[]
  currentIndex: number
}

const INITIAL_STATE: PlaylistState = {
  items: [],
  currentIndex: -1,
  error: null,
  panelVisible: true,
  loaded: false,
  pulseIds: [],
}

/** Quanto tempo a linha duplicada fica realçada, em ms. */
const PULSE_MS = 1400
/** Teto de linhas realçadas ao mesmo tempo, para não virar um pisca-pisca. */
const PULSE_LIMIT = 8

function createEntry(filePath: string, fallbackName: string): PlaylistItem {
  return {
    id: crypto.randomUUID(),
    path: filePath,
    name: filePath ? baseNameFor(filePath) : fallbackName,
  }
}

export function usePlaylist() {
  const [state, setState] = useState<PlaylistState>(INITIAL_STATE)
  // Espelho sempre atual do estado: clear() precisa devolver os itens removidos
  // de forma síncrona, e setState não oferece esse retorno.
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => {
    if (state.pulseIds.length === 0) return
    const timer = window.setTimeout(() => {
      setState((prev) => (prev.pulseIds.length === 0 ? prev : { ...prev, pulseIds: [] }))
    }, PULSE_MS)
    return () => window.clearTimeout(timer)
  }, [state.pulseIds])

  useEffect(() => {
    let active = true
    const api = window.tocae
    if (!api) {
      setState((prev) => ({ ...prev, loaded: true }))
      return
    }

    api
      .readPlaylist()
      .then((items) => {
        if (active) setState((prev) => ({ ...prev, items, loaded: true }))
      })
      .catch(() => {
        if (active) setState((prev) => ({ ...prev, loaded: true }))
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!state.loaded) return
    const api = window.tocae
    if (!api) return
    void api.writePlaylist(state.items)
  }, [state.items, state.loaded])

  const addEntries = useCallback((entries: PlaylistItem[]) => {
    if (entries.length === 0) return

    setState((prev) => {
      const known = new Map(prev.items.map((item) => [item.path, item.id]))
      const fresh: PlaylistItem[] = []
      const duplicates: string[] = []
      for (const entry of entries) {
        const existingId = known.get(entry.path)
        if (existingId) {
          // Já está na lista: realça a linha existente em vez de ignorar em silêncio.
          duplicates.push(existingId)
          continue
        }
        known.set(entry.path, entry.id)
        fresh.push(entry)
      }
      if (fresh.length === 0 && duplicates.length === 0) return prev

      const pulseIds = [...new Set([...prev.pulseIds, ...duplicates])].slice(-PULSE_LIMIT)

      return {
        ...prev,
        items: fresh.length > 0 ? [...prev.items, ...fresh] : prev.items,
        currentIndex:
          fresh.length === 0
            ? prev.currentIndex
            : prev.currentIndex === -1
              ? prev.items.length
              : prev.currentIndex,
        error: fresh.length > 0 ? null : prev.error,
        pulseIds,
      }
    })
  }, [])

  const addPaths = useCallback(
    (paths: string[]) => {
      addEntries(
        paths
          .filter((filePath) => filePath.length > 0)
          .map((filePath) => createEntry(filePath, filePath)),
      )
    },
    [addEntries],
  )

  const addFiles = useCallback(
    (files: File[]) => {
      const api = window.tocae
      const entries: PlaylistItem[] = []
      let unresolved = 0

      for (const file of files) {
        if (!isVideoFile(file)) {
          unresolved += 1
          continue
        }
        const filePath = api ? api.getPathForFile(file) : ''
        if (!filePath) {
          unresolved += 1
          continue
        }
        entries.push(createEntry(filePath, file.name))
      }

      if (entries.length === 0) {
        if (unresolved > 0) setState((prev) => ({ ...prev, error: UNRESOLVED_ERROR }))
        return
      }

      addEntries(entries)
    },
    [addEntries],
  )

  const playIndex = useCallback((index: number) => {
    setState((prev) =>
      index >= 0 && index < prev.items.length ? { ...prev, currentIndex: index, error: null } : prev,
    )
  }, [])

  const step = useCallback((delta: number) => {
    setState((prev) => {
      const target = prev.currentIndex + delta
      if (target < 0 || target >= prev.items.length) return prev
      return { ...prev, currentIndex: target, error: null }
    })
  }, [])

  const next = useCallback(() => step(1), [step])
  const previous = useCallback(() => step(-1), [step])

  const failCurrent = useCallback(() => {
    setState((prev) => {
      const hasNextItem = prev.currentIndex >= 0 && prev.currentIndex + 1 < prev.items.length
      if (hasNextItem) return { ...prev, currentIndex: prev.currentIndex + 1 }
      return { ...prev, currentIndex: -1, error: PLAYBACK_ERROR }
    })
  }, [])

  const move = useCallback((from: number, to: number) => {
    setState((prev) => {
      if (from === to) return prev
      if (from < 0 || from >= prev.items.length) return prev
      if (to < 0 || to >= prev.items.length) return prev

      const currentId = prev.items[prev.currentIndex]?.id
      const items = [...prev.items]
      const [moved] = items.splice(from, 1)
      items.splice(to, 0, moved)

      return {
        ...prev,
        items,
        currentIndex: currentId ? items.findIndex((item) => item.id === currentId) : -1,
      }
    })
  }, [])

  const remove = useCallback((id: string) => {
    setState((prev) => {
      const index = prev.items.findIndex((item) => item.id === id)
      if (index === -1) return prev

      const items = prev.items.filter((item) => item.id !== id)
      if (items.length === 0) return { ...prev, items, currentIndex: -1, error: null }

      let currentIndex = prev.currentIndex
      if (index < prev.currentIndex) currentIndex = prev.currentIndex - 1
      else if (index === prev.currentIndex) currentIndex = Math.min(prev.currentIndex, items.length - 1)

      return { ...prev, items, currentIndex, error: null }
    })
  }, [])

  /** Limpa a lista devolvendo o que foi removido, ou null se já estava vazia. */
  const clear = useCallback((): PlaylistSnapshot | null => {
    const prev = stateRef.current
    if (prev.items.length === 0) return null

    const snapshot: PlaylistSnapshot = { items: prev.items, currentIndex: prev.currentIndex }
    setState((s) =>
      s.items.length === 0 && s.currentIndex === -1
        ? s
        : { ...s, items: [], currentIndex: -1, error: null, pulseIds: [] },
    )
    return snapshot
  }, [])

  const restore = useCallback((snapshot: PlaylistSnapshot) => {
    setState((prev) => {
      const items = [...snapshot.items]
      const currentIndex =
        snapshot.currentIndex >= 0 && snapshot.currentIndex < items.length ? snapshot.currentIndex : -1
      return { ...prev, items, currentIndex, error: null, pulseIds: [] }
    })
  }, [])

  const togglePanel = useCallback(() => {
    setState((prev) => ({ ...prev, panelVisible: !prev.panelVisible }))
  }, [])

  const pulseIds = useMemo(() => new Set(state.pulseIds), [state.pulseIds])

  return useMemo(
    () => ({
      items: state.items,
      pulseIds,
      currentIndex: state.currentIndex,
      current: state.currentIndex >= 0 ? (state.items[state.currentIndex] ?? null) : null,
      source:
        state.currentIndex >= 0 && state.items[state.currentIndex]
          ? toMediaUrl(state.items[state.currentIndex].path)
          : null,
      error: state.error,
      panelVisible: state.panelVisible,
      loaded: state.loaded,
      hasNext: state.currentIndex >= 0 && state.currentIndex + 1 < state.items.length,
      hasPrevious: state.currentIndex > 0,
      addPaths,
      addFiles,
      playIndex,
      next,
      previous,
      move,
      remove,
      clear,
      restore,
      togglePanel,
      failCurrent,
    }),
    [
      state.items,
      pulseIds,
      state.currentIndex,
      state.error,
      state.panelVisible,
      state.loaded,
      addPaths,
      addFiles,
      playIndex,
      next,
      previous,
      move,
      remove,
      clear,
      restore,
      togglePanel,
      failCurrent,
    ],
  )
}
