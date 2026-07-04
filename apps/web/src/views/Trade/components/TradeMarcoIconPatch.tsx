import React, { useEffect } from 'react'
import { MARCO_LOGO_URI } from 'design-system/melega/constants/brand'

const SCOPE = '[data-trade-terminal-screen]'
const BUTTON_SELECTOR = '.open-currency-select-button, [class*="OpenCurrencySelectButton"]'

const isMarcoButton = (btn: Element) => /MARCO/i.test(btn.textContent ?? '')

/** Presentation-only: ensure MARCO currency buttons use the official token logo. */
export const TradeMarcoIconPatch: React.FC = () => {
  useEffect(() => {
    const patch = () => {
      const scope = document.querySelector(SCOPE)
      if (!scope) return

      scope.querySelectorAll(BUTTON_SELECTOR).forEach((btn) => {
        if (!isMarcoButton(btn)) return

        btn.querySelectorAll('img, picture, [class*="TokenImage"], [class*="CurrencyLogo"]').forEach((node) => {
          ;(node as HTMLElement).style.display = 'none'
        })

        let slot = btn.querySelector('[data-melega-marco-icon]') as HTMLElement | null
        if (!slot) {
          slot = document.createElement('img')
          slot.setAttribute('data-melega-marco-icon', 'true')
          slot.setAttribute('src', MARCO_LOGO_URI)
          slot.setAttribute('alt', '')
          slot.style.width = '22px'
          slot.style.height = '22px'
          slot.style.borderRadius = '50%'
          slot.style.objectFit = 'cover'
          slot.style.display = 'inline-block'
          slot.style.marginRight = '6px'
          btn.insertBefore(slot, btn.firstChild)
        }
      })
    }

    patch()
    const scope = document.querySelector(SCOPE)
    if (!scope) return undefined

    const observer = new MutationObserver(patch)
    observer.observe(scope, { childList: true, subtree: true, characterData: true })

    return () => {
      observer.disconnect()
    }
  }, [])

  return null
}

export default TradeMarcoIconPatch
