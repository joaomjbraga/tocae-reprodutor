import { useCallback, useEffect, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent } from 'react'
import { Check, Languages } from 'lucide-react'
import { LOCALE_NAMES, SUPPORTED_LOCALES } from '@shared/i18n'
import type { Locale } from '@shared/i18n'
import { useI18n } from '../i18n'
import styles from './LanguageSwitcher.module.css'

/** Código curto exibido no gatilho: cabe na barra superior. */
const LOCALE_CODES: Record<Locale, string> = {
  'pt-BR': 'PT-BR',
  en: 'EN',
}

const MENU_ITEM_SELECTOR = '[role="menuitemradio"]'

/**
 * Seletor de idioma.
 *
 * Segue o padrão de menu da ARIA: o gatilho abre com `aria-expanded`, as
 * opções são `menuitemradio` e as setas movem o foco entre elas.
 */
function LanguageSwitcher() {
  const { locale, systemLocale, source, setLocale, t } = useI18n()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  // Clique fora fecha o menu.
  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (target instanceof Node && !rootRef.current?.contains(target)) setOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [open])

  // Escape fecha o menu e devolve o foco ao gatilho.
  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.stopPropagation()
      close(true)
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, close])

  // Ao abrir, o foco vai para a primeira opção.
  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLButtonElement>(MENU_ITEM_SELECTOR)?.focus()
  }, [open])

  function handleMenuKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const items = Array.from(
      menuRef.current?.querySelectorAll<HTMLButtonElement>(MENU_ITEM_SELECTOR) ?? [],
    )
    if (items.length === 0) return

    const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement)
    let nextIndex = -1

    if (event.key === 'ArrowDown') nextIndex = (currentIndex + 1) % items.length
    else if (event.key === 'ArrowUp') nextIndex = (currentIndex - 1 + items.length) % items.length
    else if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1

    if (nextIndex === -1) return
    event.preventDefault()
    items[nextIndex]?.focus()
  }

  function choose(next: Locale | null) {
    setLocale(next)
    close(true)
  }

  return (
    <div className={styles.root} ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`${styles.trigger} ${open ? styles.open : ''}`}
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t('language.button')}
        title={t('language.button')}
      >
        <Languages size={16} aria-hidden="true" />
        <span className={styles.code}>{LOCALE_CODES[locale]}</span>
      </button>

      {open && (
        <div
          ref={menuRef}
          className={styles.menu}
          role="menu"
          aria-label={t('language.menu')}
          onKeyDown={handleMenuKeyDown}
        >
          <button
            type="button"
            role="menuitemradio"
            aria-checked={source === 'system'}
            className={styles.item}
            onClick={() => choose(null)}
          >
            <span className={styles.itemText}>
              {t('language.system')}
              <span className={styles.itemHint}>
                {t('language.systemHint', { locale: LOCALE_NAMES[systemLocale] })}
              </span>
            </span>
            {source === 'system' && <Check size={14} aria-hidden="true" />}
          </button>

          {SUPPORTED_LOCALES.map((option) => {
            const checked = source === 'user' && option === locale
            return (
              <button
                key={option}
                type="button"
                role="menuitemradio"
                aria-checked={checked}
                className={styles.item}
                onClick={() => choose(option)}
              >
                <span className={styles.itemText}>{LOCALE_NAMES[option]}</span>
                {checked && <Check size={14} aria-hidden="true" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LanguageSwitcher
