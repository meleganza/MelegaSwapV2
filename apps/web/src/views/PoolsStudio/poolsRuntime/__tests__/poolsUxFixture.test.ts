import { getPoolsUxFixtureCards, isPoolsUxFixtureEnabled } from '../poolsUxFixture'

describe('poolsUxFixture', () => {
  const original = process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE

  afterEach(() => {
    process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE = original
  })

  it('is disabled unless env is exactly "1"', () => {
    process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE = undefined
    expect(isPoolsUxFixtureEnabled()).toBe(false)
    process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE = 'true'
    expect(isPoolsUxFixtureEnabled()).toBe(false)
    process.env.NEXT_PUBLIC_POOLS_UX_FIXTURE = '1'
    expect(isPoolsUxFixtureEnabled()).toBe(true)
  })

  it('returns exactly three fixture pools with required APR labels', () => {
    const cards = getPoolsUxFixtureCards()
    expect(cards).toHaveLength(3)
    expect(cards.map((c) => c.name)).toEqual(['MARCO Locked', 'MARCO → MXMX', 'MARCO → RFX'])
    expect(cards.map((c) => c.sustainableAprDisplay)).toEqual(['10.00%', '28.45%', '38.00%'])
    expect(cards.map((c) => c.rewardToken)).toEqual(['MARCO', 'MXMX', 'RFX'])
    cards.forEach((card) => {
      expect(card.visibilityStatus).toBe('VISIBLE')
      expect(card.analyzePreview?.contractExplorerUrl).toMatch(/^https:\/\/bscscan\.com\/address\//)
    })
  })
})
