/**
 * P0 — Add Liquidity approval lifecycle stuck on "Confirming".
 *
 * Real useApproveCallback + real resolveLiquidityAddCta. Only the chain/transport edges are mocked:
 * multicall (can be frozen), direct wallet-transport allowance reads, the local pending-approval
 * record and the wallet send. No network, no wallet, no transaction.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { act, cleanup, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { BigNumber } from '@ethersproject/bignumber'
import { MaxUint256 } from '@ethersproject/constants'
import { Currency, CurrencyAmount, Native, Token } from '@pancakeswap/sdk'
import { ROUTER_ADDRESS } from 'config/constants/exchange'
import { ApprovalState, ApproveCallbackOptions, useApproveCallback } from 'hooks/useApproveCallback'
import { mapApprovalState, resolveLiquidityAddCta } from '../../modules/liquidityAddCta'
import { ADD_LIQUIDITY_APPROVAL_OPTIONS } from '../addLiquidityApprovalOptions'

type TokenChain = {
  multicall: string // frozen / cached allowance seen by the Redux multicall listener
  direct: string // authoritative on-chain allowance read through the wallet transport
  pending: boolean // local "approve" transaction record without a finalized receipt
}

const OWNER = '0x0000000000000000000000000000000000000001'
const chain: Record<string, TokenChain> = {}
let signerChainId = 56
let rejectNextApproval = false
const sends: { token: string; spender: string; amount: string }[] = []
const addTransaction = vi.fn((_response: unknown, info: { approval: { tokenAddress: string } }) => {
  chain[info.approval.tokenAddress].pending = true
})

const contracts: Record<string, any> = {}
function contractFor(address: string) {
  if (!contracts[address]) {
    contracts[address] = {
      address,
      signer: { getChainId: async () => signerChainId },
      allowance: vi.fn(async () => BigNumber.from(chain[address]?.direct ?? '0')),
      estimateGas: { approve: vi.fn(async () => BigNumber.from(50_000)) },
    }
  }
  return contracts[address]
}

vi.mock('@pancakeswap/localization', () => ({ useTranslation: () => ({ t: (s: string) => s }) }))
vi.mock('@pancakeswap/uikit', () => ({ useToast: () => ({ toastError: vi.fn() }) }))
vi.mock('wagmi', () => ({ useAccount: () => ({ address: OWNER }) }))
vi.mock('utils/sentry', () => ({ logError: vi.fn() }))
vi.mock('hooks/useCallWithGasPrice', () => ({
  useCallWithGasPrice: () => ({
    callWithGasPrice: vi.fn(async (contract: { address: string }, method: string, args: unknown[]) => {
      if (method !== 'approve') throw new Error(`unexpected ${method}`)
      if (rejectNextApproval) {
        rejectNextApproval = false
        throw Object.assign(new Error('User rejected the request.'), { code: 4001 })
      }
      sends.push({ token: contract.address, spender: String(args[0]), amount: String(args[1]) })
      return { hash: `0xapprove${sends.length}` }
    }),
  }),
}))
vi.mock('hooks/useContract', () => ({ useTokenContract: (address?: string) => (address ? contractFor(address) : null) }))
vi.mock('state/multicall/hooks', () => ({
  useSingleCallResult: (contract: { address: string } | null) => ({
    result: contract ? [BigNumber.from(chain[contract.address]?.multicall ?? '0')] : undefined,
  }),
}))
vi.mock('state/transactions/hooks', () => ({
  useHasPendingApproval: (token?: string) => Boolean(token && chain[token]?.pending),
  useTransactionAdder: () => addTransaction,
}))
vi.mock('utils', () => ({ calculateGasMargin: (gas: unknown) => gas }))
vi.mock('utils/exchange', () => ({ computeSlippageAdjustedAmounts: vi.fn() }))

const flush = async () => {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}
const tick = async (ms = 2_500) => {
  await act(async () => {
    vi.advanceTimersByTime(ms)
    await Promise.resolve()
    await Promise.resolve()
  })
}

/**
 * Harness = the Add Liquidity approval section of useLiquidityMintRuntime: approvalA / approvalB
 * (same hook, same router spender, same options) + the module CTA resolver + the runtime's
 * add-branch primary action order (source-asserted below). The add submit is a counter.
 */
function useAddLiquidityHarness(
  amountA: CurrencyAmount<Currency> | undefined,
  amountB: CurrencyAmount<Currency> | undefined,
  spender: string,
  options: ApproveCallbackOptions | undefined,
  onOpenAddModal: () => void,
) {
  const [approvalA, approveACallback] = useApproveCallback(amountA, spender, options)
  const [approvalB, approveBCallback] = useApproveCallback(amountB, spender, options)
  const cta = resolveLiquidityAddCta({
    account: OWNER,
    approvalA: mapApprovalState(approvalA),
    approvalB: mapApprovalState(approvalB),
  })
  const onPrimaryAction = () => {
    if (cta.disabled) return undefined // LiquidityAddModule.handlePrimary: disabled CTA never acts
    if (approvalA === ApprovalState.NOT_APPROVED && amountA) return approveACallback()
    if (approvalB === ApprovalState.NOT_APPROVED && amountB) return approveBCallback()
    onOpenAddModal()
    return undefined
  }
  return { approvalA, approvalB, cta, onPrimaryAction }
}

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  sends.length = 0
  rejectNextApproval = false
  for (const key of Object.keys(chain)) delete chain[key]
  for (const key of Object.keys(contracts)) delete contracts[key]
})
afterEach(() => {
  cleanup()
  vi.useRealTimers()
})

for (const chainId of [56, 1])
  describe(`Add Liquidity approval lifecycle on chain ${chainId}`, () => {
    const router = ROUTER_ADDRESS[chainId]
    const tokenA = new Token(chainId, '0x963556de0eb8138E97A85F0A86eE0acD159D210b', 18, 'MARCO')
    const tokenB = new Token(chainId, '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', 18, 'WTKN')
    const amountA = CurrencyAmount.fromRawAmount(tokenA, '1000')
    const amountB = CurrencyAmount.fromRawAmount(tokenB, '100')
    let addModalOpens = 0
    let addSubmits = 0
    const openAddModal = () => {
      addModalOpens += 1
    }
    const confirmAdd = () => {
      addSubmits += 1
    }

    const setup = (
      state: { a: Partial<TokenChain>; b: Partial<TokenChain> },
      // 'MAIN_NO_OPTIONS' = the pre-fix call shape useApproveCallback(amount, router) (explicit undefined
      // would silently pick up this default parameter).
      config: ApproveCallbackOptions | 'MAIN_NO_OPTIONS' = ADD_LIQUIDITY_APPROVAL_OPTIONS,
      a: CurrencyAmount<Currency> | undefined = amountA,
    ) => {
      signerChainId = chainId
      addModalOpens = 0
      addSubmits = 0
      chain[tokenA.address] = { multicall: '0', direct: '0', pending: false, ...state.a }
      chain[tokenB.address] = { multicall: '0', direct: '0', pending: false, ...state.b }
      const options = config === 'MAIN_NO_OPTIONS' ? undefined : config
      return renderHook(() => useAddLiquidityHarness(a, amountB, router, options, openAddModal))
    }

    const mineApproval = (token: Token, raw: string) => {
      // On-chain allowance updated; the multicall cache stays frozen at its old value.
      chain[token.address].direct = raw
    }

    it('1+2+11+12: two ERC20 — Approve A → Confirming → A APPROVED (direct) → Approve B → Add Liquidity → review → one submit', async () => {
      const { result, rerender } = setup({ a: {}, b: {} })
      await flush()
      expect(result.current.cta.label).toBe('Approve Token A')

      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      expect(sends).toHaveLength(1)
      expect(sends[0]).toMatchObject({ token: tokenA.address, spender: router })
      expect(result.current.approvalA).toBe(ApprovalState.PENDING)
      expect(result.current.cta.label).toBe('Confirming')
      expect(result.current.cta.disabled).toBe(true)

      mineApproval(tokenA, MaxUint256.toString())
      await tick()
      expect(result.current.approvalA).toBe(ApprovalState.APPROVED)
      expect(result.current.cta.label).toBe('Approve Token B')
      expect(sends).toHaveLength(1) // never auto-submits B

      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      expect(sends).toHaveLength(2)
      expect(sends[1]).toMatchObject({ token: tokenB.address, spender: router })
      expect(result.current.cta.label).toBe('Confirming')

      mineApproval(tokenB, MaxUint256.toString())
      await tick()
      expect(result.current.approvalB).toBe(ApprovalState.APPROVED)
      expect(result.current.cta.label).toBe('Add Liquidity')
      expect(addModalOpens).toBe(0)

      await act(async () => {
        await result.current.onPrimaryAction()
      })
      expect(addModalOpens).toBe(1)
      confirmAdd()
      expect(addSubmits).toBe(1)
      expect(sends).toHaveLength(2)
    })

    it('3: stale multicall 0 + direct allowance sufficient → APPROVED, never permanent Confirming', async () => {
      const { result } = setup({ a: { multicall: '0', direct: '1000', pending: true }, b: { direct: '100' } })
      await flush()
      await tick()
      expect(result.current.approvalA).toBe(ApprovalState.APPROVED)
      expect(result.current.approvalB).toBe(ApprovalState.APPROVED)
      expect(result.current.cta.label).toBe('Add Liquidity')
    })

    it('4: stale local pending record (receipt never finalized) + live allowance sufficient → APPROVED wins', async () => {
      const { result, rerender } = setup({ a: { pending: true }, b: {} })
      await flush()
      expect(result.current.cta.label).toBe('Confirming')
      mineApproval(tokenA, '1000')
      await tick()
      rerender()
      expect(chain[tokenA.address].pending).toBe(true)
      expect(result.current.approvalA).toBe(ApprovalState.APPROVED)
      expect(result.current.cta.label).toBe('Approve Token B')
    })

    it('5: approval rejected in wallet → no pending record, actionable Approve Token A, no liquidity tx', async () => {
      const { result, rerender } = setup({ a: {}, b: {} })
      await flush()
      rejectNextApproval = true
      await act(async () => {
        await expect(result.current.onPrimaryAction()).rejects.toMatchObject({ code: 4001 })
      })
      rerender()
      expect(result.current.approvalA).toBe(ApprovalState.NOT_APPROVED)
      expect(result.current.cta).toMatchObject({ label: 'Approve Token A', disabled: false })
      expect(addModalOpens).toBe(0)
      expect(addSubmits).toBe(0)
    })

    it('6: pending timeout without allowance → recoverable Approve Token A (bounded 30 s)', async () => {
      const { result } = setup({ a: { pending: true }, b: {} })
      await flush()
      expect(result.current.cta.label).toBe('Confirming')
      await tick(29_000)
      expect(result.current.cta.label).toBe('Confirming')
      await tick(1_500)
      expect(result.current.approvalA).toBe(ApprovalState.NOT_APPROVED)
      expect(result.current.cta).toMatchObject({ label: 'Approve Token A', disabled: false })
      // Late confirmation after the timeout is still picked up by the persistent direct read.
      mineApproval(tokenA, '1000')
      await tick()
      expect(result.current.cta.label).toBe('Approve Token B')
    })

    it('CASE 6: approval mined but allowance insufficient → does not advance, back to Approve Token A', async () => {
      const { result, rerender } = setup({ a: { pending: true }, b: {} })
      await flush()
      chain[tokenA.address].pending = false // receipt finalized (status 1)
      mineApproval(tokenA, '999') // but allowance < required 1000
      rerender()
      await tick()
      expect(result.current.approvalA).toBe(ApprovalState.NOT_APPROVED)
      expect(result.current.cta.label).toBe('Approve Token A')
    })

    it('7 / CASE 3: both allowances already sufficient → Add Liquidity immediately, no approval tx', async () => {
      const { result } = setup({ a: { multicall: '1000', direct: '1000' }, b: { multicall: '100', direct: '100' } })
      await flush()
      expect(result.current.cta.label).toBe('Add Liquidity')
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      expect(sends).toHaveLength(0)
      expect(addModalOpens).toBe(1)
    })

    it('CASE 2: A already approved, B needs approval → Approve Token B directly (no redundant A approval)', async () => {
      const { result } = setup({ a: { direct: '1000' }, b: {} })
      await flush()
      await tick()
      expect(result.current.cta.label).toBe('Approve Token B')
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      expect(sends).toHaveLength(1)
      expect(sends[0].token).toBe(tokenB.address)
    })

    it('8 / CASE 4: native + ERC20 → native APPROVED by hook semantics, only the ERC20 approval', async () => {
      const native = CurrencyAmount.fromRawAmount(Native.onChain(chainId), '1000')
      const { result, rerender } = setup({ a: {}, b: {} }, ADD_LIQUIDITY_APPROVAL_OPTIONS, native)
      await flush()
      expect(result.current.approvalA).toBe(ApprovalState.APPROVED)
      expect(result.current.cta.label).toBe('Approve Token B')
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      expect(sends).toHaveLength(1)
      expect(sends[0].token).toBe(tokenB.address)
      mineApproval(tokenB, '100')
      await tick()
      expect(result.current.cta.label).toBe('Add Liquidity')
    })

    it('9+10: no duplicate approval while Confirming; no add before both allowances are sufficient', async () => {
      const { result, rerender } = setup({ a: {}, b: {} })
      await flush()
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      for (let i = 0; i < 3; i += 1) {
        await act(async () => {
          await result.current.onPrimaryAction()
        })
      }
      expect(sends).toHaveLength(1)
      expect(addModalOpens).toBe(0)
      mineApproval(tokenA, '1000')
      await tick()
      expect(result.current.cta.label).toBe('Approve Token B')
      expect(addModalOpens).toBe(0)
      expect(addSubmits).toBe(0)
    })

    it('REPRODUCTION (main config, no options): approval mined, receipt never finalized, multicall frozen → Confirming forever', async () => {
      const { result, rerender } = setup({ a: {}, b: {} }, 'MAIN_NO_OPTIONS')
      await flush()
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      mineApproval(tokenA, MaxUint256.toString())
      await tick(120_000)
      expect(result.current.approvalA).toBe(ApprovalState.PENDING)
      expect(result.current.cta).toMatchObject({ label: 'Confirming', disabled: true })
    })

    it('REPRODUCTION (main config): receipt finalized but multicall frozen → loops back to Approve Token A, never Approve Token B', async () => {
      const { result, rerender } = setup({ a: {}, b: {} }, 'MAIN_NO_OPTIONS')
      await flush()
      await act(async () => {
        await result.current.onPrimaryAction()
      })
      rerender()
      mineApproval(tokenA, MaxUint256.toString())
      chain[tokenA.address].pending = false
      rerender()
      await tick(120_000)
      expect(result.current.approvalA).toBe(ApprovalState.NOT_APPROVED)
      expect(result.current.cta.label).toBe('Approve Token A')
    })
  })

describe('Add Liquidity runtime wiring', () => {
  const runtime = readFileSync(path.resolve(__dirname, '../useLiquidityMintRuntime.tsx'), 'utf8')

  it('approvalA and approvalB use the bounded direct-allowance options with the canonical router spender', () => {
    expect(runtime).toMatch(
      /const \[approvalA, approveACallback\] = useApproveCallback\(\s*parsedAmounts\[Field\.CURRENCY_A\],\s*chainId \? ROUTER_ADDRESS\[chainId\] : undefined,\s*ADD_LIQUIDITY_APPROVAL_OPTIONS,\s*\)/,
    )
    expect(runtime).toMatch(
      /const \[approvalB, approveBCallback\] = useApproveCallback\(\s*parsedAmounts\[Field\.CURRENCY_B\],\s*chainId \? ROUTER_ADDRESS\[chainId\] : undefined,\s*ADD_LIQUIDITY_APPROVAL_OPTIONS,\s*\)/,
    )
  })

  it('reuses the proven #85 LP-approval values (no new approval framework)', () => {
    expect(ADD_LIQUIDITY_APPROVAL_OPTIONS).toEqual({
      unknownAllowanceTimeoutMs: 5_000,
      pendingAllowancePollMs: 2_500,
      directAllowancePollMs: 2_500,
      pendingApprovalTimeoutMs: 30_000,
    })
    expect(runtime).toMatch(/pendingApprovalTimeoutMs: 30_000,/)
  })

  it('primary action order is unchanged: approve A, else approve B, else open the add review (user confirms each tx)', () => {
    const add = runtime.slice(runtime.indexOf('if (approvalA === ApprovalState.NOT_APPROVED && parsedAmounts[Field.CURRENCY_A])'))
    expect(add.indexOf('approveACallback()')).toBeLessThan(add.indexOf('approveBCallback()'))
    expect(add.indexOf('approveBCallback()')).toBeLessThan(add.indexOf('openAddModal()'))
    expect(add.slice(0, add.indexOf('openAddModal()'))).toMatch(/approveACallback\(\)\s*return/)
    expect(add.slice(0, add.indexOf('openAddModal()'))).toMatch(/approveBCallback\(\)\s*return/)
  })
})
