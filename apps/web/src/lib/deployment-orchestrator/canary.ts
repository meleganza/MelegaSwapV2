import type { CanaryStatus, SubsystemId } from './types'

/**
 * Canary ledger — records only. Orchestrator does not execute canaries.
 * Remains Pending until a verified production canary is recorded post-deploy.
 */
const CANARY_LEDGER: Record<SubsystemId, CanaryStatus> = {
  liquidity_builder: 'Pending',
  create_token: 'Pending',
  public_farm_factory: 'Pending',
}

export function getCanaryStatus(id: SubsystemId): CanaryStatus {
  return CANARY_LEDGER[id]
}

export function getAllCanaryStatuses(): Record<SubsystemId, CanaryStatus> {
  return { ...CANARY_LEDGER }
}

/** Test/ops hook — only for recording factual canary outcomes after live runs. */
export function recordCanaryStatus(id: SubsystemId, status: CanaryStatus): void {
  CANARY_LEDGER[id] = status
}
