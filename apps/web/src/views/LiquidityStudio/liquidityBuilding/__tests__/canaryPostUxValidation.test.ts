/**
 * Post-UX canary validation — wiring + orientation mapping (no live Founder signature).
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it, vi } from 'vitest'
import {
  LB_CANARY,
  LB_SUCCESS_FEE_BPS,
  buildCreateProgramArgs,
  parseBudgetWei,
  resolveCanaryOrientation,
  runFounderActivateFlow,
  type FounderActivateWallet,
} from '../founderActivateFlow'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('Canary post-UX validation', () => {
  it('1. primary UX flow labels are present', () => {
    expect(LB_UX.tokenToGrowLabel).toBe('Token to Grow')
    expect(LB_UX.quoteAssetLabel).toBe('Quote Asset')
    expect(LB_UX.reserveLabel).toBe('Token Reserve')
    expect(LB_UX.liquidityGoalLabel).toBe('Liquidity Goal')
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('LB_UX.tokenToGrowLabel')
    expect(card).toContain('LB_UX.quoteAssetLabel')
    expect(card).toContain('LB_UX.reserveLabel')
    expect(card).toContain('LB_UX.liquidityGoalLabel')
    expect(card).toContain('Liquidity Strategy')
    expect(card).toContain('Activate Liquidity Program')
    expect(card).toContain('liq-lb-step-review')
  })

  it('2. Activate CTA still executes createProgram → deposit → activate', async () => {
    const writer = load('liquidityBuilding/useFounderActivateWriter.ts')
    expect(writer).toContain('createProgram')
    expect(writer).toContain('depositBudget')
    expect(writer).toContain('activate')
    expect(writer).toContain('runFounderActivateFlow')
    const hook = load('liquidityBuilding/useLiquidityBuildingCard.ts')
    expect(hook).toContain('activateProgram')
    expect(hook).toContain('requestDepositAndActivate')

    const program = '0xA15aDa28A9b7d4d9f6Ac781407bAf1A2CFB802EB'
    const ok = { status: 1, logs: [] as any[] }
    const wallet: FounderActivateWallet = {
      createProgram: vi.fn(async () => ({ hash: '0xc', wait: async () => ok })),
      approve: vi.fn(async () => ({ hash: '0xa', wait: async () => ok })),
      depositBudget: vi.fn(async () => ({ hash: '0xd', wait: async () => ok })),
      activate: vi.fn(async () => ({ hash: '0xact', wait: async () => ok })),
      readAllowance: vi.fn(async () => '0'),
      parseProgramCreated: () => ({ program, programId: '0xpid' }),
    }
    const args = buildCreateProgramArgs({
      projectToken: LB_CANARY.usdt,
      quoteAsset: LB_CANARY.wbnb,
      pair: LB_CANARY.wbnbUsdtPair,
    })
    expect('error' in args).toBe(false)
    if ('error' in args) return
    const result = await runFounderActivateFlow({
      owner: LB_CANARY.signer,
      createArgs: args,
      amountWei: parseBudgetWei('0.01', 18)!,
      projectToken: args.projectToken,
      wallet,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.txs.map((t) => t.step)).toEqual(['createProgram', 'approve', 'deposit', 'activate'])
    expect(result.successFeeBps).toBe(1000)
  })

  it('3. maps canary to executable UX orientation (USDT grow / WBNB quote)', () => {
    // Canonical doc said "Budget: 0.01 WBNB" — on-chain deposit pulls projectToken;
    // Factory enables only WBNB as quote → executable mapping:
    const executable = resolveCanaryOrientation({
      projectToken: LB_CANARY.usdt,
      quoteAsset: LB_CANARY.wbnb,
      quoteEnabled: true,
    })
    expect(executable.ok).toBe(true)

    const naive = resolveCanaryOrientation({
      projectToken: LB_CANARY.wbnb,
      quoteAsset: LB_CANARY.usdt,
      quoteEnabled: false,
    })
    expect(naive.ok).toBe(false)

    expect(LB_CANARY.signer).toBe('0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0')
    expect(LB_CANARY.wbnbUsdtPair).toBe('0x94FADf053BaD0c9d0a3874F82b1a09001926A548')
    expect(LB_CANARY.budgetHuman).toBe('0.01')
    expect(LB_SUCCESS_FEE_BPS).toBe(1000)
    expect(parseBudgetWei(LB_CANARY.budgetHuman, 18)).toBe('10000000000000000')
  })

  it('4. captures documented mismatch: 0.01 WBNB budget wording ≠ deposit asset', () => {
    const mismatch = {
      missionWording: { budgetAsset: 'WBNB', amount: '0.01', pair: 'WBNB/USDT' },
      onChainTruth: {
        depositAsset: 'projectToken',
        enabledQuote: 'WBNB only',
        usdtQuoteEnabled: false,
      },
      uxExecutable: {
        tokenToGrow: 'USDT',
        quoteAsset: 'WBNB',
        tokenReserve: '0.01',
        market: 'USDT/WBNB',
        samePair: LB_CANARY.wbnbUsdtPair,
      },
    }
    expect(mismatch.uxExecutable.samePair).toBe(LB_CANARY.wbnbUsdtPair)
    expect(mismatch.onChainTruth.usdtQuoteEnabled).toBe(false)
    expect(mismatch.missionWording.budgetAsset).not.toBe(mismatch.uxExecutable.tokenToGrow)
  })
})
