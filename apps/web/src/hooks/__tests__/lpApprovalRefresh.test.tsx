import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { CurrencyAmount, Token } from '@pancakeswap/sdk'
import { BigNumber } from '@ethersproject/bignumber'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { ApprovalState, useApproveCallback } from '../useApproveCallback'

vi.mock('@pancakeswap/localization', () => ({ useTranslation: () => ({ t: (s: string) => s }) }))
vi.mock('@pancakeswap/uikit', () => ({ useToast: () => ({ toastError: vi.fn() }) }))
vi.mock('wagmi', () => ({ useAccount: () => ({ address: owner }) }))
vi.mock('utils/sentry', () => ({ logError: vi.fn() }))
vi.mock('../useCallWithGasPrice', () => ({ useCallWithGasPrice: () => ({ callWithGasPrice: send }) }))
vi.mock('../useContract', () => ({
  useTokenContract: (...args: unknown[]) => {
    contractRequests.push(args)
    return contract
  },
}))
vi.mock('../../state/multicall/hooks', () => ({ useSingleCallResult: () => ({ result: [BigNumber.from(0)] }) }))
vi.mock('../../state/transactions/hooks', () => ({
  useHasPendingApproval: () => pending,
  useTransactionAdder: () => addTransaction,
}))
vi.mock('../../utils', () => ({ calculateGasMargin: (gas: unknown) => gas }))
vi.mock('../../utils/exchange', () => ({ computeSlippageAdjustedAmounts: vi.fn() }))

let owner = '0x0000000000000000000000000000000000000001'
let pending = false
let raw = '0'
let failRead = false
const contractRequests: unknown[][] = []
const contract = {
  allowance: vi.fn(async () => {
    if (failRead) throw new Error('RPC timeout')
    return BigNumber.from(raw)
  }),
  estimateGas: { approve: vi.fn(async () => BigNumber.from(50000)) },
}
const send = vi.fn(async (_contract: unknown, _method: string, _args: unknown[]) => ({ hash: '0xlocal-mock-approval' }))
const addTransaction = vi.fn(() => {
  pending = true
})
const options = {
  unknownAllowanceTimeoutMs: 5000,
  pendingAllowancePollMs: 2500,
  pendingApprovalTimeoutMs: 30000,
  directAllowancePollMs: 2500,
}
const flush = async () => {
  await act(async () => {
    await Promise.resolve()
  })
}
const tick = async (ms = 2500) => {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await Promise.resolve()
  })
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  pending = false
  raw = '0'
  failRead = false
  contractRequests.length = 0
  owner = '0x0000000000000000000000000000000000000001'
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

for (const chainId of [1, 56])
  describe(`LP approval refresh on chain ${chainId}`, () => {
    const lp = new Token(chainId, '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E', 18, 'LP')
    const amount = CurrencyAmount.fromRawAmount(lp, '100')
    const expectedRouter =
      chainId === 1 ? '0xFF8EBf8edf1C533A02d066f852788773BdCD631C' : '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3'
    const mount = () => renderHook(() => useApproveCallback(amount, ROUTER_ADDRESS[chainId], options))

    it('advances from approval to APPROVED despite frozen multicall zero and pending receipt', async () => {
      const { result, rerender } = mount()
      await flush()
      expect(result.current[0]).toBe(ApprovalState.NOT_APPROVED)
      await act(async () => {
        await result.current[1]()
      })
      rerender()
      expect(result.current[0]).toBe(ApprovalState.PENDING)
      expect(send.mock.calls[0][1]).toBe('approve')
      expect(send.mock.calls[0][2][0]).toBe(expectedRouter)
      expect(contractRequests.some(([address]) => address === lp.address)).toBe(true)
      expect(contract.allowance).toHaveBeenCalledWith(owner, ROUTER_ADDRESS[chainId])
      raw = '100'
      await tick()
      expect(result.current[0]).toBe(ApprovalState.APPROVED)
    })

    it('continues polling after the pending timeout and late confirmation', async () => {
      pending = true
      const { result } = mount()
      await flush()
      await tick(30000)
      expect(result.current[0]).toBe(ApprovalState.NOT_APPROVED)
      raw = '100'
      await tick()
      expect(result.current[0]).toBe(ApprovalState.APPROVED)
    })

    it('continues after receipt clears before allowance refresh', async () => {
      pending = true
      const { result, rerender } = mount()
      await flush()
      pending = false
      rerender()
      raw = '100'
      await tick()
      expect(result.current[0]).toBe(ApprovalState.APPROVED)
      raw = '0'
      await tick()
      expect(result.current[0]).toBe(ApprovalState.NOT_APPROVED)
    })

    it('never treats failed reads or an old owner snapshot as approval', async () => {
      raw = '100'
      const { result, rerender } = mount()
      await flush()
      expect(result.current[0]).toBe(ApprovalState.APPROVED)
      failRead = true
      owner = '0x0000000000000000000000000000000000000002'
      rerender()
      await flush()
      expect(result.current[0]).toBe(ApprovalState.UNKNOWN)
      await tick(5000)
      expect(result.current[0]).toBe(ApprovalState.NOT_APPROVED)
    })

    it('leaves default shared-hook cache precedence unchanged', async () => {
      raw = '100'
      const { result } = renderHook(() => useApproveCallback(amount, ROUTER_ADDRESS[chainId]))
      await flush()
      expect(result.current[0]).toBe(ApprovalState.NOT_APPROVED)
    })
  })
