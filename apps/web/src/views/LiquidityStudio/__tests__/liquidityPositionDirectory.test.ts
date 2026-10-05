import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'
import { buildLiquidityPositionDirectory, LIQUIDITY_POSITION_PAGE_SIZE } from '../modules/liquidityPositionDirectory'

function position(
  index: number,
  pairLabel = `TOKEN${index} / MARCO`,
  pairAddress = `0x${index.toString(16).padStart(40, '0')}`,
): LiquidityPositionRow {
  const [symbol0, symbol1] = pairLabel.split(' / ')
  return {
    id: pairAddress,
    pairAddress,
    pairLabel,
    chainId: 56,
    pair: {
      token0: {
        symbol: symbol0,
        name: symbol0,
        address: `0x${(index + 1_000).toString(16).padStart(40, '0')}`,
      },
      token1: {
        symbol: symbol1,
        name: symbol1,
        address: `0x${(index + 2_000).toString(16).padStart(40, '0')}`,
      },
    },
  } as unknown as LiquidityPositionRow
}

describe('wallet liquidity position directory', () => {
  const aaronMarcoPair = '0xc6f6f0a9525d43d68ab3fc27a731c01b10f320fa'
  const positions = Array.from({ length: 199 }, (_, index) =>
    index === 63 ? position(index, 'AARON / MARCO', aaronMarcoPair) : position(index),
  )

  it('makes every owned pair reachable across deterministic pages', () => {
    const visibleIds: string[] = []
    const totalPages = Math.ceil(positions.length / LIQUIDITY_POSITION_PAGE_SIZE)

    for (let page = 1; page <= totalPages; page += 1) {
      visibleIds.push(...buildLiquidityPositionDirectory(positions, '', page).visible.map((row) => row.id))
    }

    expect(visibleIds).toHaveLength(positions.length)
    expect(new Set(visibleIds).size).toBe(positions.length)
    expect(visibleIds).toContain(aaronMarcoPair)
  })

  it('places AARON/MARCO on the first page instead of preserving opaque factory order', () => {
    const firstPage = buildLiquidityPositionDirectory(positions, '', 1)
    expect(firstPage.visible).toContainEqual(expect.objectContaining({ pairAddress: aaronMarcoPair }))
  })

  it('recovers AARON/MARCO directly by symbol or exact LP address', () => {
    const bySymbol = buildLiquidityPositionDirectory(positions, 'aaron', 1)
    const byAddress = buildLiquidityPositionDirectory(positions, aaronMarcoPair.toUpperCase(), 1)

    expect(bySymbol.visible.map((row) => row.pairLabel)).toEqual(['AARON / MARCO'])
    expect(byAddress.visible.map((row) => row.pairAddress)).toEqual([aaronMarcoPair])
  })

  it('does not silently fall back to the first page when a later valid page is requested', () => {
    const fourthPage = buildLiquidityPositionDirectory(positions, '', 4)
    expect(fourthPage.page).toBe(4)
    expect(fourthPage.firstVisible).toBe(61)
    expect(fourthPage.visible).toHaveLength(LIQUIDITY_POSITION_PAGE_SIZE)
  })
})
