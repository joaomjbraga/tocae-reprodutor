import { useCallback, useEffect, useMemo, useState } from 'react'
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
}

const INITIAL_STATE: PlaylistState = {
  items: [],
  currentIndex: -1,
  error: null,
  panelVisible: true,
  loaded: false,
}

function createEntry(filePath: string, fallbackName: string): PlaylistItem {
  return {
    id: crypto.randomUUID(),
    path: filePath,
    name: filePath ? baseNameFor(filePath) : fallbackName,
  }
}

export function usePlaylist() {
  const [state, setState] = useState<PlaylistState>(INITIAL_STATE)

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
      const known = new Set(prev.items.map((item) => item.path))
      const fresh: PlaylistItem[] = []
      for (const entry of entries) {
        if (known.has(entry.path)) continue
        known.add(entry.path)
        fresh.push(entry)
      }
      if (fresh.length === 0) return prev

      return {
        ...prev,
        items: [...prev.items, ...fresh],
        currentIndex: prev.currentIndex === -1 ? prev.items.length : prev.currentIndex,
        error: null,
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

  const clear = useCallback(() => {
    setState((prev) =>
      prev.items.length === 0 && prev.currentIndex === -1
        ? prev
        : { ...prev, items: [], currentIndex: -1, error: null },
    )
  }, [])

  const togglePanel = useCallback(() => {
    setState((prev) => ({ ...prev, panelVisible: !prev.panelVisible }))
  }, [])

  return useMemo(
    () => ({
      items: state.items,
      currentIndex: state.currentIndex,
      current: state.currentIndex >= 0 ? (state.items[state.currentIndex] ?? null) : null,
      source:
        state.currentIndex >= 0 && state.items[state.currentIndex]
          ? toMediaUrl(state.items[state.currentIndex].path)
          : null,
      error: state.error,
      panelVisible: state.panelVisible,
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
      togglePanel,
      failCurrent,
    }),
    [
      state.items,
      state.currentIndex,
      state.error,
      state.panelVisible,
      addPaths,
      addFiles,
      playIndex,
      next,
      previous,
      move,
      remove,
      clear,
      togglePanel,
      failCurrent,
    ],
  )
}
