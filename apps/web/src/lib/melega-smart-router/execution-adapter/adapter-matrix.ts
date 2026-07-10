import { ChainId } from '@pancakeswap/sdk'
import type { ExecutionAdapterType } from './types'

export interface AdapterMatrixRow {
  chainId: number
  chainName: string
  supportedAdapters: ExecutionAdapterType[]
  defaultAdapter: ExecutionAdapterType
  frozen: boolean
  note: string
}

/** Constitutional adapter matrix — execution only. */
export const EXECUTION_ADAPTER_MATRIX: AdapterMatrixRow[] = [
  {
    chainId: ChainId.BSC_TESTNET,
    chainName: 'BNB Testnet',
    supportedAdapters: ['V2'],
    defaultAdapter: 'V2',
    frozen: true,
    note: 'SMART_ROUTER_TESTNET_FROZEN — Wrapper V2 validated against V2 router; Smart Router adapter blocked',
  },
  {
    chainId: ChainId.BSC,
    chainName: 'BNB Chain',
    supportedAdapters: ['V2', 'SMART_ROUTER'],
    defaultAdapter: 'SMART_ROUTER',
    frozen: false,
    note: 'Production uses dual engines — ExecutionPlan selects V2 or Smart Router adapter',
  },
]

export interface CompatibilityMatrixRow {
  component: string
  chain97: string
  chain56: string
}

export const EXECUTION_ADAPTER_COMPATIBILITY: CompatibilityMatrixRow[] = [
  {
    component: 'Frozen Wrapper V2 bytecode',
    chain97: 'COMPATIBLE — underlyingRouter is V2 (IUnderlyingSwapRouter)',
    chain56: 'BLOCKED — not deployed',
  },
  {
    component: 'V2ExecutionAdapter',
    chain97: 'REQUIRED',
    chain56: 'SUPPORTED — fallback path (ROUTER_ADDRESS)',
  },
  {
    component: 'SmartRouterExecutionAdapter',
    chain97: 'BLOCKED',
    chain56: 'SUPPORTED — smart swap path (0xC6665d98…)',
  },
  {
    component: 'IUnderlyingSwapRouter bridge',
    chain97: 'V2ExecutionAdapter implements for future adapter deploy',
    chain56: 'Required for frozen Wrapper + Smart path resolution',
  },
  {
    component: 'Pricing / Treasury / Settlement',
    chain97: 'OUT OF SCOPE — unchanged in Wrapper',
    chain56: 'OUT OF SCOPE — unchanged in Wrapper',
  },
]

export function getAdapterMatrixForChain(chainId: number): AdapterMatrixRow | undefined {
  return EXECUTION_ADAPTER_MATRIX.find((row) => row.chainId === chainId)
}
