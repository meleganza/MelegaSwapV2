import { resetExecutionGatewayActivation, setExecutionGatewayEnabled } from '../execution-gateway/activation'
import { resetInternalIngressActivation } from '../execution-ingress/activation'
import { EXECUTION_MODE_DRY_RUN } from './constants'
import { resetExecutionModeConfig, setExecutionModeForHarness } from './config'

/** @internal KERL harness — enables dry-run path for tests only. */
export function enableKerlDryRunHarness(): void {
  setExecutionModeForHarness(EXECUTION_MODE_DRY_RUN)
  setExecutionGatewayEnabled(true)
}

/** @internal Resets all execution activation state. */
export function resetKerlExecutionHarness(): void {
  resetExecutionModeConfig()
  resetExecutionGatewayActivation()
  resetInternalIngressActivation()
}
