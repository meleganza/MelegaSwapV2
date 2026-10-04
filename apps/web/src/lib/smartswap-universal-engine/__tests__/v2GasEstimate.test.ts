import { describe, expect, it, vi } from 'vitest'
import { estimatePreparedV2Gas, V2_GAS_ESTIMATE_STATE } from '../v2GasEstimate'
import type { V2UserTransactionPreparation } from '../v2ExecutionBinding'

const tx = (to: string) => ({
  from: '0x1111111111111111111111111111111111111111',
  to,
  chainId: 56,
  data: '0x1234',
  value: '0x0',
})

const preparation = (approvals = 0): V2UserTransactionPreparation => ({
  approvalTransactions: Array.from({ length: approvals }, (_, i) => tx(`0x${String(i + 2).padStart(40, '0')}`)),
  swapTransaction: tx('0x9999999999999999999999999999999999999999'),
  requiresRefreshBeforeSwap: approvals > 0,
  requiresOnChainPreflight: true,
  productionExecutionCapable: false,
})

describe('factual V2 gas estimation', () => {
  it('estimates the exact prepared swap when no approval is required', async () => {
    const estimateGas = vi.fn(async () => ({ toString: () => '184321' }))
    await expect(estimatePreparedV2Gas({ estimateGas }, preparation())).resolves.toEqual({
      state: V2_GAS_ESTIMATE_STATE.SWAP,
      gasUnits: 184321,
    })
    expect(estimateGas).toHaveBeenCalledWith({
      from: preparation().swapTransaction.from,
      to: preparation().swapTransaction.to,
      data: preparation().swapTransaction.data,
      value: preparation().swapTransaction.value,
    })
  })

  it('reports approval gas separately and does not pretend the blocked swap is estimable', async () => {
    const estimateGas = vi.fn(async () => ({ toString: () => '50000' }))
    await expect(estimatePreparedV2Gas({ estimateGas }, preparation(2))).resolves.toEqual({
      state: V2_GAS_ESTIMATE_STATE.APPROVAL_REQUIRED,
      gasUnits: 100000,
    })
    expect(estimateGas).toHaveBeenCalledTimes(2)
  })

  it('stays honest when RPC estimation fails', async () => {
    const estimateGas = vi.fn(async () => { throw new Error('execution reverted') })
    await expect(estimatePreparedV2Gas({ estimateGas }, preparation())).resolves.toEqual({
      state: V2_GAS_ESTIMATE_STATE.UNAVAILABLE,
      gasUnits: null,
    })
  })
})
