/**
 * Optional Featured Home checkout — RC Sprint 1 packages (24h / 72h / 1w / 1m).
 * Never blocks the parent flow when declined or payment fails.
 */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useNetwork, useSigner } from 'wagmi'
import { RECOVERY_CAPABILITIES, RECOVERY_PAYMENT_UNAVAILABLE } from 'config/constants/recoveryCapabilities'
import { FEATURED_OFFER, type FeaturedPayAsset } from 'lib/featured-placement/constants'
import { cashbackUserMessage } from 'lib/featured-placement/cashback'
import { RC_COPY, type WalletFlowStage } from 'lib/monetization/copy'
import { FEATURED_PACKAGES, type FeaturedPackageId } from 'lib/monetization/packages'
import { PaymentRouterPicker } from 'views/shared/monetization/PaymentRouterPicker'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'

const Card = styled.section`
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: radial-gradient(ellipse 80% 60% at 10% 0%, rgba(244, 196, 48, 0.12), transparent 55%),
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

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Btn = styled.button<{ $primary?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244, 196, 48, 0.65)' : 'rgba(255,255,255,0.14)')};
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
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const [wantFeatured, setWantFeatured] = useState<boolean | null>(null)
  const [pay, setPay] = useState<FeaturedPayAsset>('BNB')
  const [packageId, setPackageId] = useState<FeaturedPackageId>(FEATURED_OFFER.defaultPackageId)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState<string>('idle')
  const [walletStage, setWalletStage] = useState<WalletFlowStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)

  const selectedPkg = FEATURED_PACKAGES.find((p) => p.id === packageId) ?? FEATURED_PACKAGES[2]

  const decline = () => {
    setWantFeatured(false)
    setOrderId(null)
    onOrderId?.(null)
    onDeclined?.()
    setStatus('declined')
    setWalletStage('idle')
  }

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!RECOVERY_CAPABILITIES.commercialPaymentActivation) {
      setWalletStage('error')
      setError(RECOVERY_PAYMENT_UNAVAILABLE)
      return
    }
    if (!identityReady) {
      setError('Finish project identity before buying Featured placement.')
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return
    }
    if (!projectContract && !projectSlug) {
      setError('Project contract or slug required.')
      return
    }
    setBusy(true)
    setWantFeatured(true)
    try {
      setWalletStage('confirm')
      const createRes = await fetch('/api/featured/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          projectId,
          projectSlug,
          projectContract,
          buyerWallet,
          paymentAsset: pay,
          packageId,
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
        `${quote.tokenAmount} ${pay} → ${FEATURED_OFFER.treasuryWallet.slice(
          0,
          6,
        )}…${FEATURED_OFFER.treasuryWallet.slice(-4)} · expires ${new Date(
          quote.quoteExpiration,
        ).toLocaleTimeString()}`,
      )
      setStatus('awaiting_wallet')

      if (!signer) {
        setWalletStage('error')
        throw new Error(RC_COPY.walletUnavailable)
      }

      if (chain?.id !== 56) {
        setWalletStage('switch_network')
        if (!canSwitch) throw new Error(RC_COPY.wrongNetwork)
        await switchNetworkAsync(56)
      }

      let txHash: string
      try {
        const transaction = await signer.sendTransaction({
          to: prepared.to,
          value: prepared.valueHex,
          data: prepared.data,
        })
        txHash = transaction.hash
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e)
        if (/reject|denied|cancel/i.test(msg)) {
          await fetch(`/api/featured/orders/${id}`, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'cancel' }),
          })
          setStatus('cancelled')
          setWalletStage('cancelled')
          setError(RC_COPY.paymentCancelled)
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

      const receipt = await signer.provider?.waitForTransaction(txHash, 1, 30_000)
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
        }),
      })
      const confirmed = await confirmRes.json()
      if (!confirmRes.ok) {
        setStatus('payment_failed')
        setWalletStage('error')
        setError(confirmed.error || 'RECEIPT_INVALID — Featured not activated; flow may continue.')
        return
      }
      setStatus('confirmed')
      setWalletStage('success')
      setQuoteSummary(
        `Payment confirmed. Featured eligibility pending · order ${id}${
          pay === 'MARCO' ? ` · ${cashbackUserMessage('ELIGIBLE_PENDING')}` : ''
        }`,
      )
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setStatus('error')
      setWalletStage('error')
    } finally {
      setBusy(false)
    }
  }, [
    buyerWallet,
    canSwitch,
    chain?.id,
    identityReady,
    onOrderId,
    packageId,
    pay,
    projectContract,
    projectId,
    projectSlug,
    signer,
    sourceFlow,
    switchNetworkAsync,
  ])

  return (
    <Card
      data-testid={testId}
      data-featured-home-promo="checkout"
      data-featured-optional="1"
      data-featured-status={status}
      data-featured-order={orderId || undefined}
      data-featured-package={packageId}
    >
      <Title>{RC_COPY.featuredTitle}</Title>
      <Meta>{RC_COPY.featuredBody}</Meta>
      <PaymentRouterPicker
        packages={FEATURED_PACKAGES}
        packageId={packageId}
        onPackageChange={(id) => setPackageId(id as FeaturedPackageId)}
        asset={pay}
        onAssetChange={(a) => setPay(a as FeaturedPayAsset)}
        testId={`${testId}-router`}
      />
      {pay === 'MARCO' ? (
        <Note data-testid={`${testId}-marco-cashback`}>
          {FEATURED_OFFER.marcoCashbackPct}% M-Credits promotional cashback on MARCO payments (pending fulfillment).
        </Note>
      ) : (
        <Note>{RC_COPY.treasuryNote}</Note>
      )}
      <WalletFlowStatus stage={walletStage} />
      <Row>
        <Btn type="button" onClick={decline} data-testid={`${testId}-decline`} disabled={busy}>
          {RC_COPY.continueWithoutFeatured}
        </Btn>
        <Btn
          type="button"
          $primary
          onClick={() => void runCheckout()}
          data-testid={`${testId}-purchase`}
          disabled={busy || !identityReady || !RECOVERY_CAPABILITIES.commercialPaymentActivation}
        >
          {busy
            ? RC_COPY.loading
            : RECOVERY_CAPABILITIES.commercialPaymentActivation
            ? `Get Featured · $${selectedPkg.usdPrice}`
            : 'Payments temporarily unavailable'}
        </Btn>
      </Row>
      {wantFeatured === false ? (
        <Note data-testid={`${testId}-declined`}>Featured declined — flow continues.</Note>
      ) : null}
      {quoteSummary ? <Note data-testid={`${testId}-quote`}>{quoteSummary}</Note> : null}
      {error ? <Err data-testid={`${testId}-error`}>{error}</Err> : null}
      {!identityReady ? <Note>Complete project identity before Featured purchase.</Note> : null}
      {!RECOVERY_CAPABILITIES.commercialPaymentActivation ? <Note>{RECOVERY_PAYMENT_UNAVAILABLE}</Note> : null}
    </Card>
  )
}

export default ListFeaturedCheckout
