import { ChainId } from '@pancakeswap/sdk'
import type { ExecutionAdapterType, ExecutionPlan, ResolvedExecutionAdapter } from './types'
import {
  createSmartRouterExecutionAdapter,
  createV2ExecutionAdapter,
  resolveRequiredAdapterType,
} from './adapters'

export class AdapterResolutionError extends Error {
  constructor(
    message: string,
    readonly chainId: number,
    readonly requiredAdapterType: ExecutionAdapterType,
  ) {
    super(message)
    this.name = 'AdapterResolutionError'
  }
}

/**
 * ExecutionPlan → AdapterResolver → ExecutionAdapter → Router
 * Wrapper never selects adapter type.
 */
export function resolveExecutionAdapter(plan: ExecutionPlan): ResolvedExecutionAdapter {
  if (plan.chainId === ChainId.BSC_TESTNET && plan.requiredAdapterType !== 'V2') {
    throw new AdapterResolutionError(
      'Chain 97 (SMART_ROUTER_TESTNET_FROZEN) requires V2ExecutionAdapter only',
      plan.chainId,
      plan.requiredAdapterType,
    )
  }

  if (plan.chainId === ChainId.BSC) {
    if (plan.requiredAdapterType === 'SMART_ROUTER') {
      return {
        adapter: createSmartRouterExecutionAdapter(plan.chainId),
        plan,
        resolutionSource: 'execution-plan',
      }
    }
    if (plan.requiredAdapterType === 'V2') {
      return {
        adapter: createV2ExecutionAdapter(plan.chainId),
        plan,
        resolutionSource: 'execution-plan',
      }
    }
  }

  if (plan.requiredAdapterType === 'V2') {
    return {
      adapter: createV2ExecutionAdapter(plan.chainId),
      plan,
      resolutionSource: 'execution-plan',
    }
  }

  throw new AdapterResolutionError(
    `No execution adapter registered for chain ${plan.chainId} type ${plan.requiredAdapterType}`,
    plan.chainId,
    plan.requiredAdapterType,
  )
}

export function resolveExecutionAdapterForSwap(input: {
  chainId: number
  preferSmartRouter: boolean
  inputIsNative: boolean
  path: string[]
}): ResolvedExecutionAdapter {
  const requiredAdapterType = resolveRequiredAdapterType({
    chainId: input.chainId,
    preferSmartRouter: input.preferSmartRouter,
  })

  const plan: ExecutionPlan = {
    schema: 'melega.execution-adapter.v1',
    chainId: input.chainId,
    requiredAdapterType,
    inputIsNative: input.inputIsNative,
    path: input.path,
  }

  return resolveExecutionAdapter(plan)
}
