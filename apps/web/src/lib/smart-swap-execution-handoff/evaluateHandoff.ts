/**
 * Pure readiness evaluation — no wallet RPC, no broadcast.
 */

import type {
  SmartSwapExecutionHandoff,
  SmartSwapExecutionHandoffInput,
  SmartSwapHandoffCheck,
  SmartSwapHandoffFailure,
  SmartSwapHandoffLifecycle,
} from './types'
import { userFacingHandoffFailureMessage, userFacingHandoffReadyMessage } from './userFacingMessages'

const DEFAULT_CHAIN = 56

function check(
  id: string,
  label: string,
  satisfied: boolean,
  failure?: SmartSwapHandoffFailure,
  detail?: string,
): SmartSwapHandoffCheck {
  return { id, label, satisfied, failure: satisfied ? undefined : failure, detail }
}

export function evaluateSmartSwapExecutionHandoff(
  input: SmartSwapExecutionHandoffInput,
): SmartSwapExecutionHandoff {
  const expected = input.expectedChainId ?? DEFAULT_CHAIN
  const checks: SmartSwapHandoffCheck[] = [
    check('wallet', 'Wallet connected', input.walletConnected, 'WALLET_NOT_CONNECTED'),
    check(
      'network',
      'Chain ID correct',
      Boolean(input.chainId != null && input.chainId === expected),
      'WRONG_NETWORK',
      input.chainId != null ? `chainId=${input.chainId}` : 'chain unknown',
    ),
    check('route', 'Route available', input.routeAvailable, 'NO_ROUTE'),
    check('freshness', 'Quote fresh', input.quoteFresh, 'STALE_QUOTE'),
    check(
      'minimum',
      'Minimum received available',
      input.minimumReceivedAvailable,
      'EXECUTION_UNAVAILABLE',
    ),
    check('gas', 'Gas estimate available', input.gasEstimateAvailable, 'GAS_ESTIMATION_FAILED'),
    check(
      'allowance',
      'Allowance sufficient',
      input.allowanceSufficient === true,
      'INSUFFICIENT_ALLOWANCE',
      input.allowanceSufficient === null ? 'Allowance unknown — approval may be required' : undefined,
    ),
    check(
      'balance',
      'Token balance sufficient',
      input.balanceSufficient === true,
      'INSUFFICIENT_BALANCE',
      input.balanceSufficient === null ? 'Balance unknown' : undefined,
    ),
    check(
      'simulation',
      'Simulation passed',
      input.simulationPassed === true,
      'SIMULATION_FAILED',
      input.simulationPassed === null ? 'Simulation not yet run' : undefined,
    ),
    check('calldata', 'Router calldata valid', input.calldataValid, 'CALLDATA_INVALID'),
    check('deadline', 'Deadline valid', input.deadlineValid, 'EXECUTION_UNAVAILABLE'),
  ]

  const failures = checks
    .filter((c) => !c.satisfied && c.failure)
    .map((c) => c.failure as SmartSwapHandoffFailure)

  // Soft-unknown allowance/balance/simulation do not block certification if core path is ready,
  // but must remain explicit — certification requires all hard checks.
  // Mission: verify allowance sufficient + simulation passed before enabling live execution.
  const certified = failures.length === 0

  let lifecycle: SmartSwapHandoffLifecycle = 'UNAVAILABLE'
  if (input.executionSuccess) lifecycle = 'SUCCESS'
  else if (input.executionFailure) lifecycle = 'FAILURE'
  else if (input.executionPending) lifecycle = 'EXECUTION_PENDING'
  else if (input.loading) lifecycle = 'LOADING'
  else if (certified) lifecycle = 'HANDOFF_READY'
  else if (input.previewAvailable && input.routeAvailable) lifecycle = 'PREVIEW_AVAILABLE'
  else if (input.routeAvailable) lifecycle = 'ROUTE_FOUND'
  else if (input.walletConnected) lifecycle = 'SELECTED'
  else lifecycle = 'UNAVAILABLE'

  let message: string
  if (certified) {
    message = userFacingHandoffReadyMessage()
  } else if (failures[0]) {
    message = userFacingHandoffFailureMessage(failures[0])
  } else {
    message = userFacingHandoffFailureMessage('EXECUTION_UNAVAILABLE')
  }

  return {
    certified,
    lifecycle,
    checks,
    failures,
    requiresUserConfirmation: true,
    autoSignForbidden: true,
    autoBroadcastForbidden: true,
    relatedRouteId: input.relatedRouteId ?? null,
    relatedPreviewFreshness: input.relatedPreviewFreshness ?? null,
    message,
    evaluatedAt: input.evaluatedAt ?? new Date().toISOString(),
  }
}
