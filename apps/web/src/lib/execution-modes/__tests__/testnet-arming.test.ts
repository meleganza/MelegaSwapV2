import { describe, expect, it, beforeEach, afterEach } from 'vitest'

import { resetExecutionGatewayActivation, setExecutionGatewayEnabled } from 'lib/execution-gateway'
import {
  acceptKerlExecutionInstruction,
  dispatchExecutionInstruction,
  resetInternalIngressActivation,
  setInternalIngressEnabled,
} from 'lib/execution-ingress'
import { createSmartSwapExecutionInstruction } from 'lib/routing-layer'
import {
  ACTIVATION_LIFECYCLE_TESTNET_ARMED,
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  armTestnetLifecycleForHarness,
  canPerformLiveExecution,
  canTransitionLifecycle,
  evaluateLiveExecutionGates,
  getExecutionModeConfig,
  lifecyclePermitsWalletSubmission,
  listRequiredLiveGateIds,
  resetKerlExecutionHarness,
  rollbackActivationToDryRun,
  runTestnetArmingValidation,
  setActivationLifecycleForHarness,
  setCivilizationAuthorizationForHarness,
  setCivilizationObservationsForHarness,
  setEnvironmentAuthorizedForHarness,
  setExecutionModeForHarness,
  setTestnetExecutionArmedForHarness,
} from 'lib/execution-modes'

function sampleInstruction() {
  return createSmartSwapExecutionInstruction({
    id: 'arming-test-instruction',
    correlationId: 'arming-test-correlation',
    chainId: 97,
    adapter: 'smart-router',
    domain: 'swap',
    source: 'dex-routing',
    createdAt: '2026-07-03T00:00:00.000Z',
    version: '1.0',
    payload: {
      tradeType: 'EXACT_INPUT',
      inputCurrency: '0x0000000000000000000000000000000000000001',
      outputCurrency: '0x0000000000000000000000000000000000000002',
      inputAmount: '1000000000000000000',
      outputAmount: '2000000000000000000',
      slippageBps: 50,
      recipient: '0x00000000000000000000000000000000000000aa',
      deadline: 9999999999,
    },
  })
}

function fullyConfiguredContext() {
  return {
    chainId: 97,
    account: '0x00000000000000000000000000000000000000aa',
    instructionValid: true,
    certifiedHandoff: true,
    handoffCompatible: true,
    instructionType: 'SmartSwap' as const,
    mode: EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  }
}

describe('testnet-arming T1', () => {
  beforeEach(() => {
    resetKerlExecutionHarness()
  })

  afterEach(() => {
    resetKerlExecutionHarness()
  })

  it('declares all required live activation gates explicitly', () => {
    const ids = listRequiredLiveGateIds()
    expect(ids).toContain('civilization_authorization')
    expect(ids).toContain('lifecycle_permits_execution')
    expect(ids).toContain('registry_published')
    expect(ids).toContain('treasury_observation_available')
    expect(ids).toContain('supported_execution_type')
    expect(ids.length).toBeGreaterThanOrEqual(22)
  })

  it('passes T1 arming validation at default disarmed state', () => {
    const report = runTestnetArmingValidation()
    expect(report.passed).toBe(true)
    expect(report.blockingChecks).toHaveLength(0)
  })

  it('blocks execution while lifecycle is TESTNET_ARMED only', () => {
    armTestnetLifecycleForHarness()
    setExecutionGatewayEnabled(true)
    setInternalIngressEnabled(true)
    setEnvironmentAuthorizedForHarness(true)
    setCivilizationAuthorizationForHarness(true)

    expect(getExecutionModeConfig().activationLifecycleState).toBe(ACTIVATION_LIFECYCLE_TESTNET_ARMED)
    expect(lifecyclePermitsWalletSubmission(ACTIVATION_LIFECYCLE_TESTNET_ARMED)).toBe(false)
    expect(canPerformLiveExecution(fullyConfiguredContext())).toBe(false)
  })

  it('blocks execution without Civilization authorization even when fully configured', () => {
    setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED)
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    setExecutionGatewayEnabled(true)
    setInternalIngressEnabled(true)
    setEnvironmentAuthorizedForHarness(true)
    setTestnetExecutionArmedForHarness(true)

    const evaluation = evaluateLiveExecutionGates(fullyConfiguredContext())
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.blockingGate).toBe('civilization_authorization')
  })

  it('blocks execution when registry is unavailable', () => {
    setCivilizationObservationsForHarness({ registryPublished: false })
    const evaluation = evaluateLiveExecutionGates(fullyConfiguredContext())
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.gates.find((g) => g.id === 'registry_published')?.satisfied).toBe(false)
  })

  it('blocks execution with incompatible certification', () => {
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    setEnvironmentAuthorizedForHarness(true)
    const evaluation = evaluateLiveExecutionGates({
      ...fullyConfiguredContext(),
      handoffCompatible: false,
    })
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.gates.find((g) => g.id === 'handoff_compatible')?.satisfied).toBe(false)
  })

  it('blocks execution with unsupported chain', () => {
    const evaluation = evaluateLiveExecutionGates({
      ...fullyConfiguredContext(),
      chainId: 56,
    })
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.gates.find((g) => g.id === 'testnet_only')?.satisfied).toBe(false)
  })

  it('blocks execution with unsupported instruction type', () => {
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    setEnvironmentAuthorizedForHarness(true)
    const evaluation = evaluateLiveExecutionGates({
      ...fullyConfiguredContext(),
      instructionType: undefined,
    })
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.gates.find((g) => g.id === 'supported_execution_type')?.satisfied).toBe(false)
  })

  it('forbids MAINNET execution permanently', () => {
    const evaluation = evaluateLiveExecutionGates({
      mode: EXECUTION_MODE_MAINNET_EXECUTION,
      chainId: 56,
      account: '0xaa',
      instructionValid: true,
      certifiedHandoff: true,
      handoffCompatible: true,
      instructionType: 'SmartSwap',
    })
    expect(evaluation.allowed).toBe(false)
  })

  it('rolls back to DRY_RUN before wallet submission', () => {
    armTestnetLifecycleForHarness()
    setExecutionGatewayEnabled(true)
    setInternalIngressEnabled(true)
    setCivilizationAuthorizationForHarness(true)

    const result = rollbackActivationToDryRun()
    expect(result.lifecycle).toBe('DRY_RUN')
    expect(result.gatewayEnabled).toBe(false)
    expect(result.ingressEnabled).toBe(false)
    expect(getExecutionModeConfig().kerlLiveExecutionAuthorized).toBe(false)
  })

  it('rejects KERL ingress and dispatch at default OFF — no wallet submission', async () => {
    const instruction = sampleInstruction()
    const accept = acceptKerlExecutionInstruction(instruction, { chainId: 97 })
    expect(accept.ok).toBe(false)

    const dispatch = await dispatchExecutionInstruction(instruction, {
      account: '0x00000000000000000000000000000000000000aa',
      chainId: 97,
      certifiedHandoff: true,
      adapters: { smartSwap: async () => '0xhash' },
    })
    expect(dispatch.ok).toBe(false)
  })

  it('enforces ordered lifecycle transitions without skipping', () => {
    expect(canTransitionLifecycle('OFF', 'DRY_RUN')).toBe(true)
    expect(canTransitionLifecycle('OFF', 'TESTNET_ARMED')).toBe(false)
    expect(canTransitionLifecycle('TESTNET_ARMED', 'TESTNET_EXECUTION_ENABLED')).toBe(true)
    expect(canTransitionLifecycle('DRY_RUN', 'TESTNET_EXECUTION_ENABLED')).toBe(false)
  })

  it('still blocks live execution when all harness flags except civilization auth are set', () => {
    setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED)
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    setExecutionGatewayEnabled(true)
    setInternalIngressEnabled(true)
    setEnvironmentAuthorizedForHarness(true)
    setTestnetExecutionArmedForHarness(true)

    expect(canPerformLiveExecution(fullyConfiguredContext())).toBe(false)
  })
})
