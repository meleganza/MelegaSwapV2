/**
 * Unified commercial checkout — MelegaModal V3 funnel for Featured / Trend Boost
 * and studio handoff for Liquidity / Farm / Pool. Does not alter payment economics.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useNetwork, useSigner } from 'wagmi'
import {
  MelegaModal,
  MelegaModalFooter,
  MelegaModalFooterActions,
  MelegaModalFooterMeta,
  MelegaModalPreview,
} from 'design-system/melega/components/Modal'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { RECOVERY_CAPABILITIES, RECOVERY_PAYMENT_UNAVAILABLE } from 'config/constants/recoveryCapabilities'
import { RC_COPY } from 'lib/monetization/copy'
import { FEATURED_OFFER } from 'lib/featured-placement/constants'
import { cashbackUserMessage } from 'lib/featured-placement/cashback'
import {
  FEATURED_PACKAGES,
  TREND_BOOST_PACKAGES,
  type FeaturedPackageId,
  type MonetizationAsset,
  type TrendBoostPackageId,
} from 'lib/monetization/packages'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import type { WalletFlowStage } from 'lib/monetization/copy'
import {
  COMMERCIAL_SERVICES,
  FEATURED_PACKAGE_BADGES,
  TREND_PACKAGE_BADGES,
  type CommercialCheckoutStep,
  type CommercialServiceId,
} from './commercialCheckoutTypes'
import { appendMarketingHistory } from './marketingHistory'
import { useSwitchNetwork } from 'hooks/useSwitchNetwork'

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  min-width: 0;

  @media (min-width: 720px) {
    grid-template-columns: minmax(0, 1.15fr) minmax(220px, 0.85fr);
    align-items: start;
  }
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
`

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const ServiceCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.55)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $on }) =>
    $on
      ? 'radial-gradient(ellipse 80% 60% at 0% 0%, rgba(221,185,47,0.14), transparent 55%), rgba(255,255,255,0.04)'
      : 'rgba(255,255,255,0.03)'};
  color: ${uxRebuildColors.text};
`

const Icon = styled.div`
  font-size: 16px;
  line-height: 1;
  margin-bottom: 6px;
  color: ${uxRebuildColors.gold};
`

const STitle = styled.div`
  font-size: 13px;
  font-weight: 780;
`

const SDesc = styled.div`
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.35;
  color: ${uxRebuildColors.secondary};
`

const SPrice = styled.div`
  margin-top: 8px;
  font-size: 11px;
  font-weight: 750;
  color: ${uxRebuildColors.gold};
`

const PkgGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 560px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const PkgCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: left;
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.55)' : 'rgba(255, 255, 255, 0.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.1)' : 'rgba(255,255,255,0.03)')};
  color: inherit;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
`

const Badge = styled.span`
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.7);
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $on }) => ($on ? 'rgba(221, 185, 47, 0.14)' : 'rgba(255,255,255,0.04)')};
  color: ${({ $on }) => ($on ? uxRebuildColors.gold : '#e8e8e8')};
  font-size: 12px;
  font-weight: 700;
`

const GhostBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #ddd;
  font-size: 12px;
  font-weight: 700;
`

const PrimaryBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.65);
  background: rgba(221, 185, 47, 0.16);
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 750;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Err = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff8f8f;
`

const Meta = styled.p`
  margin: 0;
  font-size: 12px;
  line-height: 1.4;
  color: ${uxRebuildColors.secondary};
`

const PreviewLine = styled.div`
  font-size: 12px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.82);
  & + & {
    margin-top: 6px;
  }
`

const Label = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  margin-bottom: 6px;
`

const STEPS: CommercialCheckoutStep[] = ['configure', 'confirm']
const STEP_LABELS: Record<CommercialCheckoutStep, string> = {
  configure: 'Configure',
  confirm: 'Confirm',
}

type Props = {
  open: boolean
  onClose: () => void
  projectId: string
  projectSlug: string
  projectContract?: string | null
  chainId?: number
  initialService?: CommercialServiceId | null
  identityReady?: boolean
  onOpenClaim?: () => void
  onHistoryChange?: () => void
  visibilityOnly?: boolean
}

export const CommercialCheckoutModal: React.FC<Props> = ({
  open,
  onClose,
  projectId,
  projectSlug,
  projectContract = null,
  chainId = 56,
  initialService = null,
  identityReady = true,
  onOpenClaim,
  onHistoryChange,
  visibilityOnly = false,
}) => {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const { data: signer } = useSigner()
  const { switchNetworkAsync, canSwitch } = useSwitchNetwork()
  const buyerWallet = address ?? null

  const [step, setStep] = useState<CommercialCheckoutStep>('configure')
  const [service, setService] = useState<CommercialServiceId | null>(initialService)
  const [featuredPkg, setFeaturedPkg] = useState<FeaturedPackageId>('featured_1w')
  const [trendPkg, setTrendPkg] = useState<TrendBoostPackageId>('trend_6h')
  const [pay, setPay] = useState<MonetizationAsset>('BNB')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('idle')
  const [walletStage, setWalletStage] = useState<WalletFlowStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setStep('configure')
    setService(initialService)
    setError(null)
    setStatus('idle')
    setWalletStage('idle')
    setOrderId(null)
    setQuoteSummary(null)
    setBusy(false)
  }, [open, initialService, chainId])

  const serviceMeta = COMMERCIAL_SERVICES.find((s) => s.id === service) ?? null
  const visibleServices = useMemo(
    () =>
      visibilityOnly
        ? COMMERCIAL_SERVICES.filter((item) =>
            ['featured', 'trend-boost', 'sponsored-research'].includes(item.id),
          )
        : COMMERCIAL_SERVICES,
    [visibilityOnly],
  )
  const packages = service === 'featured' ? FEATURED_PACKAGES : service === 'trend-boost' ? TREND_BOOST_PACKAGES : []
  const selectedPackage =
    service === 'featured'
      ? FEATURED_PACKAGES.find((p) => p.id === featuredPkg) ?? FEATURED_PACKAGES[2]
      : service === 'trend-boost'
      ? TREND_BOOST_PACKAGES.find((p) => p.id === trendPkg) ?? TREND_BOOST_PACKAGES[2]
      : null

  const paidProduct = service === 'featured' || service === 'trend-boost'

  const stepIndex = STEPS.indexOf(step)
  const modalSteps = STEPS.map((id, i) => ({
    id,
    label: STEP_LABELS[id],
    active: id === step,
    done: i < stepIndex,
  }))

  const goNext = () => {
    setError(null)
    if (!service) {
      setError('Choose a service to continue.')
      return
    }
    if (service === 'claim-project') {
      onClose()
      onOpenClaim?.()
      return
    }
    if (service === 'sponsored-research') {
      setError(
        'Sponsored Research is defined but not yet purchasable. Activation requires the Founder-approved package, price and receipt fulfilment.',
      )
      return
    }
    const meta = COMMERCIAL_SERVICES.find((item) => item.id === service)
    if (meta && !meta.needsPackage && meta.externalHref) {
      window.location.href = meta.externalHref(chainId)
      return
    }
    if (!selectedPackage) {
      setError('Choose a package.')
      return
    }
    if (!RECOVERY_CAPABILITIES.commercialPaymentActivation) {
      setError(RECOVERY_PAYMENT_UNAVAILABLE)
      return
    }
    setStep('confirm')
  }

  const goBack = () => {
    setError(null)
    setStep('configure')
  }

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!paidProduct || !selectedPackage || !service) return
    if (!RECOVERY_CAPABILITIES.commercialPaymentActivation) {
      setWalletStage('error')
      setError(RECOVERY_PAYMENT_UNAVAILABLE)
      return
    }
    if (!identityReady) {
      setError('Finish project identity before checkout.')
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
    try {
      setWalletStage('confirm')
      const isFeatured = service === 'featured'
      const packageId = selectedPackage.id

      let id: string
      let prepared: { to: string; valueHex: string; data: string }
      let quote: { tokenAmount: string; quoteExpiration: string }

      if (isFeatured) {
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
            sourceFlow: 'claim-project',
          }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
        id = created.order.orderId as string
        setOrderId(id)

        const quoteRes = await fetch(`/api/featured/orders/${id}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', paymentAsset: pay }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(
          `${quote.tokenAmount} ${pay} → ${FEATURED_OFFER.treasuryWallet.slice(
            0,
            6,
          )}…${FEATURED_OFFER.treasuryWallet.slice(-4)}`,
        )
      } else {
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
        id = created.order.orderId as string
        setOrderId(id)

        const quoteRes = await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', orderId: id, paymentAsset: pay }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(`${quote.tokenAmount} ${pay} · ${selectedPackage.durationLabel}`)
      }

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
          if (isFeatured) {
            await fetch(`/api/featured/orders/${id}`, {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ action: 'cancel' }),
            })
          } else {
            await fetch('/api/trend-boost/orders', {
              method: 'POST',
              headers: { 'content-type': 'application/json' },
              body: JSON.stringify({ action: 'cancel', orderId: id }),
            })
          }
          setStatus('cancelled')
          setWalletStage('cancelled')
          setError(RC_COPY.paymentCancelled)
          return
        }
        throw e
      }

      if (isFeatured) {
        await fetch(`/api/featured/orders/${id}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'submit', transactionHash: txHash }),
        })
      } else {
        await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'submit', orderId: id, transactionHash: txHash }),
        })
      }
      setStatus('submitted')

      const receipt = await signer.provider?.waitForTransaction(txHash, 1, 30_000)
      if (!receipt) {
        setError('Payment submitted — receipt not yet available.')
        setStatus('submitted_pending_receipt')
        return
      }

      if (isFeatured) {
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
          setError(confirmed.error || 'RECEIPT_INVALID')
          return
        }
      } else {
        const confirmRes = await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            action: 'confirm-receipt',
            orderId: id,
            transactionHash: txHash,
          }),
        })
        const confirmed = await confirmRes.json()
        if (!confirmRes.ok) {
          setStatus('payment_failed')
          setWalletStage('error')
          setError(confirmed.error || 'RECEIPT_INVALID')
          return
        }
      }

      setStatus('confirmed')
      setWalletStage('success')
      setQuoteSummary(
        `Payment confirmed · order ${id}${pay === 'MARCO' ? ` · ${cashbackUserMessage('ELIGIBLE_PENDING')}` : ''}`,
      )
      appendMarketingHistory(projectSlug, {
        kind: isFeatured ? 'featured' : 'trend-boost',
        label: selectedPackage.label,
        status: 'Running',
        packageId: selectedPackage.id,
        expiresAt: new Date(Date.now() + selectedPackage.durationMs).toISOString(),
      })
      onHistoryChange?.()
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
    onHistoryChange,
    paidProduct,
    pay,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    signer,
    switchNetworkAsync,
  ])

  const preview = useMemo(
    () => (
      <MelegaModalPreview data-testid="commercial-checkout-preview">
        <PreviewLine>
          <strong>{serviceMeta?.title ?? 'Choose service'}</strong>
        </PreviewLine>
        {selectedPackage ? (
          <PreviewLine>
            {selectedPackage.shortLabel} · ${selectedPackage.usdPrice}
          </PreviewLine>
        ) : null}
        {serviceMeta?.availability === 'pending' ? (
          <PreviewLine>Activation · pending commercial certification</PreviewLine>
        ) : (
          <>
            <PreviewLine>Settlement · BNB Chain</PreviewLine>
            <PreviewLine>Pay · {pay}</PreviewLine>
          </>
        )}
        {projectSlug ? <PreviewLine>Project · {projectSlug}</PreviewLine> : null}
        {orderId ? <PreviewLine>Order · {orderId}</PreviewLine> : null}
      </MelegaModalPreview>
    ),
    [orderId, pay, projectSlug, selectedPackage, serviceMeta?.availability, serviceMeta?.title],
  )

  const footer = (
    <MelegaModalFooter>
      <MelegaModalFooterMeta>
        {paidProduct && selectedPackage
          ? `${selectedPackage.label} · $${selectedPackage.usdPrice}`
          : 'Boost Your Project'}
      </MelegaModalFooterMeta>
      <MelegaModalFooterActions>
        {step === 'confirm' ? (
          <GhostBtn type="button" onClick={goBack} data-testid="commercial-checkout-back">
            Back
          </GhostBtn>
        ) : (
          <GhostBtn type="button" onClick={onClose} data-testid="commercial-checkout-cancel">
            Cancel
          </GhostBtn>
        )}
        {step === 'confirm' ? (
          <PrimaryBtn
            type="button"
            disabled={busy || !RECOVERY_CAPABILITIES.commercialPaymentActivation}
            onClick={() => void runCheckout()}
            data-testid="commercial-checkout-pay"
          >
            {busy
              ? 'Processing…'
              : RECOVERY_CAPABILITIES.commercialPaymentActivation
              ? 'Pay & activate'
              : 'Payments temporarily unavailable'}
          </PrimaryBtn>
        ) : (
          <PrimaryBtn
            type="button"
            onClick={goNext}
            disabled={paidProduct && !RECOVERY_CAPABILITIES.commercialPaymentActivation}
            data-testid="commercial-checkout-next"
          >
            {paidProduct && !RECOVERY_CAPABILITIES.commercialPaymentActivation
              ? 'Payments temporarily unavailable'
              : paidProduct
              ? 'Review & pay'
              : 'Continue'}
          </PrimaryBtn>
        )}
      </MelegaModalFooterActions>
    </MelegaModalFooter>
  )

  return (
    <MelegaModal
      open={open}
      onClose={onClose}
      title="Boost Your Project"
      subtitle="Configure the offer once, then confirm securely in your wallet."
      steps={paidProduct ? modalSteps : undefined}
      size="md"
      footer={footer}
      testId="commercial-checkout-modal"
      closeTestId="commercial-checkout-close"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
    >
      <Grid>
        <Stack>
          {step === 'configure' ? (
            <div data-testid="commercial-step-configure">
              <Label>Choose Service</Label>
              <ServiceGrid>
                {visibleServices.map((s) => (
                  <ServiceCard
                    key={s.id}
                    type="button"
                    $on={service === s.id}
                    onClick={() => {
                      setService(s.id)
                      setError(null)
                      if (s.id === 'claim-project') {
                        onClose()
                        onOpenClaim?.()
                      } else if (s.externalHref) {
                        window.location.href = s.externalHref(chainId)
                      }
                    }}
                    data-testid={`commercial-service-${s.id}`}
                  >
                    <Icon aria-hidden>{s.icon}</Icon>
                    <STitle>{s.title}</STitle>
                    <SDesc>{s.description}</SDesc>
                    <SPrice>{s.priceHint}</SPrice>
                  </ServiceCard>
                ))}
              </ServiceGrid>
            </div>
          ) : null}

          {step === 'configure' && paidProduct ? (
            <div data-testid="commercial-step-package">
              <Label>Choose Package</Label>
              <PkgGrid>
                {packages.map((p) => (
                  <PkgCard
                    key={p.id}
                    type="button"
                    $on={selectedPackage?.id === p.id}
                    onClick={() => {
                      if (service === 'featured') setFeaturedPkg(p.id as FeaturedPackageId)
                      else setTrendPkg(p.id as TrendBoostPackageId)
                    }}
                    data-testid={`commercial-pkg-${p.id}`}
                  >
                    <STitle>{p.shortLabel}</STitle>
                    <SDesc>{p.durationLabel}</SDesc>
                    <SPrice>${p.usdPrice}</SPrice>
                    <BadgeRow>
                      {(service === 'featured' ? FEATURED_PACKAGE_BADGES : TREND_PACKAGE_BADGES).map((b) => (
                        <Badge key={b}>{b}</Badge>
                      ))}
                    </BadgeRow>
                  </PkgCard>
                ))}
              </PkgGrid>
            </div>
          ) : null}

          {step === 'configure' && paidProduct ? (
            <div data-testid="commercial-step-chain">
              <Label>Settlement network</Label>
              <Meta>BNB Chain · selected automatically for commercial placements.</Meta>
            </div>
          ) : null}

          {step === 'configure' && paidProduct ? (
            <div data-testid="commercial-step-payment">
              <Label>Choose Payment</Label>
              <ChipRow>
                {(['BNB', 'USDT', 'USDC', 'MARCO'] as MonetizationAsset[]).map((a) => (
                  <Chip
                    key={a}
                    type="button"
                    $on={pay === a}
                    onClick={() => setPay(a)}
                    data-testid={`commercial-pay-${a}`}
                  >
                    {a}
                  </Chip>
                ))}
              </ChipRow>
            </div>
          ) : null}

          {step === 'confirm' ? (
            <div data-testid="commercial-step-confirm">
              <Label>Confirm purchase</Label>
              <Meta>
                {serviceMeta?.title} · {selectedPackage?.label} · {pay} on BNB Chain
              </Meta>
              <Meta style={{ marginTop: 8 }}>
                Project {projectSlug}
                {projectContract ? ` · ${projectContract.slice(0, 6)}…${projectContract.slice(-4)}` : ''}
              </Meta>
              <BadgeRow>
                {(service === 'featured' ? FEATURED_PACKAGE_BADGES : TREND_PACKAGE_BADGES).map((badge) => (
                  <Badge key={badge}>{badge}</Badge>
                ))}
              </BadgeRow>
              {quoteSummary ? <Meta style={{ marginTop: 8 }}>{quoteSummary}</Meta> : null}
              <div style={{ marginTop: 10 }}>
                <WalletFlowStatus stage={walletStage} />
              </div>
              {status === 'confirmed' ? (
                <Meta style={{ marginTop: 8, color: uxRebuildColors.positive }}>Activated · see Marketing History</Meta>
              ) : null}
            </div>
          ) : null}

          {error ? <Err data-testid="commercial-checkout-error">{error}</Err> : null}
        </Stack>
        {preview}
      </Grid>
    </MelegaModal>
  )
}

export default CommercialCheckoutModal
