import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_SITE_SRC = 'https://marco.melega.ai/widgets/marco.js'
const MARCO_PAY_SRC = 'https://marco.melega.ai/widgets/marco-pay.v1.js'
const MARCO_SITE_ID = 'dsk_fcbd4464eb8347ae8ae7472700eec0d6'
type MarcoPayEvent = CustomEvent<Record<string, unknown>>
type Props = {
  application: string
  amount: string
  currency: string
  product?: string | null
  item: string
  reference: string
  onPassportResolved?: (event: MarcoPayEvent) => void
  onPaymentStarted?: (event: MarcoPayEvent) => void
  onPaymentCreated?: (event: MarcoPayEvent) => void
  onPaymentCompleted?: (event: MarcoPayEvent) => void
  onError?: (error: Error) => void
}
const Root = styled.div`
  min-height: 48px;
  width: 100%;
`

export const MarcoPay: React.FC<Props> = ({
  application,
  amount,
  currency,
  product,
  item,
  reference,
  onPassportResolved,
  onPaymentStarted,
  onPaymentCreated,
  onPaymentCompleted,
  onError,
}) => {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (!application || !hostRef.current) return undefined
    let cancelled = false
    let element: HTMLElement | null = null
    const listeners: Array<[string, EventListener]> = [
      ['marco-pay-mark:launch', ((event: MarcoPayEvent) => onPaymentStarted?.(event)) as EventListener],
      [
        'marco-pay-mark:error',
        ((event: MarcoPayEvent) => {
          const detail = event.detail ?? {}
          const message = detail.message ?? detail.error ?? detail.code ?? 'MARCO Pay is temporarily unavailable.'
          onError?.(new Error(String(message)))
        }) as EventListener,
      ],
      ['marco-pay:open', ((event: MarcoPayEvent) => onPaymentStarted?.(event)) as EventListener],
      ['marco-pay:paymentCreated', ((event: MarcoPayEvent) => onPaymentCreated?.(event)) as EventListener],
      ['marco-pay:paymentCompleted', ((event: MarcoPayEvent) => onPaymentCompleted?.(event)) as EventListener],
      [
        'marco-pay:error',
        ((event: MarcoPayEvent) => {
          const detail = event.detail ?? {}
          const message = detail.message ?? detail.error ?? detail.code ?? 'MARCO PAY is temporarily unavailable.'
          onError?.(new Error(String(message)))
        }) as EventListener,
      ],
      // Kept for forward compatibility with the passport event documented by MARCO Connect.
      ['marco-pay:passportResolved', ((event: MarcoPayEvent) => onPassportResolved?.(event)) as EventListener],
    ]
    void loadMarcoWidgetScript(
      MARCO_SITE_SRC,
      () => Boolean(document.querySelector(`script[src="${MARCO_SITE_SRC}"]`)),
      { 'data-marco-site': MARCO_SITE_ID },
    )
      .then(() => loadMarcoWidgetScript(MARCO_PAY_SRC, () => Boolean(window.customElements?.get('marco-pay'))))
      .then(
        () => {
          if (cancelled || !hostRef.current) return
          element = document.createElement('marco-pay')
          element.setAttribute('data-marco-deployment', application)
          element.setAttribute('application', application)
          if (product) element.setAttribute('product', product)
          element.setAttribute('amount', amount)
          element.setAttribute('currency', currency)
          element.setAttribute('item', item)
          element.setAttribute('reference', reference)
          element.setAttribute('theme', 'dark')
          listeners.forEach(([name, listener]) => element?.addEventListener(name, listener))
          hostRef.current.replaceChildren(element)
          setReady(true)
        },
        (cause) => {
          if (!cancelled) onError?.(cause instanceof Error ? cause : new Error(String(cause)))
        },
      )
    return () => {
      cancelled = true
      listeners.forEach(([name, listener]) => element?.removeEventListener(name, listener))
      element?.remove()
    }
  }, [
    amount,
    application,
    currency,
    product,
    item,
    reference,
    onError,
    onPassportResolved,
    onPaymentCompleted,
    onPaymentCreated,
    onPaymentStarted,
  ])
  return <Root ref={hostRef} data-testid="marco-pay" aria-busy={!ready} />
}

export default MarcoPay
