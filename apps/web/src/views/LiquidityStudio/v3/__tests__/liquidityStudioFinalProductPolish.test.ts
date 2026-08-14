/**
 * MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_POLISH — structural contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

const WEB = path.resolve(process.cwd(), 'src')
const load = (rel: string) => readFileSync(path.join(WEB, rel), 'utf8')

describe('MELEGASWAP_V2_LIQUIDITY_STUDIO_FINAL_PRODUCT_POLISH', () => {
  const shell = load('views/LiquidityStudio/v3/LiquidityStudioV3Shell.tsx')
  const tokens = load('views/LiquidityStudio/v3/liquidityV3Tokens.ts')
  const positions = load('views/LiquidityStudio/liquidityRuntime/useLiquidityPositions.ts')
  const myPos = load('views/LiquidityStudio/modules/LiquidityMyPositionsModule.tsx')
  const add = load('views/LiquidityStudio/modules/LiquidityAddModule.tsx')
  const addModal = load('views/LiquidityStudio/v3/LiquidityAddConfirmModal.tsx')
  const removeModal = load('views/LiquidityStudio/v3/LiquidityRemoveConfirmModal.tsx')

  it('keeps single-surface tabs mounted + Add/Remove subpanels mounted', () => {
    expect(shell).toContain('data-liquidity-panels="mounted"')
    expect(shell).toContain("display: ${({ $active }) => ($active ? 'block' : 'none')}")
    expect(shell).toContain('SubPanel')
    expect(shell).toContain('data-add-surface="mint"')
    expect(shell).toContain('data-add-surface="burn"')
    expect(shell).toContain('flushViewMirror')
    expect(shell).toContain('scroll: false')
  })

  it('dense laptop hero + page chrome', () => {
    expect(tokens).toContain("heroMaxH: '220px'")
    expect(tokens).toContain("titleSize: '44px'")
    expect(tokens).toContain("pageGap: '14px'")
    expect(shell).toContain('padding: 0')
    expect(shell).toContain('min-height: 60px')
  })

  it('AI route uses compact chrome and mounts the Builder on intent', () => {
    expect(shell).toContain("$builder={tab === 'building'}")
    expect(shell).toContain("$hidden={tab === 'building'}")
    expect(shell).toContain('Build an automated liquidity plan in two inputs.')
    expect(shell).not.toContain('data-ai-layout="horizontal"')
    expect(shell).not.toContain('setTimeout(() => setAiMounted(true)')
  })

  it('positions expose connecting→fetching→ready→empty→error + retry', () => {
    expect(positions).toContain("'error'")
    expect(positions).toContain('retryPositions')
    expect(myPos).toContain('liquidity-my-positions-retry')
    expect(myPos).toContain("positionsPhase === 'error'")
  })

  it('My Liquidity shows APR + Manage/Add More/Remove', () => {
    expect(myPos).toContain('useLPApr')
    expect(myPos).toContain('liquidity-my-positions-apr')
    expect(myPos).toContain('liquidity-my-positions-manage')
    expect(myPos).toContain('liquidity-my-positions-add-more')
    expect(myPos).toContain('liquidity-my-positions-remove')
  })

  it('Add Liquidity is a single horizontal workspace', () => {
    expect(add).toContain('single-card-horizontal')
    expect(add).toContain('liquidity-add-horizontal-workspace')
    expect(add).toContain('data-liquidity-preview="integrated"')
    expect(add).toContain('data-liquidity-ratio-source')
    expect(add).toContain("'runtime-preview' : 'awaiting-amounts'")
    expect(add).not.toContain('50-50-workspace')
  })

  it('Add + Remove confirms share flat MelegaModal gold CTA', () => {
    expect(existsSync(path.join(WEB, 'views/LiquidityStudio/v3/LiquidityAddConfirmModal.tsx'))).toBe(true)
    expect(addModal).toContain('MelegaModal')
    expect(removeModal).toContain('MelegaModal')
    expect(removeModal).toContain('liqV3.gold')
    expect(removeModal).not.toContain('linear-gradient(180deg, #F2C84C')
  })
})
