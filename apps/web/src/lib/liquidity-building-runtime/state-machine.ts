import type { LoopState, ObservationStatus, RuntimeHealthStatus } from './types'

export type LoopTransition = {
  from: LoopState
  to: LoopState
  reason: string
}

const ALLOWED: Record<LoopState, LoopState[]> = {
  DISCOVER: ['OBSERVE', 'EXECUTION_FAILED'],
  OBSERVE: ['FINALIZE', 'WAITING_FINALITY', 'REORGED', 'EXECUTION_FAILED'],
  FINALIZE: ['DECIDE', 'WAITING_FINALITY', 'REORGED', 'EXECUTION_FAILED'],
  DECIDE: ['SIGN', 'COMPLETE', 'EXECUTION_FAILED'],
  SIGN: ['SUBMIT', 'SIGNING_UNAVAILABLE', 'EXECUTION_FAILED'],
  SUBMIT: ['MONITOR', 'RELAY_UNAVAILABLE', 'EXECUTION_FAILED'],
  MONITOR: ['RECONCILE', 'EXECUTION_FAILED', 'REORGED'],
  RECONCILE: ['COMPLETE', 'TREASURY_UNAVAILABLE', 'EXECUTION_FAILED'],
  COMPLETE: [],
  WAITING_FINALITY: ['FINALIZE', 'OBSERVE', 'REORGED'],
  SIGNING_UNAVAILABLE: ['SIGN', 'COMPLETE'],
  TREASURY_UNAVAILABLE: ['RECONCILE', 'COMPLETE'],
  RELAY_UNAVAILABLE: ['SUBMIT', 'COMPLETE'],
  EXECUTION_FAILED: ['COMPLETE', 'DISCOVER'],
  REORGED: ['OBSERVE', 'COMPLETE'],
}
export class AutonomousLoopStateMachine {
  state: LoopState = 'DISCOVER'
  readonly history: LoopTransition[] = []
  private retries = new Map<string, number>()
  readonly maxRetries: number

  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries
  }

  canTransition(to: LoopState): boolean {
    return (ALLOWED[this.state] || []).includes(to)
  }

  transition(to: LoopState, reason: string): LoopTransition {
    if (!this.canTransition(to)) {
      throw new Error(`INVALID_TRANSITION:${this.state}->${to}`)
    }
    const edge = `${this.state}->${to}`
    const n = (this.retries.get(edge) || 0) + 1
    if (n > this.maxRetries && to === this.state) {
      throw new Error(`RETRY_BUDGET_EXCEEDED:${edge}`)
    }
    this.retries.set(edge, n)
    const t = { from: this.state, to, reason }
    this.history.push(t)
    this.state = to
    return t
  }

  /** Map observation status into loop branch. */
  onObservationStatus(status: ObservationStatus): LoopState {
    if (status === 'AWAITING_FINALITY') {
      if (this.state === 'OBSERVE' || this.state === 'FINALIZE' || this.state === 'WAITING_FINALITY') {
        this.transition('WAITING_FINALITY', 'awaiting_finality')
      }
      return this.state
    }
    if (status === 'REORGED') {
      this.transition('REORGED', 'reorg')
      return this.state
    }
    if (status === 'FINALIZED') {
      if (this.state === 'OBSERVE' || this.state === 'WAITING_FINALITY' || this.state === 'FINALIZE') {
        if (this.state !== 'FINALIZE') this.transition('FINALIZE', 'finalized')
        this.transition('DECIDE', 'ready_to_decide')
      }
      return this.state
    }
    return this.state
  }
}

export function healthFromDependencies(deps: {
  kmsReady: boolean
  relayReady: boolean
  treasuryReady: boolean
  quotePolicyReady: boolean
  contractsDeployed: boolean
  observerOk: boolean
}): { status: RuntimeHealthStatus; blockers: string[] } {
  const blockers: string[] = []
  if (!deps.kmsReady) blockers.push('LB-G03B/LB-G11:KMS')
  if (!deps.relayReady) blockers.push('LB-G03C:RELAY')
  if (!deps.treasuryReady) blockers.push('LB-G04B/LB-G04C/LB-G12:TREASURY')
  if (!deps.quotePolicyReady) blockers.push('LB-G08/LB-G09:QUOTE_POLICY')
  if (!deps.contractsDeployed) blockers.push('CONTRACTS_NOT_DEPLOYED')
  if (!deps.observerOk) blockers.push('OBSERVER_FAILED')

  if (blockers.includes('OBSERVER_FAILED')) return { status: 'FAILED', blockers }
  if (blockers.length) return { status: 'BLOCKED', blockers }
  return { status: 'READY', blockers }
}
