/**
 * Create Farm — human-guided wizard UX.
 * Protocol engines (eligibility, fees, drafts, capability) stay identical underneath.
 * No protocol terminology is shown to users.
 */
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/router'
import dynamic from 'next/dynamic'
import { WBNB } from '@pancakeswap/sdk'
import { typography } from 'design-system/melega'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaAccordionSection } from 'design-system/melega/components/Modal'
import { melegaZIndex } from 'design-system/melega/tokens/melegaZIndex'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { MELEGA_CHAIN_ID } from 'lib/bsc-indexer/constants'
import { getCanonicalIndexedAssets } from 'lib/canonical-token-registry'
import { useToken } from 'hooks/Tokens'
import useBUSDPrice from 'hooks/useBUSDPrice'
import { useAmmPairRegistry } from 'lib/bsc-indexer/client/useAmmPairRegistry'
import { farmsHero } from './farmsHeroTokens'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from './publicFarmFactoryCapability'
import { CREATE_FARM_UX } from './createFarmUxCopy'
import {
  CREATE_FARM_RETURN_PATH,
  createDefaultPublicFarmFactoryDraft,
  loadDraftFromStorage,
  pairContainsMarcoAddress,
  parseReturnToCreateFarm,
  recheckDraftEligibility,
  saveDraftToStorage,
  type PublicFarmFactoryDraft,
  type PublicFarmSelectedPair,
} from './publicFarmFactoryDraft'
import { resolvePublicFarmFactoryFee } from './publicFarmFactoryFee'
import {
  PUBLIC_FARM_MINIMUM_TVL_BNB,
  evaluatePublicFarmEligibility,
  estimatePairTvlBnb,
  rejectMarcoReward,
  type PublicFarmEligibilityResult,
} from './publicFarmEligibility'
import { filterPairsForFarmFactory, formatFarmPairLabel, toSelectedPair } from './publicFarmPairSearch'
import { computeFarmAprPercent } from './publicFarmEconomics'
import type { FarmLiquidityResolution } from './FarmInlineLiquidityStep'

const FarmInlineLiquidityStep = dynamic(() => import('./FarmInlineLiquidityStep'), {
  ssr: false,
  loading: () => <InlineLoading data-testid="create-farm-liquidity-loading">Loading liquidity tools…</InlineLoading>,
})

const Section = styled.section`
  width: 100%;
  max-width: ${farmsHero.contentMax};
  box-sizing: border-box;
  border-radius: 0;
  border: none;
  background: transparent;
  padding: 8px 12px 12px;
  font-family: ${typography.fontFamily.body};
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;

  @media (max-width: 767px) {
    padding: 6px 10px 10px;
  }
`

const Header = styled.div`
  display: none;
`

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  line-height: 28px;
  font-weight: 750;
  color: #f5f5f5;
`

const Subtitle = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.58);
  max-width: 640px;
`

const StepLabel = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(244, 196, 48, 0.85);
`

const ModeRow = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: 8px;

  > * {
    flex: 1 1 0;
  }
`

const PairStepLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(250px, 0.85fr);
  gap: 10px;
  align-items: stretch;

  > [data-testid='public-farm-pair-mode'],
  > [data-testid='public-farm-low-liquidity-remediation'] {
    grid-column: 1 / -1;
  }

  > [data-testid='public-farm-pair-search'],
  > [data-testid='public-farm-eligibility'] {
    margin: 0;
    min-height: 100%;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;

    > * {
      grid-column: 1 !important;
    }
  }
`

const ModeBtn = styled.button<{ $active?: boolean }>`
  min-height: 38px;
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.55)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $active }) => ($active ? 'rgba(244, 196, 48, 0.14)' : 'rgba(255, 255, 255, 0.03)')};
  color: ${({ $active }) => ($active ? '#F4C430' : '#f2f2f2')};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
`

const Body = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  align-items: start;
  gap: 16px;
  min-width: 0;

  @media (max-width: 1023px) {
    grid-template-columns: 1fr;
  }
`

const FieldsCol = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  grid-column: 1;
  grid-row: 1;

  @media (max-width: 1023px) {
    grid-column: auto;
    grid-row: auto;
    order: 1;
  }
`

const FieldsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 16px;
  row-gap: 16px;
  width: 100%;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 0;
`

const Label = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.5);
`

const inputStyles = `
  margin-top: 8px;
  height: 44px;
  box-sizing: border-box;
  padding: 0 12px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.03);
  font-size: 14px;
  font-weight: 650;
  color: #f2f2f2;
`

const InputBox = styled.input`
  ${inputStyles}
  &::placeholder {
    color: rgba(255, 255, 255, 0.35);
  }
`

const ReadOnlyValue = styled.div<{ $accent?: string }>`
  ${inputStyles}
  display: flex;
  align-items: center;
  color: ${({ $accent }) => $accent || '#f2f2f2'};
`

const FeeNote = styled.span`
  margin-top: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
`

const Panel = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(15, 15, 15, 0.75);
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const PanelTitle = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 750;
  color: #f2f2f2;
`

const Hint = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);
`

const StatusLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);

  strong {
    color: #f5f5f5;
  }
`

const Check = styled.span`
  color: #18f089;
  font-weight: 800;
`

const MetricBlock = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px 16px;

  @media (max-width: 599px) {
    grid-template-columns: 1fr;
  }
`

const Metric = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const MetricLabel = styled.span`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const MetricValue = styled.span`
  font-size: 18px;
  font-weight: 750;
  color: #f5f5f5;
`

const PairSearchWrap = styled.div`
  position: relative;
  min-width: 0;
`

const PairDropdown = styled.div<{ $top: number; $left: number; $width: number }>`
  position: fixed;
  z-index: ${melegaZIndex.overlayStacked};
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: ${({ $width }) => $width}px;
  max-height: min(280px, calc(100vh - 24px));
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  padding: 8px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
`

const PairDropdownList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  max-height: 240px;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const PairDropdownItem = styled.button<{ $active?: boolean }>`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 10px;
  border: none;
  border-radius: 10px;
  background: ${({ $active }) => ($active ? 'rgba(24, 240, 137, 0.08)' : 'transparent')};
  border: 1px solid ${({ $active }) => ($active ? 'rgba(24, 240, 137, 0.35)' : 'transparent')};
  color: #f2f2f2;
  padding: 10px 12px;
  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255, 255, 255, 0.04);
  }
`

const PairDropdownMeta = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
`

const PairDropdownName = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: #f2f2f2;
  line-height: 18px;
`

const PairDropdownSub = styled.span`
  font-size: 11px;
  line-height: 14px;
  color: rgba(255, 255, 255, 0.5);
`

const PairTokenStack = styled.div`
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;

  & > *:nth-child(2) {
    margin-left: -8px;
  }
`

const Remediation = styled.div`
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  background: rgba(244, 196, 48, 0.07);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const RemediationTitle = styled.p`
  margin: 0;
  font-size: 16px;
  font-weight: 750;
  color: #f4c430;
`

const InlineLoading = styled.div`
  min-height: 132px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.025);
  color: rgba(255, 255, 255, 0.55);
  font-size: 13px;
`

const RefreshRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(24, 240, 137, 0.25);
  background: rgba(24, 240, 137, 0.06);
  color: rgba(255, 255, 255, 0.72);
  font-size: 13px;
  line-height: 18px;

  @media (max-width: 599px) {
    align-items: stretch;
    flex-direction: column;
  }
`

const RefreshButton = styled.button`
  flex-shrink: 0;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 10px;
  border: 1px solid rgba(24, 240, 137, 0.38);
  background: rgba(24, 240, 137, 0.1);
  color: #18f089;
  font-size: 12px;
  font-weight: 750;
  cursor: pointer;

  &:disabled {
    cursor: wait;
    opacity: 0.6;
  }
`

const PrimaryButton = styled.button<{ $ready?: boolean }>`
  align-self: flex-start;
  min-height: 48px;
  min-width: 180px;
  padding: 0 22px;
  border-radius: 12px;
  border: 1px solid ${({ $ready }) => ($ready ? 'rgba(24, 240, 137, 0.45)' : 'rgba(255, 255, 255, 0.12)')};
  background: ${({ $ready }) => ($ready ? 'rgba(24, 240, 137, 0.16)' : 'rgba(255, 255, 255, 0.04)')};
  color: ${({ $ready }) => ($ready ? '#18f089' : 'rgba(255, 255, 255, 0.55)')};
  font-size: 15px;
  font-weight: 750;
  cursor: ${({ $ready }) => ($ready ? 'pointer' : 'default')};

  @media (max-width: 767px) {
    width: 100%;
  }
`

const SoftNote = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);
`

const RejectBanner = styled.div`
  border-radius: 12px;
  border: 1px solid rgba(244, 196, 48, 0.4);
  background: rgba(244, 196, 48, 0.08);
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 650;
  color: #f4c430;
  white-space: pre-line;
`

const PreviewCol = styled.aside`
  width: 300px;
  min-width: 300px;
  box-sizing: border-box;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 15, 15, 0.92);
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 12px;
  grid-column: 2;
  grid-row: 1;

  @media (max-width: 1023px) {
    width: 100%;
    min-width: 0;
    position: relative;
    top: auto;
    grid-column: auto;
    grid-row: auto;
    order: 2;
  }
`

const PreviewTitle = styled.span`
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.45);
`

const ReviewRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.55);

  strong {
    color: #f2f2f2;
    font-weight: 700;
    text-align: right;
    max-width: 60%;
  }
`

const FundingFlow = styled.ol`
  list-style: none;
  margin: 4px 0 0;
  padding: 12px 0 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  gap: 9px;
`

const FundingStep = styled.li<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: 22px minmax(0, 1fr);
  gap: 8px;
  align-items: start;
  color: ${({ $active }) => ($active ? '#f2f2f2' : 'rgba(255,255,255,0.5)')};
  font-size: 11px;
  line-height: 15px;

  span:first-child {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    border: 1px solid ${({ $active }) => ($active ? 'rgba(244,196,48,.55)' : 'rgba(255,255,255,.14)')};
    color: ${({ $active }) => ($active ? '#f4c430' : 'rgba(255,255,255,.45)')};
    font-size: 9px;
    font-weight: 800;
  }
`

function parseNum(raw: string): number {
  const n = Number(String(raw).replace(/[^0-9.]/g, ''))
  return Number.isFinite(n) ? n : 0
}

export function computeEstimatedFarmApr(
  draft: PublicFarmFactoryDraft,
  pairTvlBnb?: number | null,
  rewardTokenUsd?: number,
  bnbUsd?: number,
): string {
  const daily = parseNum(draft.emissionRate)
  const apr = computeFarmAprPercent({ dailyRewardTokens: daily, pairTvlBnb, rewardTokenUsd, bnbUsd })
  if (apr == null) return '—'
  return `${apr.toFixed(1)}%`
}

function formatBnb(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return '—'
  return `${n.toFixed(2)} BNB`
}

type NextAction = 'select_pair' | 'increase_liquidity' | 'continue_config' | 'create_farm'

type LiquidityResolutionState = 'idle' | 'refreshing' | 'indexing' | 'ready'
type FarmAccordionId = 'pair' | 'liquidity' | 'reward' | 'budget' | 'advanced'

export const PublicFarmFactoryWorkspace: React.FC = () => {
  const router = useRouter()
  const [draft, setDraft] = useState<PublicFarmFactoryDraft>(() => createDefaultPublicFarmFactoryDraft())
  const [pairQuery, setPairQuery] = useState('')
  const rewardTokenOptions = useMemo(
    () =>
      getCanonicalIndexedAssets()
        .filter((asset) => asset.chainId === MELEGA_CHAIN_ID && asset.address && asset.symbol)
        .sort((a, b) => a.symbol.localeCompare(b.symbol)),
    [],
  )
  const [pairDropdownOpen, setPairDropdownOpen] = useState(false)
  const pairSearchRef = useRef<HTMLInputElement>(null)
  const pairDropdownRef = useRef<HTMLDivElement>(null)
  const [pairDropdownCoords, setPairDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(
    null,
  )
  const [hydrated, setHydrated] = useState(false)
  const [createSoftNote, setCreateSoftNote] = useState<string | null>(null)
  const [openAcc, setOpenAcc] = useState<FarmAccordionId | null>('pair')
  const [liquidityResolution, setLiquidityResolution] = useState<LiquidityResolutionState>('idle')
  const rewardTokenCurrency = useToken(
    /^0x[a-fA-F0-9]{40}$/.test(draft.rewardTokenAddress) ? draft.rewardTokenAddress : undefined,
  )
  const rewardTokenPrice = useBUSDPrice(rewardTokenCurrency ?? undefined)
  const bnbPrice = useBUSDPrice(WBNB[MELEGA_CHAIN_ID])
  const [lastLiquidityResolution, setLastLiquidityResolution] = useState<FarmLiquidityResolution | null>(null)

  const toggleAcc = useCallback((id: FarmAccordionId) => {
    setOpenAcc((prev) => (prev === id ? null : id))
  }, [])

  useEffect(() => {
    if (openAcc === 'pair') return
    setPairDropdownOpen(false)
  }, [openAcc])

  const { pairs, mutate: refreshPairs } = useAmmPairRegistry({
    q: pairQuery || undefined,
    page: 1,
    pageSize: 40,
  })

  const filteredPairs = useMemo(() => filterPairsForFarmFactory(pairs, pairQuery), [pairs, pairQuery])

  const syncPairDropdownCoords = useCallback(() => {
    const el = pairSearchRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const width = Math.max(rect.width, 280)
    const preferredTop = rect.bottom + 6
    const maxTop = window.innerHeight - 24 - 280
    const top = Math.min(preferredTop, Math.max(12, maxTop))
    let left = rect.left
    if (left + width > window.innerWidth - 12) left = Math.max(12, window.innerWidth - width - 12)
    setPairDropdownCoords({ top, left, width })
  }, [])

  useLayoutEffect(() => {
    if (!pairDropdownOpen) {
      setPairDropdownCoords(null)
      return
    }
    syncPairDropdownCoords()
    const onScroll = () => syncPairDropdownCoords()
    window.addEventListener('resize', syncPairDropdownCoords)
    window.addEventListener('scroll', onScroll, true)
    return () => {
      window.removeEventListener('resize', syncPairDropdownCoords)
      window.removeEventListener('scroll', onScroll, true)
    }
  }, [pairDropdownOpen, syncPairDropdownCoords])

  useEffect(() => {
    if (!pairDropdownOpen) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (pairSearchRef.current?.contains(t)) return
      if (pairDropdownRef.current?.contains(t)) return
      setPairDropdownOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPairDropdownOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [pairDropdownOpen])

  const patch = useCallback((partial: Partial<PublicFarmFactoryDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...partial, updatedAt: new Date().toISOString() }
      saveDraftToStorage(next)
      return next
    })
  }, [])

  useEffect(() => {
    const budget = parseNum(draft.rewardBudget)
    const duration = parseNum(draft.durationDays)
    const nextEmission = budget > 0 && duration > 0 ? (budget / duration).toFixed(8).replace(/\.?0+$/, '') : ''
    if (draft.emissionRate !== nextEmission) patch({ emissionRate: nextEmission })
  }, [draft.rewardBudget, draft.durationDays, draft.emissionRate, patch])

  useEffect(() => {
    if (!router.isReady || hydrated) return
    const search = typeof window !== 'undefined' ? window.location.search : ''
    const { returning, draftId } = parseReturnToCreateFarm(search)
    const stored = loadDraftFromStorage()
    if (stored && (!draftId || stored.draftId === draftId || returning)) {
      setDraft(stored)
    }
    setHydrated(true)
    if (returning && typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.delete('return')
      url.searchParams.delete('draftId')
      url.searchParams.delete('destination')
      window.history.replaceState(
        {},
        '',
        `${url.pathname}${url.search}${CREATE_FARM_RETURN_PATH.includes('#') ? '#create-farm' : ''}`,
      )
    }
  }, [router.isReady, hydrated])

  const eligibility: PublicFarmEligibilityResult = useMemo(
    () => (draft.selectedPair ? recheckDraftEligibility(draft) : evaluatePublicFarmEligibility(null)),
    [draft],
  )

  const marcoReject = useMemo(
    () => rejectMarcoReward(draft.rewardTokenAddress || draft.rewardToken),
    [draft.rewardToken, draft.rewardTokenAddress],
  )

  const containsMarco = pairContainsMarcoAddress(draft.selectedPair, MARCO_BSC_ADDRESS)
  const feeResult = useMemo(
    () =>
      resolvePublicFarmFactoryFee({
        rewardToken: draft.rewardTokenAddress || draft.rewardToken,
        pairContainsMarco: containsMarco,
      }),
    [draft.rewardToken, draft.rewardTokenAddress, containsMarco],
  )

  const rewardTokenUsd = rewardTokenPrice ? Number(rewardTokenPrice.toSignificant(8)) : undefined
  const bnbUsd = bnbPrice ? Number(bnbPrice.toSignificant(8)) : undefined
  const estimatedApr = computeEstimatedFarmApr(draft, eligibility.currentTvlBnb, rewardTokenUsd, bnbUsd)
  const needsLiquidity = Boolean(draft.selectedPair) && !eligibility.eligible && eligibility.status !== 'missing_pair'
  const configReady =
    eligibility.eligible &&
    !marcoReject.rejected &&
    parseNum(draft.rewardBudget) > 0 &&
    parseNum(draft.emissionRate) > 0 &&
    parseNum(draft.durationDays) > 0 &&
    Boolean(draft.rewardToken.trim()) &&
    feeResult.ok

  const nextAction: NextAction = !draft.selectedPair
    ? draft.selectionMode === 'create_new'
      ? 'increase_liquidity'
      : 'select_pair'
    : needsLiquidity
    ? 'increase_liquidity'
    : !configReady
    ? 'continue_config'
    : 'create_farm'

  const selectPair = (pair: PublicFarmSelectedPair) => {
    setCreateSoftNote(null)
    setPairDropdownOpen(false)
    patch({ selectedPair: pair, selectionMode: 'search_existing' })
  }

  const resolvePairAfterLiquidity = useCallback(
    async (resolution?: FarmLiquidityResolution | null) => {
      const target = resolution ?? lastLiquidityResolution
      if (!target) return
      setLiquidityResolution('refreshing')
      setCreateSoftNote(null)
      try {
        const fresh = await refreshPairs()
        const rows = fresh?.rows ?? pairs
        const address = target.pairAddress?.toLowerCase()
        const tokens = [target.token0.toLowerCase(), target.token1.toLowerCase()].sort().join(':')
        const match = rows.find((row) => {
          if (address && row.pairAddress.toLowerCase() === address) return true
          return [row.token0.toLowerCase(), row.token1.toLowerCase()].sort().join(':') === tokens
        })
        if (!match) {
          setLiquidityResolution('indexing')
          return
        }
        const selected = toSelectedPair(match)
        const nextEligibility = evaluatePublicFarmEligibility({ ...selected, indexed: true })
        patch({ selectedPair: selected, selectionMode: 'search_existing' })
        if (nextEligibility.eligible) {
          setLiquidityResolution('ready')
          setOpenAcc('reward')
          setCreateSoftNote('Liquidity confirmed. Pair ready — continue with farm rewards.')
        } else {
          setLiquidityResolution('indexing')
        }
      } catch {
        setLiquidityResolution('indexing')
      }
    },
    [lastLiquidityResolution, pairs, patch, refreshPairs],
  )

  const handleLiquidityConfirmed = useCallback(
    (resolution: FarmLiquidityResolution) => {
      setLastLiquidityResolution(resolution)
      void resolvePairAfterLiquidity(resolution)
    },
    [resolvePairAfterLiquidity],
  )

  const reviewRows = [
    ['Pair', draft.selectedPair ? `${draft.selectedPair.symbol0}/${draft.selectedPair.symbol1}` : '—'],
    ['Reward', draft.rewardToken || '—'],
    ['Budget', draft.rewardBudget || '—'],
    ['Duration', draft.durationDays ? `${draft.durationDays} days` : '—'],
    ['Emission', draft.emissionRate ? `${draft.emissionRate}/day` : '—'],
    ['Creation Fee', feeResult.ok ? feeResult.fee.display : '—'],
    ['Estimated APR', estimatedApr],
  ]

  const onPrimary = () => {
    if (nextAction === 'create_farm') {
      if (!PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute) {
        setCreateSoftNote(CREATE_FARM_UX.createUnavailable)
        return
      }
      // The factory is bound, but a valid, short-lived eligibility proof is still
      // mandatory. Never open a wallet request with missing or fabricated proof data.
      setCreateSoftNote(
        'Configuration ready. Farm submission remains locked until the verified creation service is connected.',
      )
    }
  }

  const showInlineLiquidity = draft.selectionMode === 'create_new' || needsLiquidity

  return (
    <Section
      id="create-farm"
      data-testid="create-farm-workspace"
      data-fs-create-farm-workspace="true"
      data-public-farm-factory="true"
      data-create-farm-ux="simplified"
      data-create-farm-accordion="true"
      data-create-farm-capability={PUBLIC_FARM_FACTORY_CAPABILITY.outcome}
      data-factory-deployed="false"
      data-masterbuilder-exposed="false"
      aria-label={CREATE_FARM_UX.title}
    >
      <Body>
        <FieldsCol>
          <MelegaAccordionSection
            id="pair"
            title="Step 1"
            summary={draft.selectedPair ? `${draft.selectedPair.symbol0}/${draft.selectedPair.symbol1}` : 'Pair'}
            open={openAcc === 'pair'}
            onToggle={() => toggleAcc('pair')}
            testId="create-farm-acc-pair"
          >
            <PairStepLayout data-testid="create-farm-step-pair">
              <ModeRow data-testid="public-farm-pair-mode" style={{ marginTop: 4 }}>
                <ModeBtn
                  type="button"
                  $active={draft.selectionMode === 'search_existing'}
                  data-testid="public-farm-search-existing"
                  onClick={() => patch({ selectionMode: 'search_existing' })}
                >
                  ○ {CREATE_FARM_UX.useExisting}
                </ModeBtn>
                <ModeBtn
                  type="button"
                  $active={draft.selectionMode === 'create_new'}
                  data-testid="public-farm-create-new-pair"
                  onClick={() => {
                    setCreateSoftNote(null)
                    setLiquidityResolution('idle')
                    patch({ selectionMode: 'create_new', selectedPair: null })
                    setOpenAcc('liquidity')
                  }}
                >
                  ○ {CREATE_FARM_UX.createNew}
                </ModeBtn>
              </ModeRow>

            {draft.selectionMode === 'search_existing' && (
              <Panel data-testid="public-farm-pair-search">
                <Hint>{CREATE_FARM_UX.searchHint}</Hint>
                <Field>
                  <Label>Search</Label>
                  <PairSearchWrap>
                    <InputBox
                      ref={pairSearchRef}
                      value={pairQuery}
                      onChange={(e) => {
                        setPairQuery(e.target.value)
                        setPairDropdownOpen(true)
                      }}
                      onFocus={() => setPairDropdownOpen(true)}
                      placeholder={CREATE_FARM_UX.searchPlaceholder}
                      aria-label="Search existing pair"
                      aria-expanded={pairDropdownOpen}
                      aria-haspopup="listbox"
                      data-testid="public-farm-pair-query"
                    />
                    {pairDropdownOpen && pairDropdownCoords && typeof document !== 'undefined'
                      ? createPortal(
                          <PairDropdown
                            ref={pairDropdownRef}
                            $top={pairDropdownCoords.top}
                            $left={pairDropdownCoords.left}
                            $width={pairDropdownCoords.width}
                            data-testid="create-farm-pair-dropdown"
                            role="listbox"
                            aria-label="Pair search results"
                          >
                            <PairDropdownList>
                              {filteredPairs.slice(0, 12).map((p) => {
                                const labels = formatFarmPairLabel(p)
                                const selected = toSelectedPair(p)
                                const active =
                                  draft.selectedPair?.pairAddress.toLowerCase() === selected.pairAddress.toLowerCase()
                                const tvlBnb = estimatePairTvlBnb(p)
                                const tvlLabel =
                                  tvlBnb != null && Number.isFinite(tvlBnb) ? `${tvlBnb.toFixed(2)} BNB TVL` : null
                                return (
                                  <li key={selected.pairAddress}>
                                    <PairDropdownItem
                                      type="button"
                                      role="option"
                                      aria-selected={active}
                                      $active={active}
                                      data-testid={`public-farm-pair-option-${selected.pairAddress.toLowerCase()}`}
                                      onClick={() => selectPair(selected)}
                                    >
                                      <PairTokenStack>
                                        <MelegaTokenAvatar
                                          name={labels.symbol0}
                                          symbol={labels.symbol0}
                                          address={p.token0}
                                          chainId={MELEGA_CHAIN_ID}
                                          size={28}
                                          radius="circle"
                                        />
                                        <MelegaTokenAvatar
                                          name={labels.symbol1}
                                          symbol={labels.symbol1}
                                          address={p.token1}
                                          chainId={MELEGA_CHAIN_ID}
                                          size={28}
                                          radius="circle"
                                        />
                                      </PairTokenStack>
                                      <PairDropdownMeta>
                                        <PairDropdownName>
                                          {labels.symbol0}/{labels.symbol1}
                                        </PairDropdownName>
                                        <PairDropdownSub>
                                          BNB Chain
                                          {tvlLabel ? ` · ${tvlLabel}` : ''}
                                        </PairDropdownSub>
                                      </PairDropdownMeta>
                                    </PairDropdownItem>
                                  </li>
                                )
                              })}
                            </PairDropdownList>
                          </PairDropdown>,
                          document.body,
                        )
                      : null}
                  </PairSearchWrap>
                </Field>
              </Panel>
            )}

            {draft.selectedPair && (
              <Panel data-testid="public-farm-eligibility" data-eligible={eligibility.eligible ? 'true' : 'false'}>
                <PanelTitle>{CREATE_FARM_UX.pairStatus}</PanelTitle>
                <StatusLine>
                  <Check>✓</Check> {CREATE_FARM_UX.pairExists}
                </StatusLine>
                <StatusLine>
                  <Check>✓</Check> {CREATE_FARM_UX.pairIndexed}
                </StatusLine>
                <MetricBlock>
                  <Metric>
                    <MetricLabel>{CREATE_FARM_UX.tvl}</MetricLabel>
                    <MetricValue data-testid="public-farm-current-tvl">
                      {formatBnb(eligibility.currentTvlBnb)}
                    </MetricValue>
                  </Metric>
                  <Metric>
                    <MetricLabel>{CREATE_FARM_UX.minimumRequired}</MetricLabel>
                    <MetricValue data-testid="public-farm-minimum-tvl">
                      {formatBnb(PUBLIC_FARM_MINIMUM_TVL_BNB)}
                    </MetricValue>
                  </Metric>
                </MetricBlock>
                <StatusLine data-testid="public-farm-pair-status-label">
                  Status{' '}
                  <strong>{eligibility.eligible ? CREATE_FARM_UX.statusReady : CREATE_FARM_UX.statusNotReady}</strong>
                </StatusLine>
                {!eligibility.eligible && eligibility.missingTvlBnb != null && eligibility.missingTvlBnb > 0 && (
                  <Hint data-testid="public-farm-missing-tvl">
                    {CREATE_FARM_UX.youNeed} <strong>{formatBnb(eligibility.missingTvlBnb)}</strong>{' '}
                    {CREATE_FARM_UX.moreLiquidity}
                  </Hint>
                )}
              </Panel>
            )}

            {draft.selectedPair && needsLiquidity && (
              <Remediation
                data-testid="public-farm-low-liquidity-remediation"
                data-action={CREATE_FARM_UX.requireLiquidityIncrease}
                role="status"
              >
                <RemediationTitle>{CREATE_FARM_UX.increaseLiquidityRequired}</RemediationTitle>
                <Hint>
                  {CREATE_FARM_UX.youNeed} {formatBnb(eligibility.missingTvlBnb)} {CREATE_FARM_UX.moreLiquidity}
                </Hint>
                <PrimaryButton
                  type="button"
                  $ready
                  data-testid="public-farm-inline-liquidity-open"
                  onClick={() => setOpenAcc('liquidity')}
                >
                  Add liquidity here
                </PrimaryButton>
              </Remediation>
            )}
            </PairStepLayout>
          </MelegaAccordionSection>

          {showInlineLiquidity && (
            <MelegaAccordionSection
              id="liquidity"
              title="Step 2"
              summary={draft.selectedPair ? 'Add liquidity' : 'Create pair & add liquidity'}
              open={openAcc === 'liquidity'}
              onToggle={() => toggleAcc('liquidity')}
              testId="create-farm-acc-liquidity"
            >
              {liquidityResolution === 'indexing' && (
                <RefreshRow data-testid="create-farm-liquidity-indexing" role="status">
                  <span>
                    Transaction confirmed. Pair data is being indexed; refresh here without closing the wizard.
                  </span>
                  <RefreshButton type="button" onClick={() => void resolvePairAfterLiquidity()}>
                    Refresh pair status
                  </RefreshButton>
                </RefreshRow>
              )}
              {liquidityResolution === 'refreshing' && (
                <RefreshRow data-testid="create-farm-liquidity-refreshing" role="status">
                  <span>Checking the updated pair and liquidity…</span>
                  <RefreshButton type="button" disabled>
                    Checking…
                  </RefreshButton>
                </RefreshRow>
              )}
              <FarmInlineLiquidityStep pair={draft.selectedPair} onConfirmed={handleLiquidityConfirmed} />
            </MelegaAccordionSection>
          )}

          <MelegaAccordionSection
            id="reward"
            title={showInlineLiquidity ? 'Step 3' : 'Step 2'}
            summary={draft.rewardToken || 'Reward'}
            open={openAcc === 'reward'}
            onToggle={() => toggleAcc('reward')}
            testId="create-farm-acc-reward"
          >
            <Field data-testid="create-farm-reward-token">
              <Label>{CREATE_FARM_UX.rewardToken}</Label>
              <InputBox
                value={draft.rewardToken}
                list="melega-farm-reward-token-options"
                onChange={(e) => {
                  setCreateSoftNote(null)
                  const typed = e.target.value.trim()
                  const selected = rewardTokenOptions.find(
                    (asset) =>
                      asset.address.toLowerCase() === typed.toLowerCase() ||
                      asset.symbol.toLowerCase() === typed.toLowerCase(),
                  )
                  patch({
                    rewardToken: selected?.symbol ?? typed,
                    rewardTokenAddress: selected?.address ?? typed,
                  })
                }}
                placeholder="Search ticker or paste token address"
                aria-label="Reward Token"
              />
              <datalist id="melega-farm-reward-token-options">
                {rewardTokenOptions.map((asset) => (
                  <option key={`${asset.chainId}:${asset.address}`} value={asset.address}>
                    {asset.symbol}
                    {asset.name ? ` — ${asset.name}` : ''}
                  </option>
                ))}
              </datalist>
            </Field>
            {marcoReject.rejected && (
              <RejectBanner data-testid="public-farm-marco-reward-rejection" role="status">
                {CREATE_FARM_UX.marcoRewardFriendly}
              </RejectBanner>
            )}
          </MelegaAccordionSection>

          <MelegaAccordionSection
            id="budget"
            title={showInlineLiquidity ? 'Step 4' : 'Step 3'}
            summary={
              draft.rewardBudget || draft.durationDays
                ? [draft.rewardBudget, draft.durationDays ? `${draft.durationDays}d` : null].filter(Boolean).join(' · ')
                : 'Budget & duration'
            }
            open={openAcc === 'budget'}
            onToggle={() => toggleAcc('budget')}
            testId="create-farm-acc-budget"
          >
            <Field>
              <Label>{CREATE_FARM_UX.rewardBudget}</Label>
              <InputBox
                value={draft.rewardBudget}
                onChange={(e) => patch({ rewardBudget: e.target.value })}
                placeholder="e.g. 100000"
                inputMode="decimal"
                aria-label="Reward Budget"
                disabled={!eligibility.eligible}
              />
            </Field>
            <Field>
              <Label>{CREATE_FARM_UX.creationFee}</Label>
              <ReadOnlyValue
                data-testid="create-farm-fee"
                $accent={feeResult.ok && feeResult.isFree ? '#18f089' : '#F4C430'}
              >
                {feeResult.ok ? feeResult.fee.display : '—'}
              </ReadOnlyValue>
              <FeeNote data-testid="create-farm-fee-note">{CREATE_FARM_UX.feeTreasuryNote}</FeeNote>
            </Field>
            <FieldsGrid
              data-testid="create-farm-fields-grid"
              data-public-farm-config={eligibility.eligible ? 'unlocked' : 'locked'}
            >
              <Field>
                <Label>{CREATE_FARM_UX.duration}</Label>
                <InputBox
                  value={draft.durationDays}
                  onChange={(e) => patch({ durationDays: e.target.value })}
                  placeholder="Days"
                  inputMode="decimal"
                  aria-label="Duration"
                  disabled={!eligibility.eligible}
                />
              </Field>
              <Field>
                <Label>{CREATE_FARM_UX.emission}</Label>
                <InputBox
                  value={draft.emissionRate}
                  placeholder="Tokens / day"
                  inputMode="decimal"
                  aria-label="Emission"
                  readOnly
                />
              </Field>
              <Field>
                <Label>{CREATE_FARM_UX.estimatedApr}</Label>
                <ReadOnlyValue data-testid="create-farm-estimated-apr">{estimatedApr}</ReadOnlyValue>
              </Field>
            </FieldsGrid>
          </MelegaAccordionSection>

          <MelegaAccordionSection
            id="advanced"
            title="Advanced"
            open={openAcc === 'advanced'}
            onToggle={() => toggleAcc('advanced')}
            testId="create-farm-acc-advanced"
          >
            <FieldsGrid data-testid="create-farm-advanced-fields">
              <Field>
                <Label>Start</Label>
                <ReadOnlyValue>{draft.startMode === 'immediate' ? 'Starts when created' : 'Scheduled'}</ReadOnlyValue>
              </Field>
              <Field>
                <Label>Creator wallet</Label>
                <InputBox
                  value={draft.creatorWallet}
                  onChange={(e) => patch({ creatorWallet: e.target.value })}
                  placeholder="Optional"
                  aria-label="Creator wallet"
                />
              </Field>
            </FieldsGrid>
          </MelegaAccordionSection>

          <div data-testid="create-farm-primary-action">
            {nextAction === 'select_pair' && (
              <PrimaryButton type="button" disabled data-testid="create-farm-next-continue">
                {CREATE_FARM_UX.continue}
              </PrimaryButton>
            )}
            {nextAction === 'continue_config' && (
              <PrimaryButton type="button" disabled data-testid="create-farm-next-continue">
                {CREATE_FARM_UX.continue}
              </PrimaryButton>
            )}
            {nextAction === 'create_farm' && (
              <PrimaryButton type="button" $ready data-testid="create-farm-submit" onClick={onPrimary}>
                {CREATE_FARM_UX.createFarm}
              </PrimaryButton>
            )}
            <button type="button" hidden disabled aria-hidden="true" data-testid="create-farm-submit-disabled" />
            <SoftNote data-testid="create-farm-next-hint" style={{ marginTop: 10 }}>
              {nextAction === 'select_pair' && CREATE_FARM_UX.nextSelectPair}
              {nextAction === 'increase_liquidity' && CREATE_FARM_UX.nextIncreaseLiquidity}
              {nextAction === 'continue_config' && CREATE_FARM_UX.nextConfigure}
              {nextAction === 'create_farm' && CREATE_FARM_UX.nextCreate}
            </SoftNote>
            {createSoftNote && (
              <SoftNote data-testid="create-farm-soft-unavailable" style={{ marginTop: 8 }}>
                {createSoftNote}
              </SoftNote>
            )}
          </div>
        </FieldsCol>

        <PreviewCol data-testid="create-farm-review-panel">
          <div>
            <PreviewTitle>{CREATE_FARM_UX.review}</PreviewTitle>
            {reviewRows.map(([k, v]) => (
              <ReviewRow key={k}>
                <span>{k}</span>
                <strong>{v}</strong>
              </ReviewRow>
            ))}
          </div>
          <div data-testid="create-farm-funding-flow">
            <PreviewTitle>Activation flow</PreviewTitle>
            <FundingFlow>
              <FundingStep $active={Boolean(draft.selectedPair)}>
                <span>1</span>
                <span>Create or select the LP pair</span>
              </FundingStep>
              <FundingStep $active={parseNum(draft.rewardBudget) > 0}>
                <span>2</span>
                <span>Set reward token, budget and duration</span>
              </FundingStep>
              <FundingStep $active={nextAction === 'create_farm'}>
                <span>3</span>
                <span>Approve the exact reward budget</span>
              </FundingStep>
              <FundingStep>
                <span>4</span>
                <span>Confirm creation and the displayed fee in your wallet</span>
              </FundingStep>
              <FundingStep>
                <span>5</span>
                <span>The factory moves the budget into the new farm and activates it</span>
              </FundingStep>
            </FundingFlow>
            <SoftNote data-testid="create-farm-funding-safety" style={{ marginTop: 10 }}>
              One flow, two wallet confirmations. The factory never keeps your reward tokens.
            </SoftNote>
          </div>
        </PreviewCol>
      </Body>
    </Section>
  )
}

export default PublicFarmFactoryWorkspace
