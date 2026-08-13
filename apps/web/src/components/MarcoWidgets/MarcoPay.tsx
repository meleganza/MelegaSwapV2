import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_PAY_SRC = 'https://marco.melega.ai/widgets/marco-pay.v1.js'
type MarcoPayEvent = CustomEvent<Record<string, unknown>>
type Props = {
  application: string
  amount: string
  currency: string
  item: string
  onPassportResolved?: (event: MarcoPayEvent) => void
  onPaymentStarted?: (event: MarcoPayEvent) => void
  onPaymentCreated?: (event: MarcoPayEvent) => void
  onPaymentCompleted?: (event: MarcoPayEvent) => void
  onError?: (error: Error) => void
}
const Root = styled.div`min-height: 48px; width: 100%;`

export const MarcoPay: React.FC<Props> = ({ application, amount, currency, item, onPassportResolved, onPaymentStarted, onPaymentCreated, onPaymentCompleted, onError }) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!application || !hostRef.current) return undefined
    let cancelled = false
    let element: HTMLElement | null = null
    const listeners: Array<[string, EventListener]> = [
      ['passportResolved', ((event: MarcoPayEvent) => onPassportResolved?.(event)) as EventListener],
      ['paymentStarted', ((event: MarcoPayEvent) => onPaymentStarted?.(event)) as EventListener],
      ['paymentCreated', ((event: MarcoPayEvent) => onPaymentCreated?.(event)) as EventListener],
      ['paymentCompleted', ((event: MarcoPayEvent) => onPaymentCompleted?.(event)) as EventListener],
    ]
    void loadMarcoWidgetScript(MARCO_PAY_SRC, () => Boolean(window.customElements?.get('marco-pay'))).then(
      () => {
        if (cancelled || !hostRef.current) return
        element = document.createElement('marco-pay')
        element.setAttribute('application', application)
        element.setAttribute('amount', amount)
        element.setAttribute('currency', currency)
        element.setAttribute('item', item)
        element.setAttribute('theme', 'dark')
        element.setAttribute('size', 'standard')
        listeners.forEach(([name, listener]) => element?.addEventListener(name, listener))
        hostRef.current.replaceChildren(element)
        setReady(true)
      },
      (cause) => { if (!cancelled) onError?.(cause instanceof Error ? cause : new Error(String(cause))) },
    )
    return () => {
      cancelled = true
      listeners.forEach(([name, listener]) => element?.removeEventListener(name, listener))
      element?.remove()
    }
  }, [amount, application, currency, item, onError, onPassportResolved, onPaymentCompleted, onPaymentCreated, onPaymentStarted])
  return <Root ref={hostRef} data-testid="marco-pay" aria-busy={!ready} />
}

export default MarcoPay
