import {
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED,
} from '../execution-modes/activation-lifecycle'
import {
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
} from '../execution-modes/constants'
import {
  setActivationLifecycleForHarness,
  setCivilizationAuthorizationForHarness,
  setEnvironmentAuthorizedForHarness,
  setExecutionModeForHarness,
  setTestnetExecutionArmedForHarness,
} from '../execution-modes/config'
import { setExecutionGatewayEnabled } from '../execution-gateway/activation'
import { setInternalIngressEnabled } from '../execution-ingress/activation'

let krmpActivated = false

/**
 * KRMP-01 constitutional activation for BNB Testnet operational readiness.
 * Enables KERL live execution gates without modifying Treasury or Wrapper Solidity.
 */
export function ensureKrmpTestnetOperationalActivation(): void {
  if (krmpActivated) return
  krmpActivated = true

  setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED)
  setEnvironmentAuthorizedForHarness(true)
  setTestnetExecutionArmedForHarness(true)
  setCivilizationAuthorizationForHarness(true)
  setExecutionGatewayEnabled(true)
  setInternalIngressEnabled(true)
}

/** @internal Test harness reset */
export function resetKrmpTestnetOperationalActivation(): void {
  krmpActivated = false
}
