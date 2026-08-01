import type { DeploymentLifecycleState } from './types'

/**
 * Map factual binding signals → lifecycle state.
 * Orchestrator does not invent DEPLOYING/LIVE without evidence.
 */
export function computeSubsystemState(input: {
  packageReady: boolean
  authorityPresent: boolean
  deployed: boolean
  verified: boolean
  bound: boolean
  runtimeReady: boolean
  canaryPassed: boolean
  deploying?: boolean
}): DeploymentLifecycleState {
  if (!input.packageReady) return 'NOT_READY'
  if (input.runtimeReady && input.bound && input.verified && input.canaryPassed) return 'LIVE'
  if (input.bound && input.verified) return 'BOUND'
  if (input.verified) return 'VERIFIED'
  if (input.deployed) return 'DEPLOYED'
  if (input.deploying) return 'DEPLOYING'
  if (!input.authorityPresent) return 'BLOCKED'
  return 'READY'
}

/** Global state = first non-LIVE subsystem in canonical order; LIVE only when all LIVE. */
export function computeGlobalState(states: DeploymentLifecycleState[]): DeploymentLifecycleState {
  if (states.length === 0) return 'NOT_READY'
  if (states.every((s) => s === 'LIVE')) return 'LIVE'
  for (const s of states) {
    if (s !== 'LIVE') return s
  }
  return 'BLOCKED'
}

export function humanNextAction(
  globalState: DeploymentLifecycleState,
  firstBlockedLabel: string,
  authorityPresent: boolean,
): string {
  if (globalState === 'LIVE') return 'All subsystems LIVE — monitor canaries.'
  if (globalState === 'READY') {
    return `Connect MELEGA DEPLOYER and sign ${firstBlockedLabel} deployment.`
  }
  if (globalState === 'DEPLOYED') return `Validate bytecode for ${firstBlockedLabel}, then bind.`
  if (globalState === 'VERIFIED') return `Bind ${firstBlockedLabel} into frontend SSOT.`
  if (globalState === 'BOUND') return `Confirm ${firstBlockedLabel} runtime READY.`
  if (globalState === 'BLOCKED') {
    return authorityPresent
      ? `Clear Founder deploy gates for ${firstBlockedLabel}.`
      : `Connect authorized MELEGA DEPLOYER for ${firstBlockedLabel}.`
  }
  return `Complete package readiness for ${firstBlockedLabel}.`
}
