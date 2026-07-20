import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { ChainId, Currency } from '@pancakeswap/sdk'
import { useCurrencyBalance } from 'state/wallet/hooks'
import {
  EMPTY_SETUP_DRAFT,
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
import { useActivationReadiness } from './useActivationReadiness'
import { useMelegaPairDetection, type MelegaPairDetection } from './useMelegaPairDetection'
import { useProgramReadModel } from './useProgramReadModel'

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
  const [selectedCurrency, setSelectedCurrency] = useState<Currency | null>(null)
  const [technicalOpen, setTechnicalOpen] = useState(false)

  const readiness = useActivationReadiness()
  const pairDetection = useMelegaPairDetection(selectedCurrency)
  const programRead = useProgramReadModel({
    owner: address ?? null,
    projectTokenAddress: draft.tokenAddress,
  })

  const balance = useCurrencyBalance(address ?? undefined, selectedCurrency ?? undefined)
  const walletConnected = Boolean(address)
  const correctChain = chain?.id === ChainId.BSC
  const activationPending = !readiness.gates.activationAuthorized

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
      canSubmitMutatingAction({
        walletConnected,
        correctChain,
        gates: readiness.gates,
      }),
    [walletConnected, correctChain, readiness.gates],
  )

  const draftReady = setupDraftReadyForReview(draft)

  /** On-chain status wins when program is live; else local UX navigation status. */
  const effectiveStatus: ProgramStatus = programRead.snapshot.status ?? status
  const manageActions = availableManageActions(effectiveStatus)
  const decisionFrequencyLabel =
    DECISION_FREQUENCY_OPTIONS.find((o) => o.seconds === draft.epochSeconds)?.label ?? 'Every 5 minutes'

  const metrics: ProgramMetrics =
    programRead.source === 'ON_CHAIN' ? programRead.snapshot.metrics : EMPTY_PROGRAM_METRICS
  const activity: LbActivityItem[] = programRead.source === 'ON_CHAIN' ? programRead.activity : []

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
    closeManage: () =>
      setPhase(['ACTIVE', 'PAUSED', 'BUDGET_DEPLETED', 'STOPPED'].includes(effectiveStatus) ? 'active' : 'entry'),
    toggleTechnical: () => setTechnicalOpen((v) => !v),
    reset,
  }
}
