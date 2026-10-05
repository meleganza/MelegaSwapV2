import type { LiquidityPositionRow } from '../liquidityRuntime/useLiquidityPositions'
import { buildLiquidityPositionDirectory, LIQUIDITY_POSITION_PAGE_SIZE } from '../modules/liquidityPositionDirectory'

function position(
  index: number,
  pairLabel = `TOKEN${index} / MARCO`,
  pairAddress = `0x${index.toString(16).padStart(40, '0')}`,
  poolTvlUsd: number | undefined = 10_000 - index,
  chainId = 56,
): LiquidityPositionRow {
  const [symbol0, symbol1] = pairLabel.split(' / ')
  return {
    id: `${chainId}:${pairAddress.toLowerCase()}`,
    pairAddress,
    pairLabel,
    chainId,
    poolTvlUsd,
    pair: {
      token0: {
        symbol: symbol0,
        name: symbol0,
        address: `0x${(index + 1_000).toString(16).padStart(40, '0')}`,
        chainId,
      },
      token1: {
        symbol: symbol1,
        name: symbol1,
        address: `0x${(index + 2_000).toString(16).padStart(40, '0')}`,
        chainId,
      },
    },
  } as unknown as LiquidityPositionRow
}

describe('wallet liquidity position directory', () => {
  const aaronMarcoPair = '0xc6f6f0a9525d43d68ab3fc27a731c01b10f320fa'
  const positions = Array.from({ length: 199 }, (_, index) =>
    index === 63 ? position(index, 'AARON / MARCO', aaronMarcoPair) : position(index),
  )

  it('paginates after global sort and keeps 199 identities exactly once', () => {
    const visibleIds: string[] = []
    for (let page = 1; page <= Math.ceil(positions.length / LIQUIDITY_POSITION_PAGE_SIZE); page += 1) {
      visibleIds.push(...buildLiquidityPositionDirectory(positions, '', page).visible.map((row) => row.id))
    }
    expect(visibleIds).toHaveLength(positions.length)
    expect(new Set(visibleIds).size).toBe(positions.length)
    expect(visibleIds).toContain(`56:${aaronMarcoPair}`)
  })

  it('orders all chains globally by whole-pool TVL regardless of active-chain concepts', () => {
    const rows = [
      position(1, 'BSC / MARCO', undefined, 1_000_000, 56),
      position(2, 'ETH / MARCO', undefined, 5_000_000, 1),
      position(3, 'POL / MARCO', undefined, 2_000_000, 137),
      position(4, 'BASE / MARCO', undefined, 10_000_000, 8453),
    ]
    expect(buildLiquidityPositionDirectory(rows, '', 1).visible.map((row) => row.chainId)).toEqual([8453, 1, 137, 56])
  })

  it('places AARON/MARCO according to TVL, never symbol priority', () => {
    const aaron = position(63, 'AARON / MARCO', aaronMarcoPair, 1)
    const zulu = position(64, 'ZZZ / MARCO', undefined, 2)
    expect(buildLiquidityPositionDirectory([aaron, zulu], '', 1).visible.map((row) => row.id)).toEqual([
      zulu.id,
      aaron.id,
    ])
  })

  it('recovers AARON/MARCO directly by symbol or exact LP address', () => {
    expect(buildLiquidityPositionDirectory(positions, 'aaron', 1).visible.map((row) => row.pairLabel)).toEqual([
      'AARON / MARCO',
    ])
    expect(buildLiquidityPositionDirectory(positions, 'marco', 4).visible.map((row) => row.pairAddress)).toContain(
      aaronMarcoPair,
    )
    expect(
      buildLiquidityPositionDirectory(positions, aaronMarcoPair.toUpperCase(), 1).visible.map((row) => row.pairAddress),
    ).toEqual([aaronMarcoPair])
  })

  it('puts unknown TVL after known TVL', () => {
    const unknown = position(1, 'AAA / MARCO')
    delete unknown.poolTvlUsd
    const known = position(2, 'ZZZ / MARCO', undefined, 1)
    expect(buildLiquidityPositionDirectory([unknown, known], '', 1).visible.map((row) => row.id)).toEqual([
      known.id,
      unknown.id,
    ])
  })

  it('uses label, chain and pair address as deterministic equal-TVL fallbacks', () => {
    const pairA = position(3, 'SAME / MARCO', '0x0000000000000000000000000000000000000002', 10, 137)
    const pairB = position(4, 'SAME / MARCO', '0x0000000000000000000000000000000000000001', 10, 56)
    const alpha = position(5, 'ALPHA / MARCO', undefined, 10, 8453)
    expect(buildLiquidityPositionDirectory([pairA, pairB, alpha], '', 1).visible.map((row) => row.id)).toEqual([
      alpha.id,
      pairB.id,
      pairA.id,
    ])
  })

  it('filters before sorting and preserves TVL-desc search order', () => {
    const rows = [
      position(1, 'MARCO / LOW', undefined, 10),
      position(2, 'OTHER / TOKEN', undefined, 1_000),
      position(3, 'MARCO / HIGH', undefined, 100),
    ]
    expect(buildLiquidityPositionDirectory(rows, 'marco', 1).visible.map((row) => row.poolTvlUsd)).toEqual([100, 10])
  })

  it('preserves exact object and transaction identity after sort/search/page', () => {
    const target = position(150, 'TARGET / MARCO', aaronMarcoPair, 50_000, 8453)
    const result = buildLiquidityPositionDirectory([...positions, target], aaronMarcoPair, 1)
    expect(result.visible[0]).toBe(target)
    expect(result.visible[0]).toMatchObject({
      id: `8453:${aaronMarcoPair}`,
      pairAddress: aaronMarcoPair,
      chainId: 8453,
    })
  })

  it('retains the same pair address on two chains as two identities', () => {
    const bsc = position(1, 'PAIR / MARCO', aaronMarcoPair, 10, 56)
    const base = position(1, 'PAIR / MARCO', aaronMarcoPair, 20, 8453)
    const visible = buildLiquidityPositionDirectory([bsc, base], '', 1).visible
    expect(visible).toHaveLength(2)
    expect(new Set(visible.map((row) => row.id)).size).toBe(2)
  })
})
