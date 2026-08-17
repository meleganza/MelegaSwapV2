import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'
import { loadMarcoWidgetScript } from './loadMarcoWidgetScript'

const MARCO_SITE_SRC = 'https://marco.melega.ai/widgets/marco.js'
const MARCO_PAY_SRC = 'https://marco.melega.ai/widgets/marco-pay-mark.v1.js'
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

type ServerSession = {
  paymentId: string
  approvalUrl: string
}

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
  const sessionRef = useRef<ServerSession | null>(null)
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
    const openServerApproval = (event: Event) => {
      event.preventDefault()
      event.stopPropagation()
      const session = sessionRef.current
      if (!session) return
      onPaymentStarted?.(new CustomEvent('marco-pay-mark:launch', { detail: { paymentId: session.paymentId } }))
      window.open(session.approvalUrl, 'marco-pay', 'noopener,width=460,height=760')
      onPaymentCreated?.(new CustomEvent('marco-pay:paymentCreated', { detail: { paymentId: session.paymentId } }))
    }
    const loadSession = async (): Promise<ServerSession | null> => {
      for (let attempt = 0; attempt < 4 && !cancelled; attempt += 1) {
        const response = await fetch(`/api/marco-pay/orders?orderId=${encodeURIComponent(reference)}`, {
          cache: 'no-store',
        })
        if (response.ok) {
          const payload = (await response.json()) as {
            order?: { paymentId?: string | null; approvalUrl?: string | null }
          }
          const paymentId = String(payload.order?.paymentId || '').trim()
          const approvalUrl = String(payload.order?.approvalUrl || '').trim()
          if (paymentId && approvalUrl) return { paymentId, approvalUrl }
        }
        await new Promise((resolve) => window.setTimeout(resolve, 250 * (attempt + 1)))
      }
      return null
    }
    void loadMarcoWidgetScript(
      MARCO_SITE_SRC,
      () => Boolean(document.querySelector(`script[src="${MARCO_SITE_SRC}"]`)),
      { 'data-marco-site': MARCO_SITE_ID },
    )
      .then(() => loadMarcoWidgetScript(MARCO_PAY_SRC, () => Boolean(window.customElements?.get('marco-pay-mark'))))
      .then(async () => {
        try {
          const session = await loadSession()
          if (cancelled || !hostRef.current) return
          if (!session) {
            onError?.(new Error('MARCO Pay is temporarily unavailable.'))
            return
          }
          sessionRef.current = session
          // The public mark stays the visible launcher. The unsigned embed
          // runtime is intercepted so approval opens the server-created payment.
          element = document.createElement('marco-pay-mark')
          element.setAttribute('mode', 'button')
          element.setAttribute('size', 'large')
          element.setAttribute('shape', 'rounded')
          element.setAttribute('application', application)
          if (product) element.setAttribute('product', product)
          element.setAttribute('amount', amount)
          element.setAttribute('currency', currency)
          element.setAttribute('item', item)
          element.setAttribute('reference', reference)
          element.setAttribute('theme', 'dark')
          listeners.forEach(([name, listener]) => element?.addEventListener(name, listener))
          hostRef.current.replaceChildren(element)
          hostRef.current.addEventListener('click', openServerApproval, true)
          setReady(true)
        } catch (cause) {
          if (!cancelled) onError?.(cause instanceof Error ? cause : new Error(String(cause)))
        }
      }, (cause) => {
        if (!cancelled) onError?.(cause instanceof Error ? cause : new Error(String(cause)))
      })
    return () => {
      cancelled = true
      sessionRef.current = null
      hostRef.current?.removeEventListener('click', openServerApproval, true)
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
