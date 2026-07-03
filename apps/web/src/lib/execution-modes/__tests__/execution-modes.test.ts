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
  EXECUTION_MODE_DRY_RUN,
  EXECUTION_MODE_MAINNET_EXECUTION,
  EXECUTION_MODE_OFF,
  EXECUTION_MODE_TESTNET_EXECUTION_ONLY,
  ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED,
  MODE_ERROR_CODES,
  canPerformDryRun,
  canPerformLiveExecution,
  evaluateDryRunGates,
  evaluateLiveExecutionGates,
  getConfiguredExecutionMode,
  resetExecutionModeConfig,
  resetKerlExecutionHarness,
  setEnvironmentAuthorizedForHarness,
  setExecutionModeForHarness,
  setTestnetExecutionArmedForHarness,
  setActivationLifecycleForHarness,
  enableKerlDryRunHarness,
} from 'lib/execution-modes'

function sampleInstruction() {
  return createSmartSwapExecutionInstruction({
    id: 'mode-test-instruction',
    correlationId: 'mode-test-correlation',
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

describe('execution-modes', () => {
  beforeEach(() => {
    resetKerlExecutionHarness()
  })

  afterEach(() => {
    resetKerlExecutionHarness()
  })

  it('defaults to OFF mode with no execution possible', () => {
    expect(getConfiguredExecutionMode()).toBe(EXECUTION_MODE_OFF)
    expect(canPerformDryRun()).toBe(false)
    expect(canPerformLiveExecution()).toBe(false)
  })

  it('allows dry-run only when DRY_RUN mode and gateway are enabled', () => {
    enableKerlDryRunHarness()
    expect(canPerformDryRun()).toBe(true)
    const evaluation = evaluateDryRunGates()
    expect(evaluation.allowed).toBe(true)
  })

  it('blocks TESTNET mode even with harness flags but without Civilization authorization', () => {
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    setActivationLifecycleForHarness(ACTIVATION_LIFECYCLE_TESTNET_EXECUTION_ENABLED)
    setExecutionGatewayEnabled(true)
    setInternalIngressEnabled(true)
    setEnvironmentAuthorizedForHarness(true)
    setTestnetExecutionArmedForHarness(true)

    const evaluation = evaluateLiveExecutionGates({
      chainId: 97,
      account: '0x00000000000000000000000000000000000000aa',
      instructionValid: true,
      certifiedHandoff: true,
      handoffCompatible: true,
      instructionType: 'SmartSwap',
    })

    expect(evaluation.allowed).toBe(false)
    expect(canPerformLiveExecution()).toBe(false)
  })

  it('blocks MAINNET mode permanently', () => {
    setExecutionModeForHarness(EXECUTION_MODE_MAINNET_EXECUTION)
    const evaluation = evaluateLiveExecutionGates({ chainId: 56, account: '0xaa' })
    expect(evaluation.allowed).toBe(false)
    expect(evaluation.errorCode).toBe(MODE_ERROR_CODES.MAINNET_FORBIDDEN)
  })

  it('rejects KERL ingress when mode is OFF', () => {
    const result = acceptKerlExecutionInstruction(sampleInstruction())
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(MODE_ERROR_CODES.MODE_OFF)
    }
  })

  it('rejects KERL ingress when mode is TESTNET_EXECUTION_ONLY', () => {
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    const result = acceptKerlExecutionInstruction(sampleInstruction(), { chainId: 97 })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe(MODE_ERROR_CODES.TESTNET_NOT_ACTIVATED)
    }
  })

  it('blocks dispatch even when ingress is enabled without live gates', async () => {
    setInternalIngressEnabled(true)
    setExecutionModeForHarness(EXECUTION_MODE_TESTNET_EXECUTION_ONLY)
    const instruction = sampleInstruction()
    const result = await dispatchExecutionInstruction(instruction, {
      account: '0x00000000000000000000000000000000000000aa',
      chainId: 97,
      certifiedHandoff: true,
      adapters: {
        smartSwap: async () => '0xhash',
        v2Swap: async () => '0xhash',
        bridgeBurn: async () => '0xhash',
      },
    })
    expect(result.ok).toBe(false)
  })
})
