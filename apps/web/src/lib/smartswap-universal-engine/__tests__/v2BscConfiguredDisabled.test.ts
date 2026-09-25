import { getAddress } from '@ethersproject/address'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import {
  PRODUCTION_EXECUTION_MODE,
  SMARTSWAP_OPERATING_MODE,
  UNIVERSAL_ENGINE_MODE,
  isProductionCutoverAllowed,
} from '../operatingMode'
import {
  BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS,
  TEAM_OPERATOR_REF,
  V2_EXECUTION_RUNTIME_CONFIG,
  V2_EXECUTOR_CONFIG_STATUS,
  forbiddenExecutorAddress,
  isV2ExecutorRuntimeEnabled,
  resolveV2ExecutorConfig,
} from '../v2ExecutionRuntimeConfig'
import {
  V2_PLAN_REASON,
  V2_PUBLIC_ACTION,
  V2_TEST_ONLY_CTA_EXECUTION_GATE,
  buildV2UserExecutionPlan,
  resolveSmartSwapCtaDecision,
  selectSmartSwapCtaExecution,
  shouldReadV2ExecutorAllowance,
} from '../v2UserExecutionPlan'

const BSC_EXECUTOR = '0x7c07082839edd5797737640bba6af47992b9861e'
const USER = '0x1111111111111111111111111111111111111111'
/** Software rollback row: BSC enabled=false (post-cutover the stored row is enabled). */
const ROLLBACK_TABLE = { 56: { ...V2_EXECUTION_RUNTIME_CONFIG[56], enabled: false } }

describe('MELEGA-SMARTSWAP-V2-BSC-CONFIGURED-DISABLED', () => {
  it('1: stored BSC row is CONFIGURED / enabled=true (public cutover candidate) / canonical executor', () => {
    expect(BSC_SMARTSWAP_EXECUTOR_V2_ADDRESS).toBe(BSC_EXECUTOR)
    expect(V2_EXECUTION_RUNTIME_CONFIG[56]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: BSC_EXECUTOR,
    })
  })

  it('2: stored Ethereum row remains NOT_CONFIGURED', () => {
    expect(V2_EXECUTION_RUNTIME_CONFIG[1]).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.NOT_CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
  })

  it('3/4: resolve(56) is executable with the canonical executor; rollback row (enabled=false) is not', () => {
    const resolved = resolveV2ExecutorConfig(56)
    expect(resolved).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: true,
      executorAddress: getAddress(BSC_EXECUTOR),
    })
    expect(isV2ExecutorRuntimeEnabled(resolved)).toBe(true)
    const rolledBack = resolveV2ExecutorConfig(56, ROLLBACK_TABLE)
    expect(rolledBack).toEqual({
      status: V2_EXECUTOR_CONFIG_STATUS.CONFIGURED,
      enabled: false,
      executorAddress: null,
    })
    expect(isV2ExecutorRuntimeEnabled(rolledBack)).toBe(false)
    expect(isV2ExecutorRuntimeEnabled(ROLLBACK_TABLE[56])).toBe(false)
  })

  it('5: shouldReadV2ExecutorAllowance is false for production BSC config', () => {
    expect(
      shouldReadV2ExecutorAllowance({
        config: resolveV2ExecutorConfig(56),
        request: null,
        requestKey: null,
        shadow: null,
        user: USER,
        walletChainId: 56,
      }),
    ).toBe(false)
    expect(
      shouldReadV2ExecutorAllowance({
        config: V2_EXECUTION_RUNTIME_CONFIG[56],
        request: null,
        requestKey: null,
        shadow: null,
        user: USER,
        walletChainId: 56,
      }),
    ).toBe(false)
  })

  it('6/7: rollback row -> public CTA stays LEGACY; V2 submit is not reachable', async () => {
    const plan = buildV2UserExecutionPlan({
      user: USER,
      walletChainId: 56,
      request: null,
      requestKey: null,
      shadow: null,
      allowanceReadStatus: 'unread',
      nowIso: '2026-09-24T08:00:00.000Z',
      deadline: 1_893_456_000,
      executorConfigByChain: ROLLBACK_TABLE,
    })
    expect(plan.ok).toBe(false)
    expect(plan.reason).toBe(V2_PLAN_REASON.EXECUTOR_NOT_CONFIGURED)
    const decision = resolveSmartSwapCtaDecision({
      planOk: plan.ok,
      cutoverAllowed: isProductionCutoverAllowed(),
      testOnlyExecutionGate: V2_TEST_ONLY_CTA_EXECUTION_GATE,
      planReason: plan.reason,
    })
    expect(decision.publicAction).toBe(V2_PUBLIC_ACTION.LEGACY)
    let v2Called = 0
    const selected = selectSmartSwapCtaExecution({
      decision,
      plan,
      legacyCallback: async () => 'legacy-hash',
      consumeV2: async () => {
        v2Called += 1
        return 'v2-hash'
      },
    })
    expect(selected.kind).toBe(V2_PUBLIC_ACTION.LEGACY)
    expect(await selected.run?.()).toBe('legacy-hash')
    expect(v2Called).toBe(0)
  })

  it('8/9: canonical executor is allowed; team owner and treasury remain forbidden', () => {
    expect(forbiddenExecutorAddress(BSC_EXECUTOR)).toBe(false)
    expect(forbiddenExecutorAddress(TEAM_OPERATOR_REF)).toBe(true)
    expect(forbiddenExecutorAddress(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)).toBe(true)
  })

  it('10: cutover / modes / test gate remain locked', () => {
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(PRODUCTION_EXECUTION_MODE).toBe(SMARTSWAP_OPERATING_MODE.LEGACY_PRODUCTION)
    expect(UNIVERSAL_ENGINE_MODE).toBe(SMARTSWAP_OPERATING_MODE.SHADOW)
    expect(V2_TEST_ONLY_CTA_EXECUTION_GATE).toBe(false)
  })
})
