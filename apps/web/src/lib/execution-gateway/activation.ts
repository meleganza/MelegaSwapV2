/**
 * Execution gateway — inactive by default.
 * Enable only for internal KERL validation harnesses; never in production UI paths.
 */
let executionGatewayEnabled = false

export function isExecutionGatewayEnabled(): boolean {
  return executionGatewayEnabled
}

/** @internal Test and harness use only. */
export function setExecutionGatewayEnabled(enabled: boolean): void {
  executionGatewayEnabled = enabled
}

/** @internal Test harness reset. */
export function resetExecutionGatewayActivation(): void {
  executionGatewayEnabled = false
}
