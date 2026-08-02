import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useAccount, useNetwork } from 'wagmi'
import { ChainId, Currency } from '@pancakeswap/sdk'
import { useCurrencyBalance } from 'state/wallet/hooks'
import {
  EMPTY_SETUP_DRAFT,
  type EpochSeconds,
  type ProgramStatus,
  type SetupDraft,
  type StrategyMode,
  setupDraftReadyForReview,
  transitionProgramStatus,
} from './programStatus'
import {
  DECISION_FREQUENCY_OPTIONS,
  EMPTY_PROGRAM_METRICS,
  type LbActivityItem,
  type ManageAction,
  type ProgramMetrics,
  availableManageActions,
} from './uxCopy'
import type { LbUxPhase } from './liquidityBuildingStep'
import { phaseToStep, programFromQuery, stepFromQuery, stepToPhase } from './liquidityBuildingStep'
import { useActivationReadiness } from './useActivationReadiness'
import { useMelegaPairDetection, type MelegaPairDetection } from './useMelegaPairDetection'
import { useProgramReadModel } from './useProgramReadModel'
import { useFounderActivateWriter } from './useFounderActivateWriter'
import { canSubmitFounderWalletActivate, LB_SUCCESS_FEE_BPS } from './founderActivateFlow'
import { LB_DEPLOYED_ADDRESSES, isDeployedAddress } from './addresses'
import { useContract } from 'hooks/useContract'
import { useSingleCallResult } from 'state/multicall/hooks'
import { LB_FACTORY_READ_ABI } from './abi/fragments'
import {
  mapStrategyPreset,
  type LiquidityGoalKey,
  type QuoteAssetKey,
  type StrategyPreset,
} from './strategyPresets'
import { formatLbTokenAmount } from './formatLbAmount'
import type { ActivateProgressEvent } from './founderActivateFlow'

export type LiquiditySeriesPoint = { label: string; value: number; at: string }

export type ProgramSnapshotView = {
  programAddress: string | null
  tokenSymbol: string | null
  pairLabel: string | null
  lpOwner: string | null
  lpRecipient: string | null
  initialBudgetLabel: string | null
  remainingBudgetLabel: string | null
  tokensSoldLabel: string | null
  tokensMatchedLabel: string | null
  grossQuoteLabel: string | null
  feePaidLabel: string | null
  netQuoteLabel: string | null
  lpMintedLabel: string | null
  inFlightLabel: string | null
  availableToAddLabel: string | null
  lastDecisionLabel: string | null
  nextDecisionLabel: string | null
  liquidityBuiltLabel: string | null
}

const EMPTY_SNAPSHOT: ProgramSnapshotView = {
  programAddress: null,
  tokenSymbol: null,
  pairLabel: null,
  lpOwner: null,
  lpRecipient: null,
  initialBudgetLabel: null,
  remainingBudgetLabel: null,
  tokensSoldLabel: null,
  tokensMatchedLabel: null,
  grossQuoteLabel: null,
  feePaidLabel: null,
  netQuoteLabel: null,
  lpMintedLabel: null,
  inFlightLabel: null,
  availableToAddLabel: null,
  lastDecisionLabel: null,
  nextDecisionLabel: null,
  liquidityBuiltLabel: null,
}

export type LiquidityBuildingCardState = {
  status: ProgramStatus
  phase: LbUxPhase
  draft: SetupDraft
  activationPending: boolean
  walletConnected: boolean
  correctChain: boolean
  account: string | null
  selectedCurrency: Currency | null
  walletBalanceLabel: string | null
  pairDetection: MelegaPairDetection
  readiness: ReturnType<typeof useActivationReadiness>
  metrics: ProgramMetrics
  activity: LbActivityItem[]
  programSource: 'ON_CHAIN' | 'UNAVAILABLE'
  programReason: string | null
  programSnapshot: ProgramSnapshotView
  liquiditySeries: LiquiditySeriesPoint[]
  manageActions: ManageAction[]
  technicalOpen: boolean
  mutateGate: ReturnType<typeof canSubmitFounderWalletActivate>
  draftReady: boolean
  decisionFrequencyLabel: string
  setToken: (currency: Currency | null) => void
  setBudget: (value: string) => void
  setStrategy: (mode: StrategyMode) => void
  setStrategyPreset: (preset: StrategyPreset) => void
  setQuoteAssetKey: (key: QuoteAssetKey) => void
  setLiquidityGoal: (goal: LiquidityGoalKey) => void
  setRateRange: (min: string, max: string) => void
  setEpoch: (seconds: EpochSeconds) => void
  quoteEnabled: boolean
  startSetup: () => void
  backToEntry: () => void
  backToSetup: () => void
  openReview: () => boolean
  openStatus: () => void
  requestDepositAndActivate: (opts?: {
    onProgress?: (event: ActivateProgressEvent) => void
  }) => Promise<{ ok: true; programAddress?: string } | { ok: false; reason: string }>
  successFeeBps: number
  factoryBound: boolean
  pause: () => void
  resume: () => void
  stop: () => void
  openManage: () => void
  closeManage: () => void
  goToPhase: (phase: LbUxPhase) => void
  toggleTechnical: () => void
  reset: () => void
}

function buildSnapshot(
  programRead: ReturnType<typeof useProgramReadModel>,
  draftSymbol: string | null,
  pairLabel: string | null,
  decimals: number,
  quoteSymbol: string | null,
): ProgramSnapshotView {
  if (programRead.source !== 'ON_CHAIN') {
    return {
      ...EMPTY_SNAPSHOT,
      tokenSymbol: draftSymbol,
      pairLabel,
    }
  }
  const s = programRead.snapshot
  const fmtProject = (raw: string | null | undefined) => formatLbTokenAmount(raw, decimals, draftSymbol)
  const fmtQuote = (raw: string | null | undefined) => formatLbTokenAmount(raw, decimals, quoteSymbol)
  return {
    programAddress: s.programAddress,
    tokenSymbol: draftSymbol,
    pairLabel: s.pair ? pairLabel : pairLabel,
    lpOwner: s.owner,
    lpRecipient: s.lpRecipient,
    initialBudgetLabel:
      s.view?.totalDepositedBudget != null
        ? fmtProject(String(s.view.totalDepositedBudget))
        : null,
    remainingBudgetLabel:
      s.view?.remainingBudget != null
        ? fmtProject(String(s.view.remainingBudget))
        : s.metrics.budgetRemainingLabel,
    tokensSoldLabel: fmtProject(s.tokensSold),
    tokensMatchedLabel: fmtProject(s.tokensMatched),
    grossQuoteLabel: fmtQuote(s.grossQuoteAcquired),
    feePaidLabel: fmtQuote(s.totalFeePaid),
    netQuoteLabel:
      s.view?.totalQuoteAdded != null ? fmtQuote(String(s.view.totalQuoteAdded)) : null,
    lpMintedLabel: formatLbTokenAmount(s.totalLpMinted, decimals, null),
    inFlightLabel: null,
    availableToAddLabel: null,
    lastDecisionLabel: null,
    nextDecisionLabel: null,
    liquidityBuiltLabel: s.metrics.liquidityBuiltLabel,
  }
}

/** Build chart series only from real completed execution observations. */
function seriesFromActivity(activity: LbActivityItem[]): LiquiditySeriesPoint[] {
  const points: LiquiditySeriesPoint[] = []
  let cumulative = 0
  for (const item of activity) {
    if (item.kind !== 'EXECUTION_COMPLETED') continue
    const raw = item.liquidityAdded ?? item.quoteAcquired
    if (raw == null) continue
    const n = Number(String(raw).replace(/[^0-9.]/g, ''))
    if (!Number.isFinite(n) || n <= 0) continue
    cumulative += n
    const at = item.at ?? new Date().toISOString()
    points.push({
      at,
      value: cumulative,
      label: new Date(at).toLocaleDateString(),
    })
  }
  return points
}

export function useLiquidityBuildingCard(): LiquidityBuildingCardState {
  const router = useRouter()
  const { address } = useAccount()
  const { chain } = useNetwork()
  const [status, setStatus] = useState<ProgramStatus>('NOT_ACTIVE')
  const [phase, setPhase] = useState<LbUxPhase>('entry')
  const [draft, setDraft] = useState<SetupDraft>(EMPTY_SETUP_DRAFT)
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [technicalOpen, setTechnicalOpen] = useState(false)
  const applyingUrl = useRef(false)
  const urlReady = useRef(false)

  const readiness = useActivationReadiness()
  const pairDetection = useMelegaPairDetection(selectedCurrency, draft.quoteAssetKey)
  const { activateProgram, factoryBound } = useFounderActivateWriter()
  const deepLinkProgram = programFromQuery(router.query.program)
  const programRead = useProgramReadModel({
    owner: address ?? null,
    projectTokenAddress: draft.tokenAddress,
    quoteAssetAddress: pairDetection.quoteAddress,
    pairAddress: pairDetection.pairAddress,
    programAddress: deepLinkProgram,
  })

  const factoryRead = useContract(
    isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory) ? LB_DEPLOYED_ADDRESSES.lbFactory : undefined,
    LB_FACTORY_READ_ABI as unknown as any,
    false,
  )
  const quoteEnabledResult = useSingleCallResult(
    pairDetection.quoteAddress ? factoryRead : undefined,
    'isQuoteEnabled',
    pairDetection.quoteAddress ? [pairDetection.quoteAddress] : undefined,
  )
  const quoteEnabled = Boolean(quoteEnabledResult?.result?.[0])

  const balance = useCurrencyBalance(address ?? undefined, selectedCurrency ?? undefined)
  const walletConnected = Boolean(address)
  const correctChain = chain?.id === ChainId.BSC
  // Founder create/deposit/activate uses factory binding — not autonomous KMS/relay gates.
  const activationPending = !factoryBound

  /** Hydrate phase from durable query step (refresh / back / forward). */
  useEffect(() => {
    if (!router.isReady) return
    const q = stepFromQuery(router.query.step) ?? 'intro'
    let next = stepToPhase(q)
    if ((next === 'active' || next === 'manage') && programRead.source !== 'ON_CHAIN') {
      next = 'entry'
    }
    applyingUrl.current = true
    setPhase(next)
    urlReady.current = true
    // programRead.source intentionally omitted — avoid clobbering in-progress setup navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query.step])

  /** Persist phase into query string for browser history. */
  useEffect(() => {
    if (!router.isReady || !urlReady.current) return
    if (applyingUrl.current) {
      applyingUrl.current = false
      return
    }
    const step = phaseToStep(phase)
    const nextQuery: Record<string, string> = { view: 'building' }
    if (step !== 'intro') nextQuery.step = step
    const linked = programFromQuery(router.query.program)
    if (linked) nextQuery.program = linked
    const currentStep = stepFromQuery(router.query.step) ?? 'intro'
    const currentProgram = programFromQuery(router.query.program)
    if (
      currentStep === step &&
      router.query.view === 'building' &&
      (currentProgram ?? null) === (linked ?? null)
    ) {
      return
    }
    router.replace({ pathname: '/liquidity-studio', query: nextQuery }, undefined, { shallow: true })
  }, [phase, router])

  /** When on-chain program exists, surface active/manage phases from live lifecycle. */
  useEffect(() => {
    const live = programRead.snapshot.status
    if (!live || programRead.source !== 'ON_CHAIN') return
    if (['ACTIVE', 'PAUSED', 'SAFETY_PAUSED', 'BUDGET_DEPLETED', 'STOPPED'].includes(live)) {
      setPhase((p) => (p === 'manage' ? p : 'active'))
      setStatus(live)
    } else if (live === 'READY' || live === 'AWAITING_DEPOSIT') {
      setPhase((p) => (p === 'entry' ? 'review' : p))
      setStatus(live)
    }
  }, [programRead.snapshot.status, programRead.source])

  const mutateGate = useMemo(
    () =>
      canSubmitFounderWalletActivate({
        walletConnected,
        correctChain,
        factoryBound: factoryBound || isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory),
      }),
    [walletConnected, correctChain, factoryBound],
  )

  const draftReady = setupDraftReadyForReview(draft)

  const effectiveStatus: ProgramStatus = programRead.snapshot.status ?? status
  const manageActions = availableManageActions(effectiveStatus)
  const decisionFrequencyLabel =
    DECISION_FREQUENCY_OPTIONS.find((o) => o.seconds === draft.epochSeconds)?.label ?? '5 minutes'

  const metrics: ProgramMetrics =
    programRead.source === 'ON_CHAIN' ? programRead.snapshot.metrics : EMPTY_PROGRAM_METRICS
  const activity: LbActivityItem[] = programRead.source === 'ON_CHAIN' ? programRead.activity : []
  const liquiditySeries = useMemo(() => seriesFromActivity(activity), [activity])

  const pairLabel =
    pairDetection.available && draft.tokenSymbol
      ? `${draft.tokenSymbol}/${pairDetection.quoteSymbol}`
      : null

  const tokenDecimals = selectedCurrency?.wrapped?.decimals ?? 18

  const programSnapshot = useMemo(
    () =>
      buildSnapshot(
        programRead,
        draft.tokenSymbol,
        pairLabel,
        tokenDecimals,
        pairDetection.quoteSymbol ?? null,
      ),
    [programRead, draft.tokenSymbol, pairLabel, tokenDecimals, pairDetection.quoteSymbol],
  )

  const walletBalanceLabel = useMemo(() => {
    if (!selectedCurrency || !walletConnected || !balance) return null
    return `${balance.toSignificant(6)} ${selectedCurrency.symbol ?? ''}`.trim()
  }, [balance, selectedCurrency, walletConnected])

  const reset = useCallback(() => {
    setStatus('NOT_ACTIVE')
    setPhase('entry')
    setDraft(EMPTY_SETUP_DRAFT)
    setSelectedCurrency(null)
    setTechnicalOpen(false)
  }, [])

  const goToPhase = useCallback((next: LbUxPhase) => {
    setPhase(next)
  }, [])

  return {
    status: effectiveStatus,
    phase,
    draft,
    activationPending,
    walletConnected,
    correctChain,
    account: address ?? null,
    selectedCurrency,
    walletBalanceLabel,
    pairDetection,
    readiness,
    metrics,
    activity,
    programSource: programRead.source,
    programReason: programRead.reason,
    programSnapshot,
    liquiditySeries,
    manageActions,
    technicalOpen,
    mutateGate,
    draftReady,
    decisionFrequencyLabel,
    successFeeBps: LB_SUCCESS_FEE_BPS,
    factoryBound: factoryBound || programRead.factoryBound,
    setToken: (currency) => {
      setSelectedCurrency(currency)
      setDraft((d) => ({
        ...d,
        tokenAddress: currency?.wrapped?.address ?? null,
        tokenSymbol: currency?.symbol ?? null,
      }))
      setStatus((s) => (s === 'NOT_ACTIVE' ? 'SETUP_REQUIRED' : s))
      setPhase('setup')
    },
    setBudget: (value) => setDraft((d) => ({ ...d, tokenBudget: value })),
    setStrategy: (mode) => setDraft((d) => ({ ...d, strategy: mode })),
    setStrategyPreset: (preset) => {
      const mapped = mapStrategyPreset(preset)
      setDraft((d) => ({
        ...d,
        strategyPreset: preset,
        strategy: mapped.strategy,
        minimumRateBps: mapped.minimumRateBps,
        maximumRateBps: mapped.maximumRateBps,
      }))
    },
    setQuoteAssetKey: (key) => setDraft((d) => ({ ...d, quoteAssetKey: key })),
    setLiquidityGoal: (goal) => setDraft((d) => ({ ...d, liquidityGoal: goal })),
    setRateRange: (min, max) => setDraft((d) => ({ ...d, minimumRateBps: min, maximumRateBps: max })),
    setEpoch: (seconds) => setDraft((d) => ({ ...d, epochSeconds: seconds })),
    quoteEnabled,
    startSetup: () => {
      setStatus((s) => transitionProgramStatus(s, 'START_SETUP'))
      setPhase('setup')
    },
    backToEntry: () => {
      setPhase('entry')
      setStatus('NOT_ACTIVE')
    },
    backToSetup: () => setPhase('setup'),
    openReview: () => {
      if (!setupDraftReadyForReview(draft)) return false
      setPhase('review')
      return true
    },
    openStatus: () => setPhase('status'),
    requestDepositAndActivate: async (opts) => {
      // Fail-closed — never fabricate ACTIVE; browser wallet must sign each step.
      if (!mutateGate.ok) {
        setPhase('status')
        return {
          ok: false as const,
          reason:
            mutateGate.reason ??
            'Connect MELEGA DEPLOYER on BNB Smart Chain with Liquidity Builder Factory bound.',
        }
      }
      if (!factoryBound && !isDeployedAddress(LB_DEPLOYED_ADDRESSES.lbFactory)) {
        setPhase('status')
        return {
          ok: false as const,
          reason: 'Liquidity Building Factory is not bound on this deployment.',
        }
      }
      if (!draft.tokenAddress || !pairDetection.pairAddress || !pairDetection.quoteAddress) {
        return { ok: false as const, reason: 'Choose Token to Grow with a live Melega market for your Quote Asset.' }
      }
      if (!setupDraftReadyForReview(draft)) {
        return { ok: false as const, reason: 'Complete token, budget, and strategy before Activate.' }
      }

      setStatus((s) => transitionProgramStatus(s, 'REQUEST_APPROVAL'))

      const decimals = selectedCurrency?.wrapped?.decimals ?? 18
      const strategyMode = draft.strategy === 'DYNAMIC_RANGE' ? 'DYNAMIC_RANGE' : 'FULL_AI'
      const result = await activateProgram({
        projectToken: draft.tokenAddress,
        quoteAsset: pairDetection.quoteAddress,
        pair: pairDetection.pairAddress,
        budgetHuman: draft.tokenBudget,
        decimals,
        strategyMode,
        minimumRateBps: Number(draft.minimumRateBps) || 0,
        maximumRateBps: Number(draft.maximumRateBps) || 0,
        epochDurationSeconds: draft.epochSeconds,
        quoteEnabled: quoteEnabled || pairDetection.quoteAddress.toLowerCase() === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
        correctChain,
        onProgress: opts?.onProgress,
      })

      if (!result.ok) {
        setPhase('status')
        return { ok: false as const, reason: result.reason }
      }

      setStatus('ACTIVE')
      setPhase('active')
      return { ok: true as const, programAddress: result.programAddress }
    },
    pause: () => {
      if (!mutateGate.ok || programRead.source !== 'ON_CHAIN') return
      setStatus((s) => transitionProgramStatus(s, 'PAUSE'))
    },
    resume: () => {
      if (!mutateGate.ok || programRead.source !== 'ON_CHAIN') return
      setStatus((s) => transitionProgramStatus(s, 'RESUME'))
    },
    stop: () => {
      if (!mutateGate.ok || programRead.source !== 'ON_CHAIN') return
      setStatus((s) => transitionProgramStatus(s, 'STOP'))
      setPhase('active')
    },
    openManage: () => setPhase('manage'),
    closeManage: () =>
      setPhase(['ACTIVE', 'PAUSED', 'BUDGET_DEPLETED', 'STOPPED', 'SAFETY_PAUSED'].includes(effectiveStatus) ? 'active' : 'entry'),
    goToPhase,
    toggleTechnical: () => setTechnicalOpen((v) => !v),
    reset,
  }
}
