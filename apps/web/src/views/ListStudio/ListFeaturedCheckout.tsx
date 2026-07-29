/**
 * Optional Featured Home checkout for Claim Project / Create Project Page.
 * Never blocks the parent flow when declined or payment fails.
 */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { FEATURED_OFFER, type FeaturedPayAsset } from 'lib/featured-placement/constants'
import { cashbackUserMessage } from 'lib/featured-placement/cashback'

const Card = styled.section`
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background:
    radial-gradient(ellipse 80% 60% at 10% 0%, rgba(244, 196, 48, 0.12), transparent 55%),
    linear-gradient(165deg, rgba(22, 20, 12, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #f5f5f5;
`

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 17px;
  color: #a8a8a8;
`

const PriceMain = styled.span`
  font-size: 20px;
  font-weight: 800;
  color: #f2c84c;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid
    ${({ $on }) => ($on ? 'rgba(244, 196, 48, 0.7)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $on }) => ($on ? 'rgba(244, 196, 48, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $on }) => ($on ? '#f2c84c' : '#e8e8e8')};
  font-size: 12px;
  font-weight: 700;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid
    ${({ $primary }) => ($primary ? 'rgba(244, 196, 48, 0.65)' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? 'rgba(244, 196, 48, 0.18)' : 'transparent')};
  color: ${({ $primary }) => ($primary ? '#f2c84c' : '#ddd')};
  font-size: 12px;
  font-weight: 700;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Note = styled.p`
  margin: 0;
  font-size: 11px;
  line-height: 15px;
  color: #8f8f8f;
`

const Err = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff8f8f;
`

type Props = {
  testId?: string
  sourceFlow: 'claim-project' | 'create-project'
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet?: string | null
  identityReady: boolean
  onOrderId?: (orderId: string | null) => void
  onDeclined?: () => void
}

export const ListFeaturedCheckout: React.FC<Props> = ({
  testId = 'list-featured-checkout',
  sourceFlow,
  projectId,
  projectSlug,
  projectContract,
  buyerWallet,
  identityReady,
  onOrderId,
  onDeclined,
}) => {
  const [wantFeatured, setWantFeatured] = useState<boolean | null>(null)
  const [pay, setPay] = useState<FeaturedPayAsset>('BNB')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)

  const decline = () => {
    setWantFeatured(false)
    setOrderId(null)
    onOrderId?.(null)
    onDeclined?.()
    setStatus('declined')
  }

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!identityReady) {
      setError('Resolve project identity before purchasing Featured placement.')
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setError('Connect a wallet (0x…) to purchase Featured placement.')
      return
    }
    if (!projectContract && !projectSlug) {
      setError('Project contract or slug required.')
      return
    }
    setBusy(true)
    setWantFeatured(true)
    try {
      const createRes = await fetch('/api/featured/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectSlug,
          projectContract,
          buyerWallet,
          paymentAsset: pay,
          sourceFlow,
        }),
      })
      const created = await createRes.json()
      if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
      const id = created.order.orderId as string
      setOrderId(id)
      onOrderId?.(id)

      const quoteRes = await fetch(`/api/featured/orders/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'quote', paymentAsset: pay }),
      })
      const quoted = await quoteRes.json()
      if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
      const { quote, prepared } = quoted
      setQuoteSummary(
        `${quote.tokenAmount} ${pay} → ${FEATURED_OFFER.treasuryWallet.slice(0, 6)}…${FEATURED_OFFER.treasuryWallet.slice(-4)} · expires ${new Date(quote.quoteExpiration).toLocaleTimeString()}`,
      )
      setStatus('awaiting_wallet')

      const eth = (window as unknown as { ethereum?: { request: (args: { method: string; params?: unknown[] }) => Promise<unknown> } })
        .ethereum
      if (!eth) throw new Error('WALLET_UNAVAILABLE')

      const chainIdHex = (await eth.request({ method: 'eth_chainId' })) as string
      if (Number.parseInt(chainIdHex, 16) !== 56) throw new Error('WRONG_CHAIN')

      let txHash: string
      try {
        txHash = (await eth.request({
          method: 'eth_sendTransaction',
          params: [
            {
              from: buyerWallet,
              to: prepared.to,
              value: prepared.valueHex,
              data: prepared.data,
              chainId: '0x38',
            },
          ],
        })) as string
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (/reject|denied|cancel/i.test(msg)) {
          await fetch(`/api/featured/orders/${id}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'cancel' }),
          })
          setStatus('cancelled')
          setError('Payment cancelled — claim/create can continue without Featured.')
          return
        }
        throw e
      }

      await fetch(`/api/featured/orders/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'submit', transactionHash: txHash }),
      })
      setStatus('submitted')

      // Receipt verification via wallet RPC eth_getTransactionReceipt
      let receipt: Record<string, unknown> | null = null
      for (let i = 0; i < 20; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        receipt = (await eth.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })) as Record<string, unknown> | null
        if (receipt) break
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, 1500))
      }
      if (!receipt) {
        setError('Payment submitted — receipt not yet available. Featured stays pending.')
        setStatus('submitted_pending_receipt')
        return
      }

      const confirmRes = await fetch(`/api/featured/orders/${id}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-receipt',
          transactionHash: txHash,
          receipt: {
            to: receipt.to,
            value: (receipt as { value?: string }).value ?? null,
            status: receipt.status,
            logs: receipt.logs,
          },
        }),
      })
      const confirmed = await confirmRes.json()
      if (!confirmRes.ok) {
        setStatus('payment_failed')
        setError(confirmed.error || 'RECEIPT_INVALID — Featured not activated; flow may continue.')
        return
      }
      setStatus('confirmed')
      setQuoteSummary(
        `Payment confirmed. Featured eligibility pending · order ${id}${
          pay === 'MARCO' ? ` · ${cashbackUserMessage('ELIGIBLE_PENDING')}` : ''
        }`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
    } finally {
      setBusy(false)
    }
  }, [
    buyerWallet,
    identityReady,
    onOrderId,
    pay,
    projectContract,
    projectId,
    projectSlug,
    sourceFlow,
  ])

  return (
    <Card
      data-testid={testId}
      data-featured-home-promo="checkout"
      data-featured-optional="1"
      data-featured-status={status}
      data-featured-order={orderId || undefined}
    >
      <Title>{FEATURED_OFFER.title}</Title>
      <Meta>
        Optional. Enters the rotating set for the four Home Featured Project cards for{' '}
        {FEATURED_OFFER.durationDays} consecutive days. Declining never blocks this flow.
      </Meta>
      <div>
        <PriceMain>${FEATURED_OFFER.usdPrice}</PriceMain>
        <Meta as="span"> · {FEATURED_OFFER.durationDays} days · Treasury {FEATURED_OFFER.treasuryWallet.slice(0, 6)}…</Meta>
      </div>
      <Row aria-label="Accepted payment assets">
        {FEATURED_OFFER.acceptedAssets.map((asset) => (
          <Chip
            key={asset}
            type="button"
            $on={pay === asset}
            onClick={() => setPay(asset)}
            data-testid={`${testId}-pay-${asset.toLowerCase()}`}
          >
            {asset}
          </Chip>
        ))}
      </Row>
      {pay === 'MARCO' ? (
        <Note data-testid={`${testId}-marco-cashback`}>
          {FEATURED_OFFER.marcoCashbackPct}% = {FEATURED_OFFER.marcoCashbackMCredits} M-Credits promotional
          cashback entitlement (pending fulfillment — not credited from this client).
        </Note>
      ) : (
        <Note>Accepted: BNB · USDT · USDC · MARCO</Note>
      )}
      <Row>
        <Btn type="button" onClick={decline} data-testid={`${testId}-decline`} disabled={busy}>
          Continue without Featured placement
        </Btn>
        <Btn
          type="button"
          $primary
          onClick={() => void runCheckout()}
          data-testid={`${testId}-purchase`}
          disabled={busy || !identityReady}
        >
          {busy ? 'Processing…' : `Get Featured for $${FEATURED_OFFER.usdPrice}`}
        </Btn>
      </Row>
      {wantFeatured === false ? <Note data-testid={`${testId}-declined`}>Featured declined — flow continues.</Note> : null}
      {quoteSummary ? <Note data-testid={`${testId}-quote`}>{quoteSummary}</Note> : null}
      {error ? <Err data-testid={`${testId}-error`}>{error}</Err> : null}
      {!identityReady ? <Note>Complete project identity before Featured purchase.</Note> : null}
    </Card>
  )
}

export default ListFeaturedCheckout
