/**
 * MELEGA_DEX_V1_AI_LIQUIDITY_BUILDER_KNOWLEDGE_CENTER
 */
import { describe, expect, it } from 'vitest'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { LB_UX } from '../uxCopy'

const ROOT = path.resolve(__dirname, '../..')
const WEB = path.resolve(__dirname, '../../../../../')
const PAGES = path.join(WEB, 'src/pages/docs/liquidity-builder')

const DOC_ROUTES = [
  '/docs/liquidity-builder',
  '/docs/liquidity-builder/overview',
  '/docs/liquidity-builder/how-it-works',
  '/docs/liquidity-builder/token-reserve',
  '/docs/liquidity-builder/liquidity-goals',
  '/docs/liquidity-builder/strategies',
  '/docs/liquidity-builder/execution',
  '/docs/liquidity-builder/fees',
  '/docs/liquidity-builder/risk-safety',
  '/docs/liquidity-builder/examples',
] as const

const PAGE_FILES: Record<(typeof DOC_ROUTES)[number], string> = {
  '/docs/liquidity-builder': 'index.tsx',
  '/docs/liquidity-builder/overview': 'overview.tsx',
  '/docs/liquidity-builder/how-it-works': 'how-it-works.tsx',
  '/docs/liquidity-builder/token-reserve': 'token-reserve.tsx',
  '/docs/liquidity-builder/liquidity-goals': 'liquidity-goals.tsx',
  '/docs/liquidity-builder/strategies': 'strategies.tsx',
  '/docs/liquidity-builder/execution': 'execution.tsx',
  '/docs/liquidity-builder/fees': 'fees.tsx',
  '/docs/liquidity-builder/risk-safety': 'risk-safety.tsx',
  '/docs/liquidity-builder/examples': 'examples.tsx',
}

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

describe('LB knowledge center', () => {
  it('ships every docs route page file', () => {
    for (const route of DOC_ROUTES) {
      const file = path.join(PAGES, PAGE_FILES[route])
      expect(existsSync(file), route).toBe(true)
      const src = readFileSync(file, 'utf8')
      expect(src).toContain(`path="${route}"`)
      expect(src).toContain('LbDocsPage')
    }
  })

  it('hub hero matches product education framing', () => {
    const hub = readFileSync(path.join(PAGES, 'index.tsx'), 'utf8')
    expect(hub).toContain('AI Liquidity Builder')
    expect(hub).toContain('Automatically grow and optimize your token liquidity.')
    expect(hub).toContain('hubCards')
  })

  it('token reserve never uses Budget / Capital wording', () => {
    const reserve = readFileSync(path.join(PAGES, 'token-reserve.tsx'), 'utf8')
    expect(reserve).toMatch(/Token Reserve/)
    expect(reserve).toContain('1,000,000 TOKEN')
    expect(reserve).toMatch(/not Budget, Liquidity Budget, or Capital/i)
  })

  it('documents goals, strategies, fees path, and examples', () => {
    const goals = readFileSync(path.join(PAGES, 'liquidity-goals.tsx'), 'utf8')
    expect(goals).toContain('Steady Growth')
    expect(goals).toContain('Deeper Market')
    expect(goals).toContain('Launch Support')

    const strategies = readFileSync(path.join(PAGES, 'strategies.tsx'), 'utf8')
    expect(strategies).toContain('Conservative')
    expect(strategies).toContain('Balanced')
    expect(strategies).toContain('AI Optimized')
    expect(strategies).toContain('Aggressive')

    const fees = readFileSync(path.join(PAGES, 'fees.tsx'), 'utf8')
    expect(fees).toContain('10%')
    expect(fees).toContain('FeeSink')
    expect(fees).toContain('FeeReceiver')
    expect(fees).toContain('MELEGA TREASURY')
    expect(fees).toMatch(/no Treasury Runtime/i)

    const examples = readFileSync(path.join(PAGES, 'examples.tsx'), 'utf8')
    expect(examples).toContain('TOKEN/WBNB')
    expect(examples).toContain('TOKEN/USDT')
    expect(examples).toContain('Launch Support')
    expect(examples).toContain('Deeper Market')
  })

  it('nav map covers all knowledge center routes', () => {
    const shell = load('liquidityBuilding/LbDocsPage.tsx')
    for (const route of DOC_ROUTES) {
      expect(shell).toContain(`href: '${route}'`)
    }
    expect(LB_UX.docsHub).toBe('/docs/liquidity-builder')
    expect(LB_UX.docsHowItWorks).toBe('/docs/liquidity-builder/how-it-works')
    expect(LB_UX.docsRiskSafety).toBe('/docs/liquidity-builder/risk-safety')
    expect(LB_UX.docsExamples).toBe('/docs/liquidity-builder/examples')
  })

  it('builder keeps one overview link plus contextual docs inside customization', () => {
    const card = load('onePage/LiquidityBuildingCard.tsx')
    expect(card).toContain('lb-docs-link-reserve')
    expect(card).toContain('lb-docs-link-goal')
    expect(card).toContain('lb-docs-link-strategy')
    expect(card).toContain('LB_UX.docsTokenReserve')
    expect(card).toContain('LB_UX.docsLiquidityGoals')
    expect(card).toContain('LB_UX.docsStrategies')
    expect(card).toContain('LB_UX.docsHowItWorks')
    expect(card).toContain('How it works')
  })

  it('portfolio exposes View Documentation to the hub', () => {
    const home = load('liquidityBuilding/product/LbPortfolioHome.tsx')
    expect(home).toContain('liq-lb-portfolio-docs')
    expect(home).toContain('LB_UX.portfolioViewDocs')
    expect(home).toContain('LB_UX.docsHub')
    expect(LB_UX.portfolioViewDocs).toBe('View Documentation')
  })

  it('docs shell is mobile-friendly with expandable sections', () => {
    const shell = load('liquidityBuilding/LbDocsPage.tsx')
    expect(shell).toContain('@media (min-width: 768px)')
    expect(shell).toContain('lb-docs-expandable')
    expect(shell).toContain('Details')
  })

  it('gives every docs route a lightweight, page-specific visual', () => {
    const shell = load('liquidityBuilding/LbDocsPage.tsx')
    const visual = readFileSync(path.join(WEB, 'src/views/Docs/DocsVisual.tsx'), 'utf8')
    const docsLanding = readFileSync(path.join(WEB, 'src/pages/docs/index.tsx'), 'utf8')

    expect(shell).toContain("from 'views/Docs/DocsVisual'")
    expect(shell).toContain('VISUAL_BY_PATH')
    for (const route of DOC_ROUTES) {
      expect(shell).toContain(`'${route}'`)
    }
    expect(visual).toContain('prefers-reduced-motion: reduce')
    expect(visual).toContain('role="img"')
    expect(visual).toContain('aria-hidden="true"')
    expect(shell).toContain('MobileGuideNav')
    expect(docsLanding).toContain('<DocsVisual variant="ecosystem" />')
  })
})
