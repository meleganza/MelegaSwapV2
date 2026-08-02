import { describe, expect, it, vi } from 'vitest'
import {
  buildCreateProgramArgs,
  canSubmitFounderWalletActivate,
  LB_CANARY,
  LB_SUCCESS_FEE_BPS,
  parseBudgetWei,
  resolveCanaryOrientation,
  runFounderActivateFlow,
  type FounderActivateWallet,
} from '../founderActivateFlow'

function mockWallet(overrides: Partial<FounderActivateWallet> = {}): FounderActivateWallet {
  const program = '0xA15aDa28A9b7d4d9f6Ac781407bAf1A2CFB802EB'
  const okReceipt = { status: 1, logs: [] as any[] }
  const base: FounderActivateWallet = {
    createProgram: vi.fn(async () => ({
      hash: '0xcreate',
      wait: async () => okReceipt,
    })),
    approve: vi.fn(async () => ({
      hash: '0xapprove',
      wait: async () => okReceipt,
    })),
    depositBudget: vi.fn(async () => ({
      hash: '0xdeposit',
      wait: async () => okReceipt,
    })),
    activate: vi.fn(async () => ({
      hash: '0xactivate',
      wait: async () => okReceipt,
    })),
    readAllowance: vi.fn(async () => '0'),
    parseProgramCreated: vi.fn(() => ({
      program,
      programId: '0xpid',
    })),
  }
  return { ...base, ...overrides }
}

describe('founderActivateFlow', () => {
  it('builds createProgram args for canonical MARCO / WBNB', () => {
    const args = buildCreateProgramArgs({
      projectToken: LB_CANARY.marco,
      quoteAsset: LB_CANARY.wbnb,
      pair: LB_CANARY.marcoWbnbPair,
      strategyMode: 'FULL_AI',
      epochDurationSeconds: 300,
    })
    expect('error' in args).toBe(false)
    if ('error' in args) return
    expect(args.projectToken).toBe(LB_CANARY.marco)
    expect(args.quoteAsset).toBe(LB_CANARY.wbnb)
    expect(args.strategy.mode).toBe(0)
    expect(args.epochDurationSeconds).toBe(300)
  })

  it('rejects WBNB project + USDT quote; accepts MARCO / WBNB', () => {
    const bad = resolveCanaryOrientation({
      projectToken: LB_CANARY.wbnb,
      quoteAsset: LB_CANARY.usdt,
      quoteEnabled: false,
    })
    expect(bad.ok).toBe(false)

    const good = resolveCanaryOrientation({
      projectToken: LB_CANARY.marco,
      quoteAsset: LB_CANARY.wbnb,
      quoteEnabled: true,
    })
    expect(good.ok).toBe(true)
  })

  it('parses Token Reserve wei at 18 decimals', () => {
    expect(parseBudgetWei(LB_CANARY.tokenReserveHuman, 18)).toBe('1000000000000000000')
    expect(parseBudgetWei('0.01', 18)).toBe('10000000000000000')
  })

  it('runs createProgram → approve → deposit → activate sequence', async () => {
    const wallet = mockWallet()
    const args = buildCreateProgramArgs({
      projectToken: LB_CANARY.marco,
      quoteAsset: LB_CANARY.wbnb,
      pair: LB_CANARY.marcoWbnbPair,
    })
    expect('error' in args).toBe(false)
    if ('error' in args) return

    const result = await runFounderActivateFlow({
      owner: LB_CANARY.signer,
      createArgs: args,
      amountWei: parseBudgetWei(LB_CANARY.tokenReserveHuman, 18)!,
      projectToken: args.projectToken,
      wallet,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.status).toBe('ACTIVE')
    expect(result.successFeeBps).toBe(LB_SUCCESS_FEE_BPS)
    expect(result.txs.map((t) => t.step)).toEqual(['createProgram', 'approve', 'deposit', 'activate'])
    expect(wallet.createProgram).toHaveBeenCalledTimes(1)
    expect(wallet.depositBudget).toHaveBeenCalledTimes(1)
    expect(wallet.activate).toHaveBeenCalledTimes(1)
  })

  it('skips approve when allowance already sufficient', async () => {
    const wallet = mockWallet({
      readAllowance: vi.fn(async () => '1000000000000000000'),
    })
    const args = buildCreateProgramArgs({
      projectToken: LB_CANARY.marco,
      quoteAsset: LB_CANARY.wbnb,
      pair: LB_CANARY.marcoWbnbPair,
    })
    if ('error' in args) throw new Error(args.error)

    const result = await runFounderActivateFlow({
      owner: LB_CANARY.signer,
      createArgs: args,
      amountWei: '1000000000000000000',
      projectToken: args.projectToken,
      wallet,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.txs.map((t) => t.step)).toEqual(['createProgram', 'deposit', 'activate'])
    expect(wallet.approve).not.toHaveBeenCalled()
  })

  it('surfaces wallet rejection without faking ACTIVE', async () => {
    const wallet = mockWallet({
      createProgram: vi.fn(async () => {
        const err = new Error('User rejected the request')
        ;(err as any).code = 4001
        throw err
      }),
    })
    const args = buildCreateProgramArgs({
      projectToken: LB_CANARY.marco,
      quoteAsset: LB_CANARY.wbnb,
      pair: LB_CANARY.marcoWbnbPair,
    })
    if ('error' in args) throw new Error(args.error)

    const result = await runFounderActivateFlow({
      owner: LB_CANARY.signer,
      createArgs: args,
      amountWei: '1000000000000000000',
      projectToken: args.projectToken,
      wallet,
    })
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.step).toBe('REJECTED')
    expect(result.reason).toBe('WALLET_REJECTED')
  })

  it('founder wallet gate requires wallet + BSC + factory', () => {
    expect(canSubmitFounderWalletActivate({ walletConnected: true, correctChain: true, factoryBound: true })).toEqual({
      ok: true,
      reason: null,
    })
    expect(
      canSubmitFounderWalletActivate({ walletConnected: false, correctChain: true, factoryBound: true }).ok,
    ).toBe(false)
  })

  it('wires Activate CTA to founder activateProgram writer (no stub)', () => {
    const fs = require('node:fs') as typeof import('node:fs')
    const path = require('node:path') as typeof import('node:path')
    const root = path.resolve(__dirname, '..')
    const hook = fs.readFileSync(path.join(root, 'useLiquidityBuildingCard.ts'), 'utf8')
    expect(hook).toContain('activateProgram')
    expect(hook).toContain('useFounderActivateWriter')
    expect(hook).not.toContain('bound program writer')
    const writer = fs.readFileSync(path.join(root, 'useFounderActivateWriter.ts'), 'utf8')
    expect(writer).toContain('runFounderActivateFlow')
    expect(writer).toContain('createProgram')
    expect(writer).toContain('depositBudget')
    expect(writer).toContain('activate')
    const card = fs.readFileSync(path.join(root, '../onePage/LiquidityBuildingCard.tsx'), 'utf8')
    expect(card).toContain('await card.requestDepositAndActivate()')
    expect(card).toContain("programReason === 'NO_ACTIVE_PROGRAM'")
  })
})

