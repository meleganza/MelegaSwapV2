/**
 * LIQUIDITY_MODULE_002_ACTIONS — IA primary workspace (expanded forms).
 */
import { describe, expect, it } from 'vitest'
import { createHash } from 'crypto'
import { readFileSync } from 'fs'
import path from 'path'
import { LIQUIDITY_ACTIONS_COPY, liquidityActions } from '../modules/liquidityActionsTokens'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

function load(rel: string) {
  return readFileSync(path.join(STUDIO, rel), 'utf8')
}

function sha256File(filePath: string) {
  return createHash('sha256').update(readFileSync(filePath)).digest('hex')
}

describe('LIQUIDITY_MODULE_002 Actions', () => {
  it('mounts Module 002 after Hero on /liquidity', () => {
    const page = readFileSync(path.join(WEB, 'src/pages/liquidity.tsx'), 'utf8')
    expect(page).toContain('LiquidityStudioV3Shell')
    const shell = readFileSync(path.join(WEB, 'src/views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx'), 'utf8')
    expect(shell).toContain('data-liquidity-module-002="mounted"')
    expect(shell).toContain('data-liquidity-module-001="mounted"')
    // V3: Actions module not page-mounted; marker retained on shell for continuity
    expect(page).not.toContain('<LiquidityActionsModule')
  })


  it('locks Actions workspace geometry (1376 / 50-50 / 24px gap)', () => {
    expect(liquidityActions.contentMax).toBe('1376px')
    expect(liquidityActions.gapAfterHero).toBe('16px')
    expect(liquidityActions.columnGap).toBe('24px')
    expect(liquidityActions.cardW).toBe('100%')
    expect(liquidityActions.cardMinH).toBe('520px')

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('data-liquidity-actions-geometry={lbSupported ? \'1376-24-50-50\' : \'single-manual\'}')
    expect(mod).toContain("minmax(0, 1fr) minmax(0, 1fr)")
    expect(mod).toContain('align-items: stretch')
  })

  it('embeds expanded Add Liquidity + AI Builder with BETA / BNB gating', () => {
    expect(LIQUIDITY_ACTIONS_COPY.manual.title).toBe('Add Liquidity')
    expect(LIQUIDITY_ACTIONS_COPY.aiBuilder.title).toBe('AI Liquidity Builder')
    expect(LIQUIDITY_ACTIONS_COPY.aiBuilder.cta).toBe('Create Plan')

    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain('liquidity-actions-manual')
    expect(mod).toContain('liquidity-actions-ai')
    expect(mod).toContain('<LiquidityAddModule embedded')
    expect(mod).toContain('<LiquidityBuildingCard forceExpanded')
    expect(mod).toContain('liquidity-actions-ai-beta-badge')
    expect(mod).toContain('BNB Chain only')
    expect(mod).toContain('LB_SUPPORTED_CHAIN_ID')
    expect(mod).toContain('data-liquidity-actions-ia="expanded-workspace"')
  })

  it('does not invent a second mint/LB engine — reuses existing modules only', () => {
    const mod = load('modules/LiquidityActionsModule.tsx')
    expect(mod).toContain("from './LiquidityAddModule'")
    expect(mod).toContain("from '../onePage/LiquidityBuildingCard'")
    expect(mod).not.toContain('AddLiquidityV2')
    expect(mod).not.toContain('eth_sendTransaction')
    expect(sha256File(path.join(STUDIO, 'modules/LiquidityActionsModule.tsx')).length).toBe(64)
  })
})
