import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import { ChainId } from '@pancakeswap/sdk'
import type { Currency } from '@pancakeswap/sdk'
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
    activationAuthorized: false, // never invent authorization from health alone
    mainnetCycleAuthorized: false,
    contractsDeployed: false, // LB Factory not bound on mainnet
    deploymentInputsValid,
    runtimeReady,
    blockers: blockers.length ? blockers.map(String) : [...BLOCKED_ACTIVATION_GATES.blockers],
  }
}

export type LiquidityBuildingCardState = {
  status: ProgramStatus
  draft: SetupDraft
  gates: ActivationGateSummary
  walletConnected: boolean
  correctChain: boolean
  account: string | null
  reviewOpen: boolean
  blockerMessage: string | null
  mutateGate: ReturnType<typeof canSubmitMutatingAction>
  draftReady: boolean
  setToken: (currency: Currency | null) => void
  setBudget: (value: string) => void
  setStrategy: (mode: StrategyMode) => void
  setRateRange: (min: string, max: string) => void
  setEpoch: (seconds: EpochSeconds) => void
  startSetup: () => void
  openReview: () => void
  closeReview: () => void
  requestApproval: () => void
  requestDeposit: () => void
  requestActivate: () => void
  cancelApproval: () => void
  reset: () => void
}

export function useLiquidityBuildingCard(): LiquidityBuildingCardState {
  const { address } = useAccount()
  const { chain } = useNetwork()
  const [status, setStatus] = useState<ProgramStatus>('NOT_ACTIVE')
  const [draft, setDraft] = useState<SetupDraft>(EMPTY_SETUP_DRAFT)
  const [gates, setGates] = useState<ActivationGateSummary>({ ...BLOCKED_ACTIVATION_GATES })
  const [reviewOpen, setReviewOpen] = useState(false)
  const [blockerMessage, setBlockerMessage] = useState<string | null>(null)

  const walletConnected = Boolean(address)
  const correctChain = chain?.id === ChainId.BSC

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

  const refuseMutation = useCallback(
    (action: string) => {
      const reason = mutateGate.reason || 'ACTIVATION_NOT_AUTHORIZED'
      setBlockerMessage(
        `${action} blocked: ${reason}. Liquidity Building remains fail-closed until deployment inputs validate and external activation gates pass.`,
      )
    },
    [mutateGate.reason],
  )

  return {
    status,
    draft,
    gates,
    walletConnected,
    correctChain,
    account: address ?? null,
    reviewOpen,
    blockerMessage,
    mutateGate,
    draftReady,
    setToken: (currency) => {
      setDraft((d) => ({
        ...d,
        tokenAddress: currency?.wrapped?.address ?? null,
        tokenSymbol: currency?.symbol ?? null,
      }))
      setStatus((s) => (s === 'NOT_ACTIVE' ? 'SETUP_REQUIRED' : s))
      setBlockerMessage(null)
    },
    setBudget: (value) => setDraft((d) => ({ ...d, tokenBudget: value })),
    setStrategy: (mode) => setDraft((d) => ({ ...d, strategy: mode })),
    setRateRange: (min, max) => setDraft((d) => ({ ...d, minimumRateBps: min, maximumRateBps: max })),
    setEpoch: (seconds) => setDraft((d) => ({ ...d, epochSeconds: seconds })),
    startSetup: () => {
      setStatus((s) => transitionProgramStatus(s, 'START_SETUP'))
      setBlockerMessage(null)
    },
    openReview: () => {
      if (!draftReady) {
        setBlockerMessage('Complete token, budget, strategy, and epoch before review.')
        return
      }
      setReviewOpen(true)
      setBlockerMessage(null)
    },
    closeReview: () => setReviewOpen(false),
    requestApproval: () => {
      if (!mutateGate.ok) {
        refuseMutation('Approve')
        // Surface Awaiting Approval only as the intended next step — do not claim on-chain success.
        setStatus((s) => transitionProgramStatus(s, 'REQUEST_APPROVAL'))
        return
      }
      setStatus((s) => transitionProgramStatus(s, 'REQUEST_APPROVAL'))
    },
    requestDeposit: () => {
      if (!mutateGate.ok) {
        refuseMutation('Deposit')
        return
      }
      setStatus((s) => transitionProgramStatus(s, 'APPROVAL_CONFIRMED'))
    },
    requestActivate: () => {
      if (!mutateGate.ok) {
        refuseMutation('Activation')
        return
      }
      setStatus((s) => transitionProgramStatus(s, 'ACTIVATE'))
    },
    cancelApproval: () => setStatus((s) => transitionProgramStatus(s, 'CANCEL_TO_SETUP')),
    reset: () => {
      setStatus('NOT_ACTIVE')
      setDraft(EMPTY_SETUP_DRAFT)
      setReviewOpen(false)
      setBlockerMessage(null)
    },
  }
}
