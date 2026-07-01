import React, { useEffect } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { TradeMelegaIsologo } from './TradeMelegaIsologo'

const SCOPE = '[data-trade-terminal-screen]'
const BUTTON_SELECTOR = '.open-currency-select-button, [class*="OpenCurrencySelectButton"]'

const isMarcoButton = (btn: Element) => /MARCO/i.test(btn.textContent ?? '')

/** Presentation-only: swap MARCO token glyphs for official Melega isologo SVG. */
export const TradeMarcoIconPatch: React.FC = () => {
  useEffect(() => {
    const roots = new Map<Element, Root>()

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
          slot = document.createElement('span')
          slot.setAttribute('data-melega-marco-icon', 'true')
          slot.style.display = 'inline-flex'
          slot.style.alignItems = 'center'
          slot.style.marginRight = '6px'
          btn.insertBefore(slot, btn.firstChild)
          const root = createRoot(slot)
          roots.set(slot, root)
          root.render(<TradeMelegaIsologo size={22} />)
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
      roots.forEach((root, el) => {
        root.unmount()
        el.remove()
      })
      roots.clear()
    }
  }, [])

  return null
}

export default TradeMarcoIconPatch
