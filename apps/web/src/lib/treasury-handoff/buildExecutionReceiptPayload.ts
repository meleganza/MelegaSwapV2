import { getBlockExploreLink } from 'utils'
import { assertPayloadDoesNotOwnSettlement } from './ownership'
import type { ExecutionReceiptPayload, SwapHandoffContext } from './types'

export function buildExecutionReceiptPayload(input: {
  chainId: number
  transactionHash: string
  wallet: string
  receiptStatus: number | undefined
  confirmedTime: number
  context: SwapHandoffContext
}): ExecutionReceiptPayload {
  const status = input.receiptStatus === 1 ? 'confirmed' : 'failed'

  const payload: ExecutionReceiptPayload = {
    schema: 'melega.dex-execution-receipt.v1',
    transactionHash: input.transactionHash,
    wallet: input.wallet,
    chain: input.chainId,
    timestamp: new Date(input.confirmedTime).toISOString(),
    status,
    asset: input.context.asset,
    amount: input.context.amount,
    fee: input.context.fee,
    operation: 'swap',
    explorerUrl: getBlockExploreLink(input.transactionHash, 'transaction', input.chainId),
    originModule: 'trade',
    ...(input.context.originProject ? { originProject: input.context.originProject } : {}),
  }

  assertPayloadDoesNotOwnSettlement(payload as unknown as Record<string, unknown>)
  return payload
}
