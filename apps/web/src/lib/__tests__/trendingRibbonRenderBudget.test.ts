import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'

const WEB = path.resolve(__dirname, '../..')

describe('Top Movers ticker render budget', () => {
  it('keeps the marquee on transform and disables overflow-x while animating', () => {
    const ticker = readFileSync(
      path.join(WEB, 'design-system/melega/components/Ticker/MelegaTicker.tsx'),
      'utf8',
    )
    expect(ticker).toContain('transform: translate3d(-50%, 0, 0)')
    expect(ticker).toContain("overflow-x: ${({ $scrollable }) => ($scrollable ? 'auto' : 'hidden')}")
    expect(ticker).toContain('data-ticker-overflow={marqueeEnabled && !paused ? \'hidden\' : \'auto\'}')
    expect(ticker).not.toMatch(/left:\s*\$\{/)
    expect(ticker).not.toMatch(/setInterval\(/)
  })

  it('reuses avatar nodes by address and skips no-op display-limit updates', () => {
    const ribbon = readFileSync(path.join(WEB, 'views/HomeTrade/TrendingRibbon.tsx'), 'utf8')
    const limit = readFileSync(path.join(WEB, 'views/HomeTrade/useTrendingDisplayLimit.ts'), 'utf8')
    const context = readFileSync(path.join(WEB, 'views/HomeTrade/TopMoversSnapshotContext.tsx'), 'utf8')
    expect(ribbon).toContain('iconCacheRef')
    expect(ribbon).toContain('iconByAddress.get(address)')
    expect(limit).toContain('setLimit((prev) => (prev === next ? prev : next))')
    expect(context).toContain('refreshInterval: 60_000')
    expect(context).toContain('dedupingInterval: 55_000')
  })

  it('restores paid Trend Boost pill chrome without dropping the token logo', () => {
    const ticker = readFileSync(
      path.join(WEB, 'design-system/melega/components/Ticker/MelegaTicker.tsx'),
      'utf8',
    )
    const ribbon = readFileSync(path.join(WEB, 'views/HomeTrade/TrendingRibbon.tsx'), 'utf8')
    const placements = readFileSync(path.join(WEB, 'lib/trending/paidTickerPlacements.ts'), 'utf8')

    expect(ticker).toContain('paidItemStyles')
    expect(ticker).toContain('rgba(244, 196, 48, 0.82)')
    expect(ticker).toContain('border-radius: 999px')
    expect(ticker).toContain('RocketMark')
    expect(ticker).toContain('item.icon')
    expect(ticker).toContain('{item.icon && <ItemIcon>{item.icon}</ItemIcon>}')
    expect(ticker).toContain('<RocketMark />')
    expect(ticker).not.toContain('const icon = boosted ? <RocketMark /> : item.icon')
    expect(ticker.indexOf('{item.icon && <ItemIcon>{item.icon}</ItemIcon>}')).toBeLessThan(
      ticker.indexOf('<RocketMark />'),
    )

    expect(ribbon).toContain("item.id.startsWith('paid-boosted-')")
    expect(ribbon).toContain('MelegaTokenAvatar')
    expect(ribbon).toContain('extractAddressFromHref(item.href)')
    expect(ribbon).toContain('address={address}')
    expect(ribbon).toContain('chainId={chainId}')

    expect(placements).not.toContain('`🚀 ${placement.symbol}`')
  })
})
