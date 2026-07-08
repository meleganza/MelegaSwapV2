import { WRAPPER_SPEC_VERSION } from '../wrapper/spec'
import { getSmartRouterRegistryVersion } from '../registry/smartRouterRegistry'
import { MELEGA_SMART_ROUTER_PHASE } from '../types'
import type { MelegaSmartRouterSwapPlan } from '../types'
import { resolvePricingPolicy, resolveTreasuryPolicy } from '../policy-engine'
import {
  EXECUTION_MANIFEST_SCHEMA,
  MELEGA_SMART_ROUTER_ADAPTER_VERSION,
  type ExecutionManifest,
} from './types'
import { buildExecutionId, computeReceiptHash } from './receiptHash'

function buildMachineReadable(manifest: Omit<ExecutionManifest, 'machineReadable' | 'receiptHash' | 'executionId'>): Record<string, unknown> {
  const { schema, executionTimestamp, chainId, inputToken, outputToken, grossAmount, protocolFee, status } = manifest
  return { schema, executionTimestamp, chainId, inputToken, outputToken, grossAmount, protocolFee, status }
}

/** Build immutable execution manifest from a successful swap plan — manifest only, no calculations. */
export function buildExecutionManifestFromPlan(
  plan: Omit<MelegaSmartRouterSwapPlan, 'executionManifest'>,
  timestamp = new Date().toISOString(),
): ExecutionManifest {
  const pricing = resolvePricingPolicy()
  const treasury = resolveTreasuryPolicy()
  const registryVersion = getSmartRouterRegistryVersion()

  const core = {
    schema: EXECUTION_MANIFEST_SCHEMA,
    executionTimestamp: timestamp,
    chainId: plan.chainId,
    executionLayer: 'ADAPTER' as const,
    executionRouter: plan.underlyingRouter,
    smartRouterPhase: { ...MELEGA_SMART_ROUTER_PHASE },
    wrapperVersion: WRAPPER_SPEC_VERSION,
    adapterVersion: MELEGA_SMART_ROUTER_ADAPTER_VERSION,
    pricingPolicy: pricing.policyRef,
    policyVersion: pricing.version,
    inputToken: plan.inputToken,
    outputToken: plan.outputToken,
    grossAmount: plan.grossAmountIn,
    netAmount: plan.netAmountIn,
    protocolFee: plan.feeAmount,
    lpFee: 'separate-from-protocol-fee',
    treasuryCollector: plan.treasuryCollector,
    treasuryPolicy: treasury.policyRef,
    buyMarcoApplied: plan.buyMarcoIncentiveApplied,
    registryVersion,
    status: 'prepared' as const,
    validationState: 'valid' as const,
  }

  const receiptHash = computeReceiptHash(buildMachineReadable(core as ExecutionManifest))
  const executionId = buildExecutionId(plan.chainId, receiptHash, timestamp)

  return {
    ...core,
    executionId,
    receiptHash,
    machineReadable: buildMachineReadable({ ...core, executionId } as ExecutionManifest),
  }
}

/** Build execution manifest for a blocked execution — explains why routing failed. */
export function buildExecutionManifestFromBlocked(
  blocked: { chainId: number; code: string; message: string },
  input?: { inputToken?: string; outputToken?: string; grossAmount?: string },
  timestamp = new Date().toISOString(),
): ExecutionManifest {
  const pricing = resolvePricingPolicy()
  const treasury = resolveTreasuryPolicy()
  const registryVersion = getSmartRouterRegistryVersion()

  const core = {
    schema: EXECUTION_MANIFEST_SCHEMA,
    executionTimestamp: timestamp,
    chainId: blocked.chainId,
    executionLayer: 'ADAPTER' as const,
    executionRouter: '—',
    smartRouterPhase: { ...MELEGA_SMART_ROUTER_PHASE },
    wrapperVersion: WRAPPER_SPEC_VERSION,
    adapterVersion: MELEGA_SMART_ROUTER_ADAPTER_VERSION,
    pricingPolicy: pricing.policyRef,
    policyVersion: pricing.version,
    inputToken: input?.inputToken ?? '—',
    outputToken: input?.outputToken ?? '—',
    grossAmount: input?.grossAmount ?? '—',
    netAmount: '—',
    protocolFee: '—',
    lpFee: 'separate-from-protocol-fee',
    treasuryCollector: '—',
    treasuryPolicy: treasury.policyRef,
    buyMarcoApplied: false,
    registryVersion,
    status: 'blocked' as const,
    validationState: 'blocked' as const,
    blockCode: blocked.code,
    blockMessage: blocked.message,
  }

  const receiptHash = computeReceiptHash(buildMachineReadable(core as ExecutionManifest))
  const executionId = buildExecutionId(blocked.chainId, receiptHash, timestamp)

  return {
    ...core,
    executionId,
    receiptHash,
    machineReadable: buildMachineReadable({ ...core, executionId } as ExecutionManifest),
  }
}
