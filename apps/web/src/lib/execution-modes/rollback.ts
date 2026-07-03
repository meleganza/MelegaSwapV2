import { resetExecutionGatewayActivation } from '../execution-gateway/activation'
import { resetInternalIngressActivation } from '../execution-ingress/activation'
import { ACTIVATION_LIFECYCLE_DRY_RUN } from './activation-lifecycle'
import { resetCivilizationObservations } from './civilization-observations'
import {
  resetExecutionModeConfig,
  setActivationLifecycleForHarness,
  setCivilizationAuthorizationForHarness,
  setTestnetExecutionArmedForHarness,
} from './config'

export interface RollbackResult {
  lifecycle: typeof ACTIVATION_LIFECYCLE_DRY_RUN
  gatewayEnabled: false
  ingressEnabled: false
  testnetArmed: false
  civilizationAuthorized: false
  message: string
}

/**
 * Immediate rollback before wallet submission.
 * Returns execution to DRY_RUN lifecycle with all live arms disengaged.
 * Does not fabricate receipts or settlement events.
 */
export function rollbackActivationToDryRun(): RollbackResult {
  setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_DRY_RUN)
  setTestnetExecutionArmedForHarness(false)
  setCivilizationAuthorizationForHarness(false)
  resetExecutionGatewayActivation()
  resetInternalIngressActivation()

  return {
    lifecycle: ACTIVATION_LIFECYCLE_DRY_RUN,
    gatewayEnabled: false,
    ingressEnabled: false,
    testnetArmed: false,
    civilizationAuthorized: false,
    message: 'Activation rolled back to DRY_RUN — wallet submission impossible',
  }
}

/** Full harness reset including mode OFF and observation defaults. */
export function rollbackToOff(): void {
  rollbackActivationToDryRun()
  resetExecutionModeConfig()
  resetCivilizationObservations()
}
