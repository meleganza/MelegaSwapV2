import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '../../..')
const read = (relative: string) => fs.readFileSync(path.join(root, relative), 'utf8')

describe('Founder Home live-surface contracts', () => {
  it('uses a request-time market authority and a short honest outage bridge for Top Movers', () => {
    const producer = read('lib/trending/buildServerTopMoversSnapshot.ts')
    const durable = read('lib/trending/durableTrendingSnapshot.ts')
    const api = read('pages/api/market-data/top-movers.ts')
    const provider = read('views/HomeTrade/TopMoversSnapshotContext.tsx')

    expect(producer).toContain('api.dexscreener.com/tokens/v1/bsc/')
    expect(producer).toContain("'dexScreenerLive'")
    expect(producer).toContain('externalRankedAssets.length > 0 ? externalRankedAssets : internalRankedAssets')
    expect(producer).toContain('liveMarketAuthority: externalRankedAssets.length > 0')
    expect(provider).toContain('data?.liveMarketAuthority && liveItems.length > 0')
    expect(durable).toContain('10 * 60 * 1000')
    expect(api).toContain("'s-maxage=60, stale-while-revalidate=120'")
  })

  it('keeps Home farm/pool rows to two textual lines and five equal slots', () => {
    const home = read('views/HomeTrade/DexHomeScreen.tsx')
    const data = read('views/HomeTrade/useHomeTradeData.ts')
    const farmHook = read('views/Home/hooks/useGetTopFarmsByApr.tsx')
    const poolHook = read('views/Home/hooks/useGetTopPoolsByApr.tsx')

    expect(home).toContain('min-height: 52px')
    expect(home).not.toContain("<RowMeta>{`Reward ${row.rewards || '—'}`}</RowMeta>")
    expect(farmHook).toContain('!isArchivedPid(farm.pid)')
    expect(farmHook).toContain('String(farm.multiplier ??')
    expect(farmHook).toContain('return aprB - aprA')
    expect(poolHook).toContain('!row.pool.isFinished && row.apr > 0')
    expect(poolHook).toContain('b.apr - a.apr')
    expect(data).toContain('!row.pool.isFinished && row.aprValue != null && row.aprValue > 0')
  })

  it('labels the integrated Smart Swap tab MARCO Bridge while preserving the approved public routes', () => {
    const tabs = read('views/SmartSwapStudio/SmartSwapProductActions.tsx')
    const panel = read('views/HomeTrade/HomeSwapPanel.tsx')
    const navigation = read('app-shell/config/globalHeaderNav.ts')

    expect(tabs).toContain("bridgeLabel = 'Bridge'")
    expect(tabs).toContain('Smart Swap')
    expect(panel).toContain('bridgeLabel="MARCO Bridge"')
    expect(panel).toContain('MarcoBridgeWorkspace')
    expect(navigation).toContain("id: 'swap'")
    expect(navigation).toContain("id: 'bridge'")
  })

  it('exposes every approved visibility family and MARCO PAY in the commercial funnel', () => {
    const services = read('views/shared/monetization/commercialCheckoutTypes.ts')
    const modal = read('views/shared/monetization/CommercialCheckoutModal.tsx')

    expect(services).toContain("title: 'Sponsored Search'")
    expect(services).toContain("title: 'Featured Farm'")
    expect(services).toContain("title: 'Featured Pool'")
    expect(modal).toContain("'MARCO_PAY'")
    expect(modal).toContain('<MarcoPay')
  })
})
