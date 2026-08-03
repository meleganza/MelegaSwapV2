/**
 * MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_PORTFOLIO_DASHBOARD_UX
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LB_UX } from '../uxCopy'
import {
  formatReserveLabel,
  pairLabelForProgram,
  portfolioSummary,
  statusDisplay,
  symbolForAddress,
} from '../portfolioDisplay'
import type { LbProgramApiRow } from 'lib/liquidity-builder-indexer/types'

const ROOT = path.resolve(__dirname, '../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function sampleProgram(overrides: Partial<LbProgramApiRow> = {}): LbProgramApiRow {
  return {
    programAddress: '0xa15ada28a9b7d4d9f6ac781407baf1a2cfb802eb',
    token: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    quoteAsset: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    pair: '0x7286c16c3c05d4c17b689be7948ec4fa4e861d1e',
    reserve: '1000000000000000000',
    remaining: '1000000000000000000',
    status: 'Active',
    strategy: 'AI Optimized',
    goal: 'Steady Growth',
    timestamps: {
      createdAt: 1,
      activatedAt: 2,
      pausedAt: null,
      stoppedAt: null,
      updatedAt: 3,
    },
    programId: '0x11',
    owner: '0xb6eeb3ab9695979f5b2ef6df4112e63212e33ee0',
    executionCount: 2,
    totalFeePaid: '5',
    generation: 1,
    ...overrides,
  }
}

describe('LB portfolio dashboard UX', () => {
  it('formats independent multi-program inventory rows', () => {
    const marcoWbnb = sampleProgram()
    const marcoUsdt = sampleProgram({
      programAddress: '0x1111111111111111111111111111111111111111',
      quoteAsset: '0x55d398326f99059ff775485246999027b3197955',
      pair: '0x2222222222222222222222222222222222222222',
    })
    const mm72 = sampleProgram({
      programAddress: '0x3333333333333333333333333333333333333333',
      token: '0x4444444444444444444444444444444444444444',
    })
    expect(pairLabelForProgram(marcoWbnb)).toBe('MARCO/WBNB')
    expect(pairLabelForProgram(marcoUsdt)).toBe('MARCO/USDT')
    expect(pairLabelForProgram(mm72)).toContain('/')
    expect(statusDisplay('Active')).toBe('ACTIVE')
    expect(formatReserveLabel('1000000000000000000', marcoWbnb.token)).toBe('1 MARCO')
    const summary = portfolioSummary([marcoWbnb, marcoUsdt, mm72])
    expect(summary.activeCount).toBe(3)
    expect(summary.totalPrograms).toBe(3)
  })

  it('portfolio home renders inventory, empty state, and create CTA', () => {
    const home = load('liquidityBuilding/product/LbPortfolioHome.tsx')
    expect(home).toContain('liq-lb-portfolio')
    expect(home).toContain('liq-lb-portfolio-empty')
    expect(home).toContain('liq-lb-portfolio-create')
    expect(home).toContain('liq-lb-program-card')
    expect(home).toContain('liq-lb-program-manage')
    expect(home).toContain('LB_UX.portfolioEmptyTitle')
    expect(home).toContain('LB_UX.portfolioCreateCta')
    expect(LB_UX.portfolioEmptyTitle).toBe('Your AI Liquidity Portfolio is empty.')
    expect(LB_UX.portfolioCreateCta).toBe('+ Create New Program')
  })

  it('card shell switches portfolio / create / detail modes', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('showPortfolio')
    expect(card).toContain('LbPortfolioHome')
    expect(card).toContain('returnToPortfolio')
    expect(card).toContain('openProgramDetail')
    expect(card).toContain('liq-lb-back-portfolio')
    expect(card).toContain('useLbOwnerPrograms')
    expect(card).toContain('useLbProgramDetail')
    expect(card).toContain('card.reset()')
    expect(card).toContain("query: { view: 'building' }")
  })

  it('keeps wizard path and deep-link program query', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liq-lb-single-surface')
    expect(card).toContain('requestDepositAndActivate')
    expect(card).toContain('programFromQuery')
    expect(card).toContain("step: 'dashboard'")
    expect(card).toContain('program: programAddress')
  })

  it('program detail keeps Advanced Details collapsed for technical fields', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('liq-lb-active-advanced')
    expect(card).toContain('liq-lb-active-events')
    expect(card).toContain('Allocated reserve')
    expect(card).toContain('Remaining reserve')
    expect(card).toContain('LB_UX.technicalTitle')
  })

  it('uses compact responsive portfolio grid', () => {
    const home = load('liquidityBuilding/product/LbPortfolioHome.tsx')
    expect(home).toContain('@media (min-width: 900px)')
    expect(home).toContain('SummaryGrid')
    expect(home).toContain('ProgramCard')
    expect(symbolForAddress('0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c')).toBe('WBNB')
  })
})
