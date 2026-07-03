import { resetExecutionGatewayActivation, setExecutionGatewayEnabled } from '../execution-gateway/activation'
import { resetInternalIngressActivation } from '../execution-ingress/activation'
import { ACTIVATION_LIFECYCLE_DRY_RUN, ACTIVATION_LIFECYCLE_TESTNET_ARMED } from './activation-lifecycle'
import { resetCivilizationObservations } from './civilization-observations'
import { EXECUTION_MODE_DRY_RUN, EXECUTION_MODE_TESTNET_EXECUTION_ONLY } from './constants'
import {
  resetExecutionModeConfig,
  setActivationLifecycleForHarness,
  setExecutionModeForHarness,
  setTestnetExecutionArmedForHarness,
} from './config'

/** @internal KERL harness — enables dry-run path for tests only. */
export function enableKerlDryRunHarness(): void {
  setExecutionModeForHarness(EXECUTION_MODE_DRY_RUN)
  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_DRY_RUN)
  setExecutionGatewayEnabled(true)
}

/**
 * @internal Arms testnet lifecycle to TESTNET_ARMED only — does NOT enable execution.
 * Wallet submission remains impossible until Civilization authorization + lifecycle ENABLED.
 */
export function armTestnetLifecycleForHarness(): void {
  setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_ARMED)
  setTestnetExecutionArmedForHarness(true)
}

/** @internal Resets all execution activation state. */
export function resetKerlExecutionHarness(): void {
  resetExecutionModeConfig()
  resetExecutionGatewayActivation()
  resetInternalIngressActivation()
  resetCivilizationObservations()
}
