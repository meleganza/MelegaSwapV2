/**
 * One-surface visibility checkout.
 * Project identity is resolved before a commercial offer can be reviewed.
 * Products without verified settlement/fulfilment remain visible but fail closed.
 */
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useAccount, useSigner } from 'wagmi'
import { MarcoPay } from 'components/MarcoWidgets'
import {
  MelegaModal,
  MelegaModalFooter,
  MelegaModalFooterActions,
  MelegaModalFooterMeta,
  MelegaModalPreview,
} from 'design-system/melega/components'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'
import { RC_COPY } from 'lib/monetization/copy'
import { FEATURED_OFFER } from 'lib/featured-placement/constants'
import { cashbackUserMessage } from 'lib/featured-placement/cashback'
import {
  FEATURED_FARM_PACKAGES,
  FEATURED_PACKAGES,
  FEATURED_POOL_PACKAGES,
  SPONSORED_RESEARCH_PACKAGES,
  TREND_BOOST_PACKAGES,
  type MonetizationAsset,
  type PlacementPackage,
} from 'lib/monetization/packages'
import { VISIBILITY_RUNTIME, visibilityCheckoutBlocker } from 'lib/monetization/visibilityRuntime'
import { buildProjectClaimMessage, normalizeClaimMetadata } from 'lib/project-claims/claimMessage'
import { WalletFlowStatus } from 'views/shared/monetization/WalletFlowStatus'
import type { WalletFlowStage } from 'lib/monetization/copy'
import {
  FEATURED_PACKAGE_BADGES,
  TREND_PACKAGE_BADGES,
  VISIBILITY_SERVICES,
  type CommercialCheckoutStep,
  type CommercialPaymentAsset,
  type CommercialServiceId,
} from './commercialCheckoutTypes'
import { appendMarketingHistory } from './marketingHistory'

const MARCO_PAY_APPLICATION = process.env.NEXT_PUBLIC_MARCO_PAY_APPLICATION?.trim() ?? ''

const IDENTITY_CHAINS = [
  { id: 56, label: 'BNB Chain', short: 'BSC' },
  { id: 1, label: 'Ethereum', short: 'ETH' },
  { id: 8453, label: 'Base', short: 'BASE' },
  { id: 137, label: 'Polygon', short: 'POL' },
] as const

type DetectedProject = {
  tier: 'canonical' | 'pending'
  name: string
  symbol: string
  contract: string
  chainId: number
  decimals: number | null
  totalSupply: string | null
  logoUrl: string | null
  slug: string | null
  projectPageExists: boolean
  explorerUrl: string | null
  dexListed: boolean
  website: string | null
}

type ProjectDraft = {
  handle: string
  logoUrl: string
  description: string
  website: string
  x: string
  telegram: string
}

const EMPTY_DRAFT: ProjectDraft = {
  handle: '',
  logoUrl: '',
  description: '',
  website: '',
  x: '',
  telegram: '',
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;
  @media (min-width: 820px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(270px, 0.55fr);
    align-items: start;
  }
`

const Stack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 650px) {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
`

const ServiceCard = styled.button<{ $on?: boolean; $live?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: left;
  min-width: 0;
  min-height: 130px;
  padding: 12px;
  border-radius: 14px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.11)' : 'rgba(255,255,255,.025)')};
  color: ${uxRebuildColors.text};
  opacity: ${({ $live }) => ($live ? 1 : 0.72)};
`

const Icon = styled.div`
  color: ${uxRebuildColors.gold};
  font-size: 17px;
  margin-bottom: 8px;
`

const STitle = styled.div`
  font-size: 13px;
  line-height: 1.2;
  font-weight: 780;
`

const SDesc = styled.div`
  margin-top: 5px;
  font-size: 10px;
  line-height: 1.35;
  color: ${uxRebuildColors.secondary};
`

const SPrice = styled.div`
  margin-top: 8px;
  color: ${uxRebuildColors.gold};
  font-size: 11px;
  font-weight: 760;
`

const PkgGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  @media (min-width: 620px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const PkgCard = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  text-align: left;
  padding: 11px;
  border-radius: 12px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.1)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.1)' : 'rgba(255,255,255,.025)')};
  color: inherit;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 8px;
`

const Badge = styled.span<{ $purple?: boolean; $green?: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 20px;
  padding: 2px 7px;
  border-radius: 999px;
  border: 1px solid
    ${({ $purple, $green }) =>
      $purple ? 'rgba(155,91,255,.6)' : $green ? 'rgba(54,211,153,.5)' : 'rgba(255,255,255,.13)'};
  color: ${({ $purple, $green }) => ($purple ? '#caa8ff' : $green ? '#65dfa8' : 'rgba(255,255,255,.72)')};
  background: ${({ $purple, $green }) =>
    $purple ? 'rgba(128,67,220,.16)' : $green ? 'rgba(32,158,105,.12)' : 'rgba(255,255,255,.03)'};
  font-size: 9px;
  font-weight: 780;
  letter-spacing: 0.035em;
  text-transform: uppercase;
`

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Chip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 13px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? 'rgba(221,185,47,.62)' : 'rgba(255,255,255,.12)')};
  background: ${({ $on }) => ($on ? 'rgba(221,185,47,.13)' : 'rgba(255,255,255,.035)')};
  color: ${({ $on }) => ($on ? uxRebuildColors.gold : '#e8e8e8')};
  font-size: 12px;
  font-weight: 720;
`

const Input = styled.input`
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f4f4f4;
  padding: 0 13px;
  font-size: 13px;
  outline: none;
  &:focus {
    border-color: rgba(221, 185, 47, 0.58);
  }
`

const Textarea = styled.textarea`
  width: 100%;
  min-height: 70px;
  box-sizing: border-box;
  resize: vertical;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f4f4f4;
  padding: 11px 13px;
  font-size: 13px;
  outline: none;
`

const FieldGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 8px;
  @media (min-width: 620px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const DetectRow = styled.div`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr) auto;
  gap: 8px;
  @media (max-width: 620px) {
    grid-template-columns: 1fr;
  }
`

const Select = styled.select`
  min-height: 44px;
  border-radius: 11px;
  border: 1px solid rgba(255, 255, 255, 0.11);
  background: #171a1e;
  color: #f2f2f2;
  padding: 0 12px;
`

const Identity = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.025);
`

const Logo = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  overflow: hidden;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.13);
  background: #0c0d0f;
  color: ${uxRebuildColors.gold};
  font-weight: 800;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const CheckRow = styled.label`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 10px;
  align-items: center;
  padding: 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.025);
  cursor: pointer;
`

const Alert = styled.div<{ $error?: boolean }>`
  padding: 10px 12px;
  border-radius: 11px;
  border: 1px solid ${({ $error }) => ($error ? 'rgba(255,104,104,.4)' : 'rgba(221,185,47,.32)')};
  background: ${({ $error }) => ($error ? 'rgba(160,40,40,.1)' : 'rgba(221,185,47,.07)')};
  color: ${({ $error }) => ($error ? '#ffaaa8' : '#ddd0a0')};
  font-size: 11px;
  line-height: 1.45;
`

const GhostBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: transparent;
  color: #ddd;
  font-size: 12px;
  font-weight: 720;
`

const PrimaryBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 38px;
  padding: 0 15px;
  border-radius: 10px;
  border: 1px solid rgba(221, 185, 47, 0.65);
  background: rgba(221, 185, 47, 0.16);
  color: ${uxRebuildColors.gold};
  font-size: 12px;
  font-weight: 780;
  &:disabled {
    opacity: 0.45;
    cursor: not-allowed;
  }
`

const Err = styled.p`
  margin: 0;
  font-size: 12px;
  color: #ff9292;
`

const Meta = styled.p`
  margin: 0;
  color: ${uxRebuildColors.secondary};
  font-size: 12px;
  line-height: 1.45;
`

const PreviewLine = styled.div`
  overflow-wrap: anywhere;
  font-size: 12px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.82);
  & + & {
    margin-top: 7px;
  }
`

const Label = styled.div`
  margin-bottom: 7px;
  color: rgba(255, 255, 255, 0.58);
  font-size: 11px;
  font-weight: 720;
`

const STEPS: CommercialCheckoutStep[] = ['project', 'service', 'package', 'chain', 'payment', 'review', 'checkout']
const STEP_LABELS: Record<CommercialCheckoutStep, string> = {
  project: 'Project',
  service: 'Service',
  package: 'Package',
  chain: 'Chain',
  payment: 'Payment',
  review: 'Review',
  checkout: 'Checkout',
}

const CATALOGS: Partial<Record<CommercialServiceId, readonly PlacementPackage[]>> = {
  featured: FEATURED_PACKAGES,
  'trend-boost': TREND_BOOST_PACKAGES,
  'sponsored-research': SPONSORED_RESEARCH_PACKAGES,
  'featured-farm': FEATURED_FARM_PACKAGES,
  'featured-pool': FEATURED_POOL_PACKAGES,
}

function compactSupply(value: string | null): string {
  if (!value) return 'Unavailable'
  const number = Number(value)
  if (!Number.isFinite(number)) return value
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(number)
}

type RegistryDetection = {
  ok?: boolean
  tier?: string
  reason?: string
  error?: string
  onChain?: {
    name?: string
    symbol?: string
    decimals?: number | string
    totalSupplyFormatted?: string | null
    explorerUrl?: string | null
  }
  profile?: {
    name?: { value?: string }
    symbol?: { value?: string }
  }
  project?: {
    displayName?: string
    logoUrl?: string | null
    slug?: string | null
    tokens?: Array<{ chainId?: number | string; symbol?: string }>
  } | null
  dex?: {
    listed?: boolean
    projectClaimed?: boolean
    registrySlug?: string | null
    name?: string | null
    symbol?: string | null
    logo?: string | null
    website?: string | null
  } | null
}

function parseDetectedProject(
  json: RegistryDetection,
  contract: string,
  requestedChain: number,
): DetectedProject | null {
  if (!json?.ok || !json?.onChain) return null
  const canonical = json.tier === 'canonical'
  const project = json.project ?? null
  const dex = json.dex ?? null
  const token = project?.tokens?.find((item) => Number(item.chainId) === requestedChain)
  const name = String(project?.displayName ?? dex?.name ?? json.onChain.name ?? json.profile?.name?.value ?? 'Detected token')
  const symbol = String(token?.symbol ?? dex?.symbol ?? json.onChain.symbol ?? json.profile?.symbol?.value ?? 'TOKEN')
  return {
    tier: canonical ? 'canonical' : 'pending',
    name,
    symbol,
    contract,
    chainId: requestedChain,
    decimals: Number.isFinite(Number(json.onChain.decimals)) ? Number(json.onChain.decimals) : null,
    totalSupply: json.onChain.totalSupplyFormatted ?? null,
    logoUrl: project?.logoUrl ?? dex?.logo ?? null,
    slug: project?.slug ?? dex?.registrySlug ?? null,
    projectPageExists: Boolean((canonical && project?.slug) || (dex?.projectClaimed && dex?.registrySlug)),
    explorerUrl: json.onChain.explorerUrl ?? null,
    dexListed: Boolean(dex?.listed),
    website: dex?.website ?? null,
  }
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
  onHistoryChange,
  visibilityOnly: _visibilityOnly = false,
}) => {
  const { address } = useAccount()
  const { data: signer } = useSigner()
  const buyerWallet = address ?? null
  const [step, setStep] = useState<CommercialCheckoutStep>('project')
  const [service, setService] = useState<CommercialServiceId | null>(initialService)
  const [selectedPackageId, setSelectedPackageId] = useState<string>('')
  const [identityChain, setIdentityChain] = useState(chainId)
  const [contract, setContract] = useState(projectContract ?? '')
  const [detected, setDetected] = useState<DetectedProject | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [draft, setDraft] = useState<ProjectDraft>(EMPTY_DRAFT)
  const [pay, setPay] = useState<CommercialPaymentAsset>('BNB')
  const [featuredFarm, setFeaturedFarm] = useState(false)
  const [featuredPool, setFeaturedPool] = useState(false)
  const [farmTarget, setFarmTarget] = useState('')
  const [poolTarget, setPoolTarget] = useState('')
  const [referral, setReferral] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [status, setStatus] = useState('idle')
  const [walletStage, setWalletStage] = useState<WalletFlowStage>('idle')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [quoteSummary, setQuoteSummary] = useState<string | null>(null)

  const serviceMeta = VISIBILITY_SERVICES.find((item) => item.id === service) ?? null
  const packages = service ? CATALOGS[service] ?? [] : []
  const selectedPackage =
    packages.find((item) => item.id === selectedPackageId) ??
    packages.find((item) => item.isDefault) ??
    packages[0] ??
    null
  const projectPageReady = Boolean(detected?.projectPageExists && identityReady)
  const hasAddOns = Boolean(featuredFarm || featuredPool)
  const runtimeCheckoutBlocker = visibilityCheckoutBlocker({
    service,
    payment: pay,
    projectPageReady,
    hasReferral: Boolean(referral.trim()),
    hasFeaturedAddOns: hasAddOns,
  })
  const checkoutBlocker =
    runtimeCheckoutBlocker ??
    (pay === 'MARCO_PAY' && !MARCO_PAY_APPLICATION
      ? 'MARCO PAY is not configured for this production application.'
      : null)
  const addOnCount = Number(featuredFarm) + Number(featuredPool)
  const subtotal = selectedPackage?.usdPrice ?? 0
  const addOnPrice = service === 'featured' ? subtotal * 0.5 : 0
  const totalUsd = subtotal + addOnPrice * addOnCount

  const detectProject = useCallback(async () => {
    if (!/^0x[a-fA-F0-9]{40}$/.test(contract.trim())) {
      setDetected(null)
      setError('Paste a valid EVM token contract address.')
      return
    }
    setDetecting(true)
    setError(null)
    try {
      const response = await fetch('/api/registry/projects/onboard', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ contract: contract.trim(), chainId: identityChain }),
      })
      const json = (await response.json()) as RegistryDetection
      if (!response.ok) throw new Error(json.reason || json.error || 'TOKEN_DETECTION_FAILED')
      const next = parseDetectedProject(json, contract.trim(), identityChain)
      if (!next) throw new Error('The token identity could not be resolved.')
      setDetected(next)
      setDraft((current) => ({
        ...current,
        handle: current.handle || next.slug || next.symbol.toLowerCase(),
        logoUrl: current.logoUrl || next.logoUrl || '',
        website: current.website || next.website || '',
      }))
    } catch (cause) {
      setDetected(null)
      setError(cause instanceof Error ? cause.message : String(cause))
    } finally {
      setDetecting(false)
    }
  }, [contract, identityChain])

  useEffect(() => {
    if (!open) return
    setService(initialService)
    setSelectedPackageId('')
    setIdentityChain(chainId)
    setContract(projectContract ?? '')
    setDetected(null)
    setDraft(EMPTY_DRAFT)
    setPay('BNB')
    setFeaturedFarm(false)
    setFeaturedPool(false)
    setFarmTarget('')
    setPoolTarget('')
    setReferral('')
    setError(null)
    setStatus('idle')
    setWalletStage('idle')
    setOrderId(null)
    setQuoteSummary(null)
    setBusy(false)
    setStep('project')
  }, [open, initialService, chainId, projectContract])

  useEffect(() => {
    if (!open || !/^0x[a-fA-F0-9]{40}$/.test(contract.trim())) return undefined
    const timer = window.setTimeout(() => void detectProject(), 350)
    return () => window.clearTimeout(timer)
  }, [open, contract, identityChain, detectProject])

  useEffect(() => {
    if (!selectedPackageId && selectedPackage) setSelectedPackageId(String(selectedPackage.id))
  }, [selectedPackage, selectedPackageId])

  const stepIndex = STEPS.indexOf(step)
  const modalSteps = STEPS.map((id, index) => ({
    id,
    label: STEP_LABELS[id],
    active: id === step,
    done: index < stepIndex,
  }))

  const publishDetectedProject = useCallback(async (): Promise<boolean> => {
    if (!detected) return false
    if (!address || !signer) {
      setError('Connect the project owner/deployer wallet to verify and publish the Project Page.')
      return false
    }
    if (!draft.description.trim()) {
      setError('Add a short project description before continuing.')
      return false
    }
    const metadata = normalizeClaimMetadata({
      name: detected.name,
      symbol: detected.symbol,
      handle: draft.handle || detected.symbol,
      description: draft.description,
      logo: draft.logoUrl || null,
      website: draft.website || null,
      x: draft.x || null,
      telegram: draft.telegram || null,
      discord: null,
    })
    if (!metadata.handle) {
      setError('Choose a valid Project Page handle before continuing.')
      return false
    }

    setBusy(true)
    try {
      const preflightResponse = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'preflight',
          chainId: detected.chainId,
          contract: detected.contract,
          claimant: address,
        }),
      })
      const preflight = await preflightResponse.json()
      if (!preflightResponse.ok || !preflight.ok) {
        throw new Error(preflight.reason || 'Project ownership verification failed.')
      }

      const issuedAt = new Date().toISOString()
      const message = buildProjectClaimMessage({
        chainId: detected.chainId,
        contract: detected.contract,
        claimant: address,
        metadata,
        issuedAt,
      })
      const signature = await signer.signMessage(message)
      const publishResponse = await fetch('/api/registry/projects/claim', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'publish',
          chainId: detected.chainId,
          contract: detected.contract,
          claimant: address,
          metadata,
          issuedAt,
          signature,
        }),
      })
      const published = await publishResponse.json()
      if (!publishResponse.ok || !published.ok) {
        throw new Error(published.reason || 'Project Page publication failed.')
      }
      const slug = published.claim?.slug ?? metadata.handle
      setDetected((current) =>
        current
          ? { ...current, tier: 'canonical', slug, projectPageExists: true, logoUrl: metadata.logo }
          : current,
      )
      return true
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Project Page publication failed.')
      return false
    } finally {
      setBusy(false)
    }
  }, [address, detected, draft, signer])

  const goNext = async () => {
    setError(null)
    if (step === 'project') {
      if (!detected) {
        setError('Detect the project before choosing visibility.')
        return
      }
      if (!detected.projectPageExists) {
        const published = await publishDetectedProject()
        if (!published) return
      }
      setStep('service')
      return
    }
    if (step === 'service') {
      if (!service) {
        setError('Choose a visibility service.')
        return
      }
      setStep('package')
      return
    }
    if (step === 'package') {
      if (!selectedPackage) {
        setError('Choose a duration.')
        return
      }
      if (featuredFarm && !farmTarget.trim()) {
        setError('Select the Farm to feature.')
        return
      }
      if (featuredPool && !poolTarget.trim()) {
        setError('Select the Pool to feature.')
        return
      }
      setStep('chain')
      return
    }
    if (step === 'chain') {
      setStep('payment')
      return
    }
    if (step === 'payment') {
      setStep('review')
      return
    }
    if (step === 'review') {
      setStep('checkout')
    }
  }

  const goBack = () => {
    setError(null)
    const index = STEPS.indexOf(step)
    if (index > 0) setStep(STEPS[index - 1])
  }

  const handleMarcoPayPassport = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const passport = event.detail?.passport as { passportNumber?: string | number } | undefined
    if (passport?.passportNumber === undefined) return
    setQuoteSummary(`MARCO Passport · ${String(passport.passportNumber)}`)
  }, [])

  const handleMarcoPayStarted = useCallback(() => {
    setError(null)
    setStatus('marco_pay_started')
    setWalletStage('confirm')
    setQuoteSummary('MARCO PAY opened · complete the secure payment flow')
  }, [])

  const handleMarcoPayCreated = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const paymentId = event.detail?.paymentId ?? event.detail?.id ?? event.detail?.reference
    setStatus('marco_pay_created')
    setWalletStage('confirm')
    setQuoteSummary(paymentId ? `MARCO PAY reference · ${String(paymentId)}` : 'MARCO PAY payment created')
  }, [])

  const handleMarcoPayCompleted = useCallback((event: CustomEvent<Record<string, unknown>>) => {
    const paymentId = event.detail?.paymentId ?? event.detail?.id ?? event.detail?.reference
    setStatus('marco_pay_pending_verification')
    setWalletStage('confirm')
    setQuoteSummary(
      `Payment received${paymentId ? ` · ${String(paymentId)}` : ''} · activation pending verified callback`,
    )
  }, [])

  const handleMarcoPayError = useCallback((cause: Error) => {
    setStatus('marco_pay_error')
    setWalletStage('error')
    setError(cause.message || 'MARCO PAY is temporarily unavailable.')
  }, [])

  const runCheckout = useCallback(async () => {
    setError(null)
    if (!selectedPackage || !service) return
    if (checkoutBlocker) {
      setError(checkoutBlocker)
      return
    }
    if (pay === 'MARCO_PAY') {
      setError('Complete payment in the MARCO PAY panel.')
      return
    }
    if (!buyerWallet || !/^0x[a-fA-F0-9]{40}$/.test(buyerWallet)) {
      setWalletStage('connect')
      setError(RC_COPY.connectWallet)
      return
    }
    if (pay === 'M_CREDITS') {
      setError(VISIBILITY_RUNTIME.M_CREDITS.reason)
      return
    }

    const paymentAsset = pay as MonetizationAsset
    const resolvedContract = detected?.contract ?? projectContract
    const resolvedSlug = detected?.slug ?? projectSlug
    setBusy(true)
    try {
      setWalletStage('confirm')
      const isFeatured = service === 'featured'
      let id: string
      let prepared: { to: string; valueHex: string; data: string }
      let quote: { tokenAmount: string; quoteExpiration: string }

      if (isFeatured) {
        const createRes = await fetch('/api/featured/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            projectId,
            projectSlug: resolvedSlug,
            projectContract: resolvedContract,
            buyerWallet,
            paymentAsset,
            packageId: selectedPackage.id,
            sourceFlow: 'boost-project',
          }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
        id = created.order.orderId as string
        setOrderId(id)
        const quoteRes = await fetch(`/api/featured/orders/${id}`, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', paymentAsset }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(
          `${quote.tokenAmount} ${paymentAsset} → ${FEATURED_OFFER.treasuryWallet.slice(
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
            projectSlug: resolvedSlug,
            projectContract: resolvedContract,
            buyerWallet,
            paymentAsset,
            packageId: selectedPackage.id,
          }),
        })
        const created = await createRes.json()
        if (!createRes.ok) throw new Error(created.error || 'ORDER_CREATE_FAILED')
        id = created.order.orderId as string
        setOrderId(id)
        const quoteRes = await fetch('/api/trend-boost/orders', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ action: 'quote', orderId: id, paymentAsset }),
        })
        const quoted = await quoteRes.json()
        if (!quoteRes.ok) throw new Error(quoted.error || 'QUOTE_FAILED')
        quote = quoted.quote
        prepared = quoted.prepared
        setQuoteSummary(`${quote.tokenAmount} ${paymentAsset} · ${selectedPackage.durationLabel}`)
      }

      setStatus('awaiting_wallet')
      if (!signer) {
        setWalletStage('error')
        throw new Error(RC_COPY.walletUnavailable)
      }
      const connectedChainId = await signer.getChainId()
      if (connectedChainId !== 56) {
        setWalletStage('switch_network')
        throw new Error(RC_COPY.wrongNetwork)
      }

      let txHash: string
      let receipt: Awaited<ReturnType<Awaited<ReturnType<typeof signer.sendTransaction>>['wait']>>
      try {
        const transaction = await signer.sendTransaction({
          to: prepared.to,
          value: prepared.valueHex,
          data: prepared.data,
        })
        txHash = transaction.hash
        receipt = await transaction.wait(1)
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        if (/reject|denied|cancel/i.test(message)) {
          await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(isFeatured ? { action: 'cancel' } : { action: 'cancel', orderId: id }),
          })
          setStatus('cancelled')
          setWalletStage('cancelled')
          setError(RC_COPY.paymentCancelled)
          return
        }
        throw cause
      }

      await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(
          isFeatured
            ? { action: 'submit', transactionHash: txHash }
            : { action: 'submit', orderId: id, transactionHash: txHash },
        ),
      })
      setStatus('submitted')
      if (!receipt) {
        setError('Payment submitted — receipt not yet available.')
        setStatus('submitted_pending_receipt')
        return
      }

      const confirmRes = await fetch(isFeatured ? `/api/featured/orders/${id}` : '/api/trend-boost/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm-receipt',
          ...(isFeatured ? {} : { orderId: id }),
          transactionHash: txHash,
          receipt: {
            to: receipt.to,
            value: null,
            status: receipt.status,
            logs: receipt.logs,
          },
        }),
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
      setQuoteSummary(
        `Payment confirmed · order ${id}${
          paymentAsset === 'MARCO' ? ` · ${cashbackUserMessage('ELIGIBLE_PENDING')}` : ''
        }`,
      )
      appendMarketingHistory(resolvedSlug || projectSlug, {
        kind: isFeatured ? 'featured' : 'trend-boost',
        label: selectedPackage.label,
        status: 'Running',
        packageId: String(selectedPackage.id),
        expiresAt: new Date(Date.now() + selectedPackage.durationMs).toISOString(),
      })
      onHistoryChange?.()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
      setStatus('error')
      setWalletStage('error')
    } finally {
      setBusy(false)
    }
  }, [
    buyerWallet,
    checkoutBlocker,
    detected,
    onHistoryChange,
    pay,
    projectContract,
    projectId,
    projectSlug,
    selectedPackage,
    service,
    signer,
  ])

  const preview = useMemo(
    () => (
      <MelegaModalPreview data-testid="commercial-checkout-preview">
        <PreviewLine>
          <strong>Project identity</strong>
        </PreviewLine>
        {detected ? (
          <>
            <Identity style={{ marginTop: 10 }}>
              <Logo>{detected.logoUrl ? <img src={detected.logoUrl} alt="" /> : detected.symbol.slice(0, 1)}</Logo>
              <div>
                <strong>{detected.name}</strong>
                <Meta>
                  ${detected.symbol} · {IDENTITY_CHAINS.find((item) => item.id === detected.chainId)?.label}
                </Meta>
              </div>
            </Identity>
            <PreviewLine>Supply · {compactSupply(detected.totalSupply)}</PreviewLine>
            <PreviewLine>Decimals · {detected.decimals ?? 'Unavailable'}</PreviewLine>
            <PreviewLine>Project Page · {detected.projectPageExists ? `@${detected.slug}` : 'Required'}</PreviewLine>
            <PreviewLine>DEX listing · {detected.dexListed ? 'MelegaSwap listed' : 'Not verified'}</PreviewLine>
            {detected.website ? <PreviewLine>Website · {detected.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}</PreviewLine> : null}
          </>
        ) : (
          <PreviewLine>Paste a contract to load canonical data.</PreviewLine>
        )}
        {serviceMeta ? <PreviewLine>Service · {serviceMeta.title}</PreviewLine> : null}
        {selectedPackage ? <PreviewLine>Duration · {selectedPackage.shortLabel}</PreviewLine> : null}
        {selectedPackage ? <PreviewLine>Total · ${totalUsd}</PreviewLine> : null}
        <PreviewLine>Settlement · {pay === 'MARCO_PAY' ? 'MARCO PAY' : 'BNB Chain'}</PreviewLine>
        <PreviewLine>Payment · {pay === 'MARCO_PAY' ? 'MARCO PAY' : pay}</PreviewLine>
        {referral ? <PreviewLine>Referral · 50% attribution requested</PreviewLine> : null}
        {orderId ? <PreviewLine>Order · {orderId}</PreviewLine> : null}
      </MelegaModalPreview>
    ),
    [detected, orderId, pay, referral, selectedPackage, serviceMeta, totalUsd],
  )

  const footer = (
    <MelegaModalFooter>
      <MelegaModalFooterMeta>
        {selectedPackage
          ? `${selectedPackage.label} · $${totalUsd}`
          : detected
          ? `${detected.name} · $${detected.symbol}`
          : 'Boost Your Project'}
      </MelegaModalFooterMeta>
      <MelegaModalFooterActions>
        {step !== 'project' ? (
          <GhostBtn type="button" onClick={goBack} data-testid="commercial-checkout-back">
            Back
          </GhostBtn>
        ) : (
          <GhostBtn type="button" onClick={onClose} data-testid="commercial-checkout-cancel">
            Cancel
          </GhostBtn>
        )}
        {step === 'checkout' ? (
          <PrimaryBtn
            type="button"
            disabled={busy || Boolean(checkoutBlocker) || pay === 'MARCO_PAY'}
            onClick={() => void runCheckout()}
            data-testid="commercial-checkout-pay"
          >
            {busy ? 'Processing…' : pay === 'MARCO_PAY' ? 'Complete in MARCO PAY' : 'Pay & activate'}
          </PrimaryBtn>
        ) : (
          <PrimaryBtn
            type="button"
            onClick={() => void goNext()}
            disabled={busy || detecting}
            data-testid="commercial-checkout-next"
          >
            {busy && step === 'project' ? 'Verifying & publishing…' : 'Continue'}
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
      subtitle="Identify once, complete the Project Page, then choose visibility and payment."
      steps={modalSteps}
      size="lg"
      footer={footer}
      testId="commercial-checkout-modal"
      closeTestId="commercial-checkout-close"
      closeOnBackdrop={!busy}
      closeOnEscape={!busy}
    >
      <Grid>
        <Stack>
          {step === 'project' ? (
            <div data-testid="commercial-step-project">
              <Label>Project contract</Label>
              <DetectRow>
                <Select
                  value={identityChain}
                  onChange={(event) => {
                    setIdentityChain(Number(event.target.value))
                    setDetected(null)
                  }}
                  aria-label="Project chain"
                >
                  {IDENTITY_CHAINS.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </Select>
                <Input
                  value={contract}
                  onChange={(event) => {
                    setContract(event.target.value)
                    setDetected(null)
                  }}
                  placeholder="Paste token contract address (0x…)"
                />
                <PrimaryBtn type="button" disabled={detecting} onClick={() => void detectProject()}>
                  {detecting ? 'Detecting…' : 'Detect token'}
                </PrimaryBtn>
              </DetectRow>
              {detected ? (
                <Stack style={{ marginTop: 10 }}>
                  <Identity>
                    <Logo>
                      {detected.logoUrl ? (
                        <img src={detected.logoUrl} alt={`${detected.name} logo`} />
                      ) : (
                        detected.symbol.slice(0, 1)
                      )}
                    </Logo>
                    <div>
                      <STitle>
                        {detected.name} · ${detected.symbol}
                      </STitle>
                      <Meta>
                        {IDENTITY_CHAINS.find((item) => item.id === detected.chainId)?.label} · Supply{' '}
                        {compactSupply(detected.totalSupply)} · {detected.decimals ?? '—'} decimals
                      </Meta>
                      <BadgeRow>
                        <Badge $green={detected.projectPageExists}>
                          {detected.projectPageExists ? `Project Page @${detected.slug}` : 'Project Page required'}
                        </Badge>
                        {detected.dexListed ? (
                          <Badge $green>Listed</Badge>
                        ) : (
                          <Badge>Detected on-chain</Badge>
                        )}
                      </BadgeRow>
                    </div>
                  </Identity>
                  {!detected.projectPageExists ? (
                    <>
                      <Alert>
                        Complete the missing Project Page details here. Continue verifies the connected owner/deployer
                        wallet, requests a safe signature and publishes the Project Page without leaving this popup.
                      </Alert>
                      <FieldGrid>
                        <Input
                          value={draft.handle}
                          onChange={(event) => setDraft({ ...draft, handle: event.target.value.replace(/^@/, '') })}
                          placeholder="@handle"
                        />
                        <Input
                          value={draft.logoUrl}
                          onChange={(event) => setDraft({ ...draft, logoUrl: event.target.value })}
                          placeholder="Logo URL"
                        />
                        <Input
                          value={draft.website}
                          onChange={(event) => setDraft({ ...draft, website: event.target.value })}
                          placeholder="Website"
                        />
                        <Input
                          value={draft.x}
                          onChange={(event) => setDraft({ ...draft, x: event.target.value })}
                          placeholder="X / Twitter"
                        />
                        <Input
                          value={draft.telegram}
                          onChange={(event) => setDraft({ ...draft, telegram: event.target.value })}
                          placeholder="Telegram"
                        />
                      </FieldGrid>
                      <Textarea
                        value={draft.description}
                        onChange={(event) => setDraft({ ...draft, description: event.target.value })}
                        placeholder="Short project description"
                      />
                    </>
                  ) : null}
                </Stack>
              ) : null}
            </div>
          ) : null}

          {step === 'service' ? (
            <div data-testid="commercial-step-service">
              <Label>Choose service</Label>
              <ServiceGrid>
                {VISIBILITY_SERVICES.map((item) => {
                  const live = Boolean(VISIBILITY_RUNTIME[item.id]?.live)
                  return (
                    <ServiceCard
                      key={item.id}
                      type="button"
                      $on={service === item.id}
                      $live={live}
                      onClick={() => {
                        setService(item.id)
                        setSelectedPackageId('')
                        setFeaturedFarm(false)
                        setFeaturedPool(false)
                      }}
                      data-testid={`commercial-service-${item.id}`}
                    >
                      <Icon>{item.icon}</Icon>
                      <STitle>{item.title}</STitle>
                      <SDesc>{item.description}</SDesc>
                      <SPrice>{live ? item.priceHint : `${item.priceHint} · activation pending`}</SPrice>
                    </ServiceCard>
                  )
                })}
              </ServiceGrid>
            </div>
          ) : null}

          {step === 'package' ? (
            <div data-testid="commercial-step-package">
              <Label>Choose duration</Label>
              <PkgGrid>
                {packages.map((item) => (
                  <PkgCard
                    key={item.id}
                    type="button"
                    $on={selectedPackage?.id === item.id}
                    onClick={() => setSelectedPackageId(String(item.id))}
                    data-testid={`commercial-pkg-${item.id}`}
                  >
                    <STitle>{item.shortLabel}</STitle>
                    <SDesc>{item.durationLabel}</SDesc>
                    <SPrice>${item.usdPrice}</SPrice>
                    <BadgeRow>
                      {(service === 'trend-boost' ? TREND_PACKAGE_BADGES : FEATURED_PACKAGE_BADGES)
                        .slice(0, 2)
                        .map((badge) => (
                          <Badge key={badge}>{badge}</Badge>
                        ))}
                    </BadgeRow>
                  </PkgCard>
                ))}
              </PkgGrid>
              {service === 'featured' && selectedPackage ? (
                <Stack style={{ marginTop: 10 }}>
                  <Label>Bundle placements · 50% off each add-on</Label>
                  <CheckRow>
                    <input
                      type="checkbox"
                      checked={featuredFarm}
                      onChange={(event) => setFeaturedFarm(event.target.checked)}
                    />
                    <span>
                      <strong>Featured Farm</strong>
                      <Meta>Premium Farm hero rotation</Meta>
                    </span>
                    <strong>${addOnPrice}</strong>
                  </CheckRow>
                  {featuredFarm ? (
                    <Input
                      value={farmTarget}
                      onChange={(event) => setFarmTarget(event.target.value)}
                      placeholder="Select Farm ID or LP address"
                    />
                  ) : null}
                  <CheckRow>
                    <input
                      type="checkbox"
                      checked={featuredPool}
                      onChange={(event) => setFeaturedPool(event.target.checked)}
                    />
                    <span>
                      <strong>Featured Pool</strong>
                      <Meta>Premium Pool hero rotation</Meta>
                    </span>
                    <strong>${addOnPrice}</strong>
                  </CheckRow>
                  {featuredPool ? (
                    <Input
                      value={poolTarget}
                      onChange={(event) => setPoolTarget(event.target.value)}
                      placeholder="Select Pool ID or staking contract"
                    />
                  ) : null}
                  {hasAddOns ? (
                    <Alert>
                      Bundle pricing is configured, but Farm/Pool settlement and rotation fulfilment remain blocked
                      until their production services are activated.
                    </Alert>
                  ) : null}
                </Stack>
              ) : null}
            </div>
          ) : null}

          {step === 'chain' ? (
            <div data-testid="commercial-step-chain">
              <Label>Settlement network</Label>
              <ChipRow>
                <Chip type="button" $on>
                  BNB Chain
                </Chip>
              </ChipRow>
              <Meta style={{ marginTop: 8 }}>Selected automatically for commercial placements.</Meta>
            </div>
          ) : null}

          {step === 'payment' ? (
            <div data-testid="commercial-step-payment">
              <Label>Choose payment</Label>
              <ChipRow>
                {(['BNB', 'USDT', 'USDC', 'MARCO', 'MARCO_PAY', 'M_CREDITS'] as CommercialPaymentAsset[]).map(
                  (asset) => (
                    <Chip
                      key={asset}
                      type="button"
                      $on={pay === asset}
                      onClick={() => setPay(asset)}
                      data-testid={`commercial-pay-${asset}`}
                    >
                      {asset === 'MARCO_PAY' ? 'MARCO PAY' : asset}
                      {asset === 'MARCO'
                        ? ' · +5% CASHBACK'
                        : asset === 'MARCO_PAY'
                        ? ' · Passport'
                        : asset === 'M_CREDITS'
                        ? ' · MARCO Passport'
                        : ''}
                    </Chip>
                  ),
                )}
              </ChipRow>
              {pay === 'MARCO' ? (
                <BadgeRow>
                  <Badge $purple>+5% cashback</Badge>
                  <Meta>Cashback is credited after verified settlement.</Meta>
                </BadgeRow>
              ) : null}
              {pay === 'M_CREDITS' ? <Alert>{VISIBILITY_RUNTIME.M_CREDITS.reason}</Alert> : null}
              {pay === 'MARCO_PAY' ? (
                <BadgeRow>
                  <Badge $purple>Official checkout</Badge>
                  <Meta>Secure MARCO Passport payment. Activation follows a verified provider callback.</Meta>
                </BadgeRow>
              ) : null}
              <div style={{ marginTop: 12 }}>
                <Label>Referral link · 50% to referrer</Label>
                <Input
                  value={referral}
                  onChange={(event) => setReferral(event.target.value)}
                  placeholder="Paste referral link or wallet-linked code"
                />
                {referral ? (
                  <Alert>{VISIBILITY_RUNTIME.referral.reason}</Alert>
                ) : (
                  <Meta style={{ marginTop: 6 }}>
                    Permanent attribution will be shown in My Melega once the referral ledger is active.
                  </Meta>
                )}
              </div>
            </div>
          ) : null}

          {step === 'review' ? (
            <div data-testid="commercial-step-review">
              <Label>Review</Label>
              <Meta>
                {detected?.name} · {serviceMeta?.title} · {selectedPackage?.label}
              </Meta>
              <Meta style={{ marginTop: 7 }}>
                {pay === 'MARCO_PAY'
                  ? `Pay $${totalUsd} with MARCO PAY`
                  : `Pay $${totalUsd} in ${pay} · settlement on BNB Chain`}
              </Meta>
              {featuredFarm ? <Meta>Featured Farm · {farmTarget} · 50% off</Meta> : null}
              {featuredPool ? <Meta>Featured Pool · {poolTarget} · 50% off</Meta> : null}
              {checkoutBlocker ? (
                <Alert $error style={{ marginTop: 10 }}>
                  {checkoutBlocker}
                </Alert>
              ) : (
                <Alert style={{ marginTop: 10 }}>
                  Ready for verified wallet settlement and automatic placement activation.
                </Alert>
              )}
            </div>
          ) : null}

          {step === 'checkout' ? (
            <div data-testid="commercial-step-checkout">
              <Label>Checkout</Label>
              {checkoutBlocker ? (
                <Alert $error>{checkoutBlocker}</Alert>
              ) : pay === 'MARCO_PAY' ? (
                <>
                  <Meta>Complete the official MARCO PAY flow below.</Meta>
                  <div style={{ marginTop: 12 }}>
                    <MarcoPay
                      application={MARCO_PAY_APPLICATION}
                      amount={String(Math.round(totalUsd * 100))}
                      currency="USD"
                      item={`${serviceMeta?.title ?? 'Melega DEX visibility'} · ${detected?.symbol ?? projectSlug}`}
                      onPassportResolved={handleMarcoPayPassport}
                      onPaymentStarted={handleMarcoPayStarted}
                      onPaymentCreated={handleMarcoPayCreated}
                      onPaymentCompleted={handleMarcoPayCompleted}
                      onError={handleMarcoPayError}
                    />
                  </div>
                  <Meta style={{ marginTop: 8 }}>
                    A client event never activates a placement. Melega verifies the provider callback first.
                  </Meta>
                </>
              ) : (
                <Meta>Confirm in your wallet. Placement activates only after a verified receipt.</Meta>
              )}
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
