import { ChainId } from '@pancakeswap/sdk'
import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import type {
  ExecutionAdapterType,
  ExecutionPlan,
  ExecutionQuoteRequest,
  ExecutionQuoteResult,
  ExactInputExecutionRequest,
  IExecutionAdapter,
  RouterType,
} from './types'
import { EXECUTION_ADAPTER_SCHEMA } from './types'

const BSC_SMART_ROUTER = '0xC6665d98Efd81f47B03801187eB46cbC63F328B0'

const V2_ROUTER_BY_CHAIN: Partial<Record<number, string>> = {
  [ChainId.BSC]: ROUTER_ADDRESS[ChainId.BSC],
  [ChainId.BSC_TESTNET]: BSC_TESTNET_ADDRESSES.router,
}

const SMART_ROUTER_BY_CHAIN: Partial<Record<number, string>> = {
  [ChainId.BSC]: BSC_SMART_ROUTER,
}

function normalizeAddress(address: string): string {
  return address.toLowerCase()
}

export class V2ExecutionAdapter implements IExecutionAdapter {
  constructor(private readonly chainId: number) {}

  routerType(): RouterType {
    return 'V2'
  }

  routerAddress(): string {
    const address = V2_ROUTER_BY_CHAIN[this.chainId]
    if (!address) throw new Error(`V2ExecutionAdapter: chain ${this.chainId} unsupported`)
    return address
  }

  supports(_tokenIn: string, _tokenOut: string, exactInput: boolean): boolean {
    return exactInput && Boolean(V2_ROUTER_BY_CHAIN[this.chainId])
  }

  quote(request: ExecutionQuoteRequest): ExecutionQuoteResult {
    if (!this.supports(request.path[0] ?? '', request.path[request.path.length - 1] ?? '', true)) {
      return { ok: false, note: 'V2 adapter does not support this quote request' }
    }
    return {
      ok: true,
      note: 'V2 quotes resolved off-chain via router getAmountsOut at execution time',
    }
  }

  executeExactInput(request: ExactInputExecutionRequest) {
    request.inputIsNative
    return {
      calldataTarget: this.routerAddress(),
      method: 'swapExactTokensForTokens',
    }
  }

  executeNativeInput(request: ExactInputExecutionRequest) {
    request.inputIsNative
    return {
      calldataTarget: this.routerAddress(),
      method: 'swapExactETHForTokens',
      value: request.amountIn,
    }
  }
}

export class SmartRouterExecutionAdapter implements IExecutionAdapter {
  constructor(private readonly chainId: number) {}

  routerType(): RouterType {
    return 'SMART_ROUTER'
  }

  routerAddress(): string {
    const address = SMART_ROUTER_BY_CHAIN[this.chainId]
    if (!address) throw new Error(`SmartRouterExecutionAdapter: chain ${this.chainId} unsupported`)
    return address
  }

  supports(_tokenIn: string, _tokenOut: string, exactInput: boolean): boolean {
    return exactInput && Boolean(SMART_ROUTER_BY_CHAIN[this.chainId])
  }

  quote(_request: ExecutionQuoteRequest): ExecutionQuoteResult {
    return {
      ok: false,
      note: 'Smart Router quotes require off-chain route discovery — adapter performs execution only',
    }
  }

  executeExactInput(_request: ExactInputExecutionRequest) {
    return {
      calldataTarget: this.routerAddress(),
      method: 'swap',
    }
  }

  executeNativeInput(_request: ExactInputExecutionRequest) {
    return {
      calldataTarget: this.routerAddress(),
      method: 'swap',
      value: _request.amountIn,
    }
  }
}

export function createV2ExecutionAdapter(chainId: number): V2ExecutionAdapter {
  return new V2ExecutionAdapter(chainId)
}

export function createSmartRouterExecutionAdapter(chainId: number): SmartRouterExecutionAdapter {
  return new SmartRouterExecutionAdapter(chainId)
}

export function getV2RouterAddress(chainId: number): string | null {
  return V2_ROUTER_BY_CHAIN[chainId] ?? null
}

export function getSmartRouterAddress(chainId: number): string | null {
  return SMART_ROUTER_BY_CHAIN[chainId] ?? null
}

export function buildExecutionPlan(input: {
  chainId: number
  requiredAdapterType: ExecutionAdapterType
  inputIsNative: boolean
  path: string[]
}): ExecutionPlan {
  return {
    schema: EXECUTION_ADAPTER_SCHEMA,
    chainId: input.chainId,
    requiredAdapterType: input.requiredAdapterType,
    inputIsNative: input.inputIsNative,
    path: input.path.map(normalizeAddress),
  }
}

export function resolveRequiredAdapterType(input: {
  chainId: number
  preferSmartRouter: boolean
}): ExecutionAdapterType {
  if (input.chainId === ChainId.BSC_TESTNET) {
    return 'V2'
  }
  if (input.chainId === ChainId.BSC) {
    return input.preferSmartRouter ? 'SMART_ROUTER' : 'V2'
  }
  return 'V2'
}
