/** R750 — constitutional execution adapter types. Execution only — no pricing/treasury/settlement. */

export const EXECUTION_ADAPTER_SCHEMA = 'melega.execution-adapter.v1' as const

export type ExecutionAdapterType = 'V2' | 'SMART_ROUTER'

export type RouterType = ExecutionAdapterType

export interface ExactInputExecutionRequest {
  amountIn: string
  amountOutMin: string
  path: string[]
  recipient: string
  deadline: number
  inputIsNative: boolean
}

export interface ExecutionQuoteRequest {
  amountIn: string
  path: string[]
  inputIsNative: boolean
}

export interface ExecutionQuoteResult {
  ok: boolean
  amountOut?: string
  note?: string
}

/** ExecutionPlan decides required adapter — Wrapper never decides. */
export interface ExecutionPlan {
  schema: typeof EXECUTION_ADAPTER_SCHEMA
  chainId: number
  requiredAdapterType: ExecutionAdapterType
  inputIsNative: boolean
  path: string[]
}

export interface IExecutionAdapter {
  routerType(): RouterType
  routerAddress(): string
  supports(tokenIn: string, tokenOut: string, exactInput: boolean): boolean
  quote(request: ExecutionQuoteRequest): ExecutionQuoteResult
  executeExactInput(request: ExactInputExecutionRequest): { calldataTarget: string; method: string }
  executeNativeInput(request: ExactInputExecutionRequest): { calldataTarget: string; method: string; value: string }
}

export interface ResolvedExecutionAdapter {
  adapter: IExecutionAdapter
  plan: ExecutionPlan
  resolutionSource: 'execution-plan'
}
