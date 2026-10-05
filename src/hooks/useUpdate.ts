import { useEffect, useState } from 'react'
import type { UpdateEvent } from '@shared/ipc'

export type UpdateState =
  | { status: 'idle' }
  | { status: 'available'; version: string }
  | { status: 'downloading'; version: string; percent: number }
  | { status: 'ready'; version: string }
  | { status: 'error'; message: string }

/**
 * Escuta o main sobre novas versões.
 *
 * O download é automático, então os estados intermediários (available →
 * downloading → ready) vêm por eventos em vez de uma única promessa.
 */
export function useUpdate(): { state: UpdateState; install: () => void; dismiss: () => void } {
  const [state, setState] = useState<UpdateState>({ status: 'idle' })

  useEffect(() => {
    const api = window.tocae
    if (!api) return

    return api.onUpdateEvent((event: UpdateEvent) => {
      setState((prev) => {
        switch (event.status) {
          case 'available':
            return { status: 'available', version: event.version }
          case 'downloading':
            // `available` já carrega a versão; se o progresso chegar antes
            // dele, a notificação inicial ainda não tem versão para exibir.
            return {
              status: 'downloading',
              version: prev.status === 'available' || prev.status === 'downloading' ? prev.version : '',
              percent: event.percent,
            }
          case 'ready':
            return { status: 'ready', version: event.version }
          case 'error':
            return { status: 'error', message: event.message }
        }
      })
    })
  }, [])

  return {
    state,
    install: () => window.tocae?.installUpdate(),
    // Um erro de verificação é informativo: some sozinho para não tomar a tela.
    dismiss: () => setState({ status: 'idle' }),
  }
}