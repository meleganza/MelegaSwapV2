import React, { useCallback } from 'react'
import styled from 'styled-components'
import {
  assignMarcoPayHandoff,
  isMarcoPayWalletFlightActive,
  openMarcoPayHandoffWindow,
  readMarcoPayHandoffSession,
} from 'lib/marco-pay/approval'

const MARCO_PAY_MARK_SRC = 'https://marco.melega.ai/brand/marco-pay/marco-pay-large-dark.svg'
type MarcoPayEvent = CustomEvent<Record<string, unknown>>
type Props = {
  application: string
  amount: string
  currency: string
  product?: string | null
  item: string
  reference: string
  paymentId?: string | null
  approvalUrl?: string | null
  onLaunch?: () => void
  onPaymentStarted?: (event: MarcoPayEvent) => void
  onPaymentCreated?: (event: MarcoPayEvent) => void
  onPaymentCompleted?: (event: MarcoPayEvent) => void
  onError?: (error: Error) => void
}

const Root = styled.div`
  min-height: 48px;
  width: 100%;
`

const Launch = styled.button`
  appearance: none;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
`

const Mark = styled.img`
  height: 48px;
  width: auto;
  max-width: 100%;
  object-fit: contain;
`

export const MarcoPay: React.FC<Props> = ({
  paymentId,
  approvalUrl,
  onLaunch,
  onPaymentStarted,
  onPaymentCreated,
  onError,
}) => {
  const launchApproval = useCallback(() => {
    if (isMarcoPayWalletFlightActive()) return
    if (onLaunch) {
      onLaunch()
      return
    }
    const popup = openMarcoPayHandoffWindow()
    const session = readMarcoPayHandoffSession({ payment_id: paymentId, approval_url: approvalUrl })
    if (!assignMarcoPayHandoff(popup, session)) {
      onError?.(new Error('MARCO Pay is temporarily unavailable.'))
      return
    }
    onPaymentStarted?.(new CustomEvent('marco-pay:open', { detail: { paymentId: session.paymentId } }))
    onPaymentCreated?.(new CustomEvent('marco-pay:paymentCreated', { detail: { paymentId: session.paymentId } }))
  }, [approvalUrl, onError, onLaunch, onPaymentCreated, onPaymentStarted, paymentId])

  return (
    <Root data-testid="marco-pay">
      <Launch type="button" onClick={launchApproval} aria-label="Complete in MARCO Pay">
        <Mark src={MARCO_PAY_MARK_SRC} alt="" />
      </Launch>
    </Root>
  )
}

export default MarcoPay
