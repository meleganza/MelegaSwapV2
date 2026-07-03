/**
 * Execution gateway — inactive by default.
 * Enable only for internal KERL validation harnesses; never in production UI paths.
 */
import { EXECUTION_MODE_DRY_RUN, EXECUTION_MODE_OFF } from '../execution-modes/constants'
import { getConfiguredExecutionMode, setExecutionModeForHarness } from '../execution-modes/config'

let executionGatewayEnabled = false

export function isExecutionGatewayEnabled(): boolean {
  return executionGatewayEnabled
}

/** @internal Test and harness use only. */
export function setExecutionGatewayEnabled(enabled: boolean): void {
  executionGatewayEnabled = enabled
  if (enabled && getConfiguredExecutionMode() === EXECUTION_MODE_OFF) {
    setExecutionModeForHarness(EXECUTION_MODE_DRY_RUN)
  }
}

/** @internal Test harness reset. */
export function resetExecutionGatewayActivation(): void {
  executionGatewayEnabled = false
}
