import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { translate } from '@shared/i18n'
import type { Locale, MessageKey, TranslationParams } from '@shared/i18n'
import type { LocaleSource, TocaeApi } from '@shared/ipc'
import { detectSystemLocale } from './detect'

export type I18nContextValue = {
  /** Idioma em uso. */
  locale: Locale
  /** Idioma detectado do sistema operacional. */
  systemLocale: Locale
  /** `user` quando há escolha manual; `system` quando segue o sistema. */
  source: LocaleSource
  /** Troca o idioma; `null` volta para "seguir o sistema". */
  setLocale: (locale: Locale | null) => void
  /** Traduz uma chave do catálogo. */
  t: (key: MessageKey, params?: TranslationParams) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

/**
 * Contexto de idioma da aplicação.
 *
 * A resolução segue esta ordem: escolha salva pelo usuário, depois o idioma
 * do sistema operacional e, por fim, o português (Brasil). A troca é
 * propagada pelo processo principal para as outras janelas, que são outras
 * instâncias do mesmo renderer.
 */
function I18nProvider({ children }: { children: ReactNode }) {
  const api = window.tocae as TocaeApi | undefined

  // Começa no idioma do sistema e é corrigido pelo processo principal, que
  // conhece a preferência salva.
  const [locale, setLocaleState] = useState<Locale>(detectSystemLocale)
  const [systemLocale, setSystemLocale] = useState<Locale>(detectSystemLocale)
  const [source, setSource] = useState<LocaleSource>('system')

  useEffect(() => {
    if (!api) return

    let active = true
    void api
      .getLocale()
      .then((info) => {
        if (!active) return
        setLocaleState(info.locale)
        setSystemLocale(info.system)
        setSource(info.source)
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [api])

  // Outra janela trocou o idioma: acompanhar a mudança.
  useEffect(() => {
    if (!api) return

    return api.onCommand((command) => {
      if (command.type !== 'locale-changed') return
      setLocaleState(command.locale)
      setSource(command.source)
    })
  }, [api])

  const setLocale = useCallback(
    (next: Locale | null) => {
      // Aplica na hora e persiste em paralelo: a interface responde sem
      // esperar o disco.
      setLocaleState(next ?? systemLocale)
      setSource(next === null ? 'system' : 'user')
      void api?.setLocale(next)
    },
    [api, systemLocale],
  )

  // `lang` no <html> acompanha o idioma, para leitores de tela e para o
  // tradutor do navegador.
  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const t = useCallback(
    (key: MessageKey, params?: TranslationParams) => translate(locale, key, params),
    [locale],
  )

  const value = useMemo<I18nContextValue>(
    () => ({ locale, systemLocale, source, setLocale, t }),
    [locale, systemLocale, source, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext)
  if (!context) throw new Error('useI18n precisa estar dentro de <I18nProvider>')
  return context
}

export { I18nProvider }
