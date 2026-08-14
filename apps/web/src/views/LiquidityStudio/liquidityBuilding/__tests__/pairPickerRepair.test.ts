import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const CARD = path.resolve(__dirname, '../../onePage/LiquidityBuildingCard.tsx')
const DETECTION = path.resolve(__dirname, '../useMelegaPairDetection.ts')

describe('AI Liquidity Builder pair picker repair', () => {
  it('discovers every supported quote pair and does not reuse the token picker', () => {
    const src = readFileSync(CARD, 'utf8')

    expect(src).toContain("useMelegaPairDetection(selectedProjectToken, 'WBNB')")
    expect(src).toContain("useMelegaPairDetection(selectedProjectToken, 'USDT')")
    expect(src).toContain("useMelegaPairDetection(selectedProjectToken, 'USDC')")
    expect(src).toContain('data-testid="lb-pair-picker-menu"')
    expect(src).toContain("candidate.available ? 'Active' : 'Not found'")
    expect(src).toContain('<PreviewValue>{marketPair}</PreviewValue>')
    expect(src).not.toContain("<PreviewValue>BNB / {card.draft.tokenSymbol || 'MARCO'}</PreviewValue>")
    expect(src).not.toMatch(/data-testid="lb-approved-pair-select"[^>]*onClick=\{onPresentCustomToken\}/)
  })

  it('falls back to the indexed canonical Melega pair when multicall remains pending', () => {
    const src = readFileSync(DETECTION, 'utf8')

    expect(src).toContain('/api/market-data/token-pairs?chainId=56')
    expect(src).toContain('candidate.dexId.toLowerCase() === MELEGA_FACTORY_BSC')
    expect(src).toContain('candidate.counterpartAddress?.toLowerCase()')
    expect(src).toContain('pairAddress: indexedPair.pairAddress')
  })
})
