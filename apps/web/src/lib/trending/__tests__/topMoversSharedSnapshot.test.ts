import { describe, expect, it } from 'vitest'
import {
  assertIdenticalPrefix,
  buildTopMoversSharedSnapshot,
  homeTopMoversPrefix,
  HOME_TOP_MOVERS_LIMIT,
} from '../topMoversSharedSnapshot'
import type { MelegaTickerItem } from 'design-system/melega'

function item(symbol: string, address: string, pct: string, positive = true): MelegaTickerItem {
  return {
    id: `trade-asset-${symbol.toLowerCase()}`,
    primary: symbol,
    accent: pct,
    accentPositive: positive,
    href: `/swap?outputCurrency=${address}`,
  }
}

describe('Top Movers shared snapshot', () => {
  it('Home card is an exact prefix of the ticker snapshot with same snapshotId', () => {
    const items = [
      item('FLOKI', '0x1111111111111111111111111111111111111111', '+12.4%'),
      item('BLION', '0x2222222222222222222222222222222222222222', '+8.1%'),
      item('MM72', '0x3333333333333333333333333333333333333333', '-3.2%', false),
      item('CAKE', '0x4444444444444444444444444444444444444444', '+2.0%'),
      item('DOT', '0x5555555555555555555555555555555555555555', '+1.5%'),
      item('BTCB', '0x6666666666666666666666666666666666666666', '-0.8%', false),
    ]
    const snap = buildTopMoversSharedSnapshot({ items, generatedAt: '2026-07-30T00:00:00.000Z' })
    const home = homeTopMoversPrefix(snap, HOME_TOP_MOVERS_LIMIT)
    expect(HOME_TOP_MOVERS_LIMIT).toBe(3)
    expect(home).toHaveLength(3)
    expect(home.map((e) => e.symbol)).toEqual(['FLOKI', 'BLION', 'MM72'])
    expect(assertIdenticalPrefix(snap.entries, home)).toBe('IDENTICAL_PREFIX')
    expect(home.every((h, i) => h.changeLabel === snap.entries[i].changeLabel)).toBe(true)
    expect(home.every((h, i) => h.address === snap.entries[i].address)).toBe(true)
  })

  it('detects mismatch when Home values diverge', () => {
    const snap = buildTopMoversSharedSnapshot({
      items: [item('FLOKI', '0x1111111111111111111111111111111111111111', '+1%')],
    })
    const forged = [{ ...snap.entries[0], symbol: 'MARCO', changeLabel: '+99%' }]
    expect(assertIdenticalPrefix(snap.entries, forged)).toBe('MISMATCH')
  })

  it('ten refresh cycles keep IDENTICAL_PREFIX for the same ordered snapshot', () => {
    const items = [
      item('FLOKI', '0x1111111111111111111111111111111111111111', '+12.4%'),
      item('BLION', '0x2222222222222222222222222222222222222222', '+8.1%'),
      item('MM72', '0x3333333333333333333333333333333333333333', '-3.2%', false),
      item('CAKE', '0x4444444444444444444444444444444444444444', '+2.0%'),
      item('DOT', '0x5555555555555555555555555555555555555555', '+1.5%'),
    ]
    for (let cycle = 1; cycle <= 10; cycle += 1) {
      const snap = buildTopMoversSharedSnapshot({
        items,
        generatedAt: `2026-07-30T00:00:0${cycle}.000Z`,
      })
      const home = homeTopMoversPrefix(snap)
      expect(assertIdenticalPrefix(snap.entries, home)).toBe('IDENTICAL_PREFIX')
      expect(home.map((e) => e.symbol)).toEqual(['FLOKI', 'BLION', 'MM72'])
      expect(home.map((e) => e.changeLabel)).toEqual(['+12.4%', '+8.1%', '-3.2%'])
    }
  })

  it('shell and Home consumers share one provider source', () => {
    const shell = read('src/app-shell/MelegaAppShell.tsx')
    const ribbon = read('src/views/HomeTrade/TrendingRibbon.tsx')
    const homeData = read('src/views/HomeTrade/useHomeTradeData.ts')
    const dex = read('src/views/HomeTrade/DexHomeScreen.tsx')
    expect(shell).toContain('TopMoversSnapshotProvider')
    expect(ribbon).toContain('useTopMoversSnapshot')
    expect(homeData).toContain('useTopMoversSnapshot')
    expect(homeData).not.toContain('useDexTrendingRankings')
    expect(dex).toContain('homeTopMoversEntries')
    expect(dex).toContain('data-top-movers-snapshot-id')
  })
})

function read(rel: string) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const fs = require('fs') as typeof import('fs')
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const path = require('path') as typeof import('path')
  return fs.readFileSync(path.join(__dirname, '../../../../', rel), 'utf8')
}
