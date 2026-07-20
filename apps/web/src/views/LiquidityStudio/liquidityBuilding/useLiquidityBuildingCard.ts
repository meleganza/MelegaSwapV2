import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { ChainId, Currency } from '@pancakeswap/sdk'
import { useCurrencyBalance } from 'state/wallet/hooks'
import {
  BLOCKED_ACTIVATION_GATES,
  EMPTY_SETUP_DRAFT,
  type ActivationGateSummary,
  type EpochSeconds,
  type ProgramStatus,
  type SetupDraft,
  type StrategyMode,
  canSubmitMutatingAction,
  setupDraftReadyForReview,
  transitionProgramStatus,
} from './programStatus'
import {
  DECISION_FREQUENCY_OPTIONS,
  EMPTY_PROGRAM_METRICS,
  type LbActivityItem,
  type LbUxPhase,
  type ManageAction,
  type ProgramMetrics,
  availableManageActions,
} from './uxCopy'

type HealthPayload = {
  status?: string
  blockers?: string[]
  reasons?: string[]
  ok?: boolean
  ready?: boolean
}

function gatesFromHealth(payload: HealthPayload | null): ActivationGateSummary {
  if (!payload) return { ...BLOCKED_ACTIVATION_GATES }
  const blockers = [...(payload.blockers || []), ...(payload.reasons || [])]
  const runtimeReady = payload.status === 'READY' && payload.ready === true
  const deploymentInputsValid = !blockers.some((b) => String(b).includes('DEPLOYMENT_INPUTS'))
  return {
    activationAuthorized: false,
    mainnetCycleAuthorized: false,
    contractsDeployed: false,
    deploymentInputsValid,
    runtimeReady,
    blockers: blockers.length ? blockers.map(String) : [...BLOCKED_ACTIVATION_GATES.blockers],
  }
}

export type LiquidityBuildingCardState = {
  status: ProgramStatus
  phase: LbUxPhase
  draft: SetupDraft
  gates: ActivationGateSummary
  activationPending: boolean
  walletConnected: boolean
  correctChain: boolean
  account: string | null
  selectedCurrency: Currency | null
  walletBalanceLabel: string | null
  metrics: ProgramMetrics
  activity: LbActivityItem[]
  manageActions: ManageAction[]
  technicalOpen: boolean
  mutateGate: ReturnType<typeof canSubmitMutatingAction>
  draftReady: boolean
  decisionFrequencyLabel: string
  setToken: (currency: Currency | null) => void
  setBudget: (value: string) => void
  setStrategy: (mode: StrategyMode) => void
  setRateRange: (min: string, max: string) => void
  setEpoch: (seconds: EpochSeconds) => void
  startSetup: () => void
  backToEntry: () => void
  backToSetup: () => void
  openReview: () => void
  requestDepositAndActivate: () => void
  pause: () => void
  resume: () => void
  stop: () => void
  openManage: () => void
  closeManage: () => void
  toggleTechnical: () => void
  reset: () => void
}

export function useLiquidityBuildingCard(): LiquidityBuildingCardState {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const [status, setStatus] = useState<ProgramStatus>('NOT_ACTIVE')
  const [phase, setPhase] = useState<LbUxPhase>('entry')
  const [draft, setDraft] = useState<SetupDraft>(EMPTY_SETUP_DRAFT)
  const [gates, setGates] = useState<ActivationGateSummary>({ ...BLOCKED_ACTIVATION_GATES })
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [technicalOpen, setTechnicalOpen] = useState(false)
  const [metrics] = useState<ProgramMetrics>(EMPTY_PROGRAM_METRICS)
  const [activity] = useState<LbActivityItem[]>([])

  const balance = useCurrencyBalance(address ?? undefined, selectedCurrency ?? undefined)
  const walletConnected = Boolean(address)
  const correctChain = chain?.id === ChainId.BSC
  const activationPending = !gates.activationAuthorized

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/liquidity-building/health', { cache: 'no-store' })
        const json = (await res.json()) as HealthPayload
        if (!cancelled) setGates(gatesFromHealth(json))
      } catch {
        if (!cancelled) setGates({ ...BLOCKED_ACTIVATION_GATES, blockers: ['RUNTIME_HEALTH_UNAVAILABLE'] })
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const mutateGate = useMemo(
    () => canSubmitMutatingAction({ walletConnected, correctChain, gates }),
    [walletConnected, correctChain, gates],
  )

  const draftReady = setupDraftReadyForReview(draft)
  const manageActions = availableManageActions(status)
  const decisionFrequencyLabel =
    DECISION_FREQUENCY_OPTIONS.find((o) => o.seconds === draft.epochSeconds)?.label ?? 'Every 5 minutes'

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

  return {
    status,
    phase,
    draft,
    gates,
    activationPending,
    walletConnected,
    correctChain,
    account: address ?? null,
    selectedCurrency,
    walletBalanceLabel,
    metrics,
    activity,
    manageActions,
    technicalOpen,
    mutateGate,
    draftReady,
    decisionFrequencyLabel,
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
    setRateRange: (min, max) => setDraft((d) => ({ ...d, minimumRateBps: min, maximumRateBps: max })),
    setEpoch: (seconds) => setDraft((d) => ({ ...d, epochSeconds: seconds })),
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
      if (!draftReady) return
      setPhase('review')
    },
    requestDepositAndActivate: () => {
      if (!mutateGate.ok) return
      setStatus((s) => {
        let next = transitionProgramStatus(s, 'REQUEST_APPROVAL')
        next = transitionProgramStatus(next, 'APPROVAL_CONFIRMED')
        next = transitionProgramStatus(next, 'DEPOSIT_CONFIRMED')
        next = transitionProgramStatus(next, 'ACTIVATE')
        return next
      })
      setPhase('active')
    },
    pause: () => {
      if (!mutateGate.ok) return
      setStatus((s) => transitionProgramStatus(s, 'PAUSE'))
    },
    resume: () => {
      if (!mutateGate.ok) return
      setStatus((s) => transitionProgramStatus(s, 'RESUME'))
    },
    stop: () => {
      if (!mutateGate.ok) return
      setStatus((s) => transitionProgramStatus(s, 'STOP'))
      setPhase('active')
    },
    openManage: () => setPhase('manage'),
    closeManage: () => setPhase(['ACTIVE', 'PAUSED', 'BUDGET_DEPLETED', 'STOPPED'].includes(status) ? 'active' : 'entry'),
    toggleTechnical: () => setTechnicalOpen((v) => !v),
    reset,
  }
}
