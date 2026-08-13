/**
 * Optional Trend Boost checkout — packages 1h / 3h / 6h / 12h / 24h.
 */
import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import { useNetwork, useSigner } from 'wagmi'
import { RECOVERY_CAPABILITIES, RECOVERY_PAYMENT_UNAVAILABLE } from 'config/constants/recoveryCapabilities'
import type { FeaturedPayAsset } from 'lib/featured-placement/constants'
import { RC_COPY, type WalletFlowStage } from 'lib/monetization/copy'
import { TREND_BOOST_PACKAGES, type TrendBoostPackageId } from 'lib/monetization/packages'
import { PaymentRouterPicker } from 'views/shared/monetization/PaymentRouterPicker'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'

const Card = styled.section`
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(125, 211, 252, 0.28);
  background: radial-gradient(ellipse 80% 60% at 10% 0%, rgba(56, 189, 248, 0.12), transparent 55%),
    linear-gradient(165deg, rgba(12, 20, 28, 0.98) 0%, rgba(12, 12, 12, 0.98) 100%);
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
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(125, 211, 252, 0.65)' : 'rgba(255,255,255,0.14)')};
  background: ${({ $primary }) => ($primary ? 'rgba(56, 189, 248, 0.16)' : 'transparent')};
  color: ${({ $primary }) => ($primary ? '#7dd3fc' : '#ddd')};
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
  projectId: string
  projectSlug?: string | null
  projectContract?: string | null
  buyerWallet?: string | null
  identityReady?: boolean
  onOrderId?: (orderId: string | null) => void
  onDeclined?: () => void
}

export const ListTrendBoostCheckout: React.FC<Props> = ({
  testId = 'list-trend-boost-checkout',
  projectId,
  projectSlug,
  projectContract,
  buyerWallet,
  identityReady = true,
  onOrderId,
  onDeclined,
}) => {
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const [pay, setPay] = useState<FeaturedPayAsset>('BNB')
  const [packageId, setPackageId] = useState<TrendBoostPackageId>('trend_6h')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('idle')
  const [walletStage, setWalletStage] = useState<WalletFlowStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)
  const [declined, setDeclined] = useState(false)

  const selectedPkg = TREND_BOOST_PACKAGES.find((p) => p.id === packageId) ?? TREND_BOOST_PACKAGES[2]

  const decline = () => {
    setDeclined(true)
    setOrderId(null)
    onOrderId?.(null)
    onDeclined?.()
    setStatus('declined')
  }

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!RECOVERY_CAPABILITIES.commercialPaymentActivation) {
      setWalletStage('error')
      setError(RECOVERY_PAYMENT_UNAVAILABLE)
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return
    }
    setBusy(true)
    try {
      setWalletStage('confirm')
      const createRes = await fetch('/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          projectId,
          projectSlug,
          projectContract,
          buyerWallet,
          paymentAsset: pay,
          packageId,
        }),
      })
      const created = await createRes.json()
      if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
      const id = created.order.orderId as string
      setOrderId(id)
      onOrderId?.(id)

      const quoteRes = await fetch('/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'quote', orderId: id, paymentAsset: pay }),
      })
      const quoted = await quoteRes.json()
      if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
      const { quote, prepared } = quoted
      setQuoteSummary(`${quote.tokenAmount} ${pay} · ${selectedPkg.durationLabel}`)
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
          await fetch('/api/trend-boost/orders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ action: 'cancel', orderId: id }),
          })
          setWalletStage('cancelled')
          setStatus('cancelled')
          setError(RC_COPY.paymentCancelled)
          return
        }
        throw e
      }

      await fetch('/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'submit', orderId: id, transactionHash: txHash }),
      })
      setStatus('submitted')

      const receipt = await signer.provider?.waitForTransaction(txHash, 1, 30_000)
      if (!receipt) {
        setStatus('submitted_pending_receipt')
        setError('Payment submitted — confirmation is still pending.')
        return
      }

      const confirmRes = await fetch('/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'confirm-receipt', orderId: id, transactionHash: txHash }),
      })
      const confirmed = await confirmRes.json()
      if (!confirmRes.ok) {
        setStatus('payment_failed')
        setWalletStage('error')
        setError(confirmed.error || 'RECEIPT_INVALID')
        return
      }
      setStatus('confirmed')
      setWalletStage('success')
      setQuoteSummary(`Trend Boost active · ${selectedPkg.durationLabel} · ${txHash.slice(0, 10)}…`)
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
    onOrderId,
    packageId,
    pay,
    projectContract,
    projectId,
    projectSlug,
    selectedPkg.durationLabel,
    signer,
    switchNetworkAsync,
  ])

  return (
    <Card
      data-testid={testId}
      data-trend-boost="checkout"
      data-trend-status={status}
      data-trend-package={packageId}
      data-trend-order={orderId || undefined}
    >
      <Title>{RC_COPY.trendBoostTitle}</Title>
      <Meta>{RC_COPY.trendBoostBody}</Meta>
      <PaymentRouterPicker
        packages={TREND_BOOST_PACKAGES}
        packageId={packageId}
        onPackageChange={(id) => setPackageId(id as TrendBoostPackageId)}
        asset={pay}
        onAssetChange={(a) => setPay(a as FeaturedPayAsset)}
        testId={`${testId}-router`}
      />
      <Note>{RC_COPY.treasuryNote}</Note>
      <WalletFlowStatus stage={walletStage} />
      <Row>
        <Btn type="button" onClick={decline} disabled={busy} data-testid={`${testId}-decline`}>
          {RC_COPY.continueWithoutTrendBoost}
        </Btn>
        <Btn
          type="button"
          $primary
          disabled={busy || !identityReady || !RECOVERY_CAPABILITIES.commercialPaymentActivation}
          onClick={() => void runCheckout()}
          data-testid={`${testId}-purchase`}
        >
          {busy
            ? RC_COPY.loading
            : RECOVERY_CAPABILITIES.commercialPaymentActivation
            ? `Boost · $${selectedPkg.usdPrice}`
            : 'Payments temporarily unavailable'}
        </Btn>
      </Row>
      {declined ? <Note data-testid={`${testId}-declined`}>Trend Boost declined.</Note> : null}
      {quoteSummary ? <Note data-testid={`${testId}-quote`}>{quoteSummary}</Note> : null}
      {error ? <Err data-testid={`${testId}-error`}>{error}</Err> : null}
      {!RECOVERY_CAPABILITIES.commercialPaymentActivation ? <Note>{RECOVERY_PAYMENT_UNAVAILABLE}</Note> : null}
    </Card>
  )
}

export default ListTrendBoostCheckout
