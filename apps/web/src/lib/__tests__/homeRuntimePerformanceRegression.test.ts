import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const WEB = path.resolve(__dirname, '../..')
const load = (relativePath: string) => readFileSync(path.resolve(WEB, relativePath), 'utf8')

describe('Home runtime performance regressions', () => {
  it('keeps the Top Movers marquee on an isolated 3D compositor layer', () => {
    const ticker = load('design-system/melega/components/Ticker/MelegaTicker.tsx')
    expect(ticker).toContain('translate3d(0, 0, 0)')
    expect(ticker).toContain('translate3d(-50%, 0, 0)')
    expect(ticker).toContain('contain: paint')
    expect(ticker).toContain('backface-visibility: hidden')
    expect(ticker).toContain('React.memo(MelegaTickerComponent)')
  })

  it('does not let live data updates interrupt shell hydration or user input', () => {
    const app = load('app-runtime/FullMyApp.tsx')
    const page = load('pages/index.tsx')
    const movers = load('views/HomeTrade/TopMoversSnapshotContext.tsx')
    const homeContext = load('views/HomeTrade/HomeTradeDataContext.tsx')
    const homeRuntime = load('views/HomeTrade/HomeTradeDataRuntime.tsx')
    expect(app).toContain('startTransition(() => setGlobalRuntimeReady(true))')
    expect(page).toContain('IndexPage.disablePageSuspense = true')
    expect(movers).toContain("clientReady ? '/api/market-data/top-movers' : null")
    expect(movers).toContain('setClientReady(true)')
    expect(movers.match(/readDurableTrendingSnapshot\(\)/g)).toHaveLength(1)
    expect(homeContext).toContain('timeout: 600')
    expect(homeRuntime).toContain('startTransition(() => onData(criticalData))')
  })

  it('avoids redundant global farm polling in the Home data graph', () => {
    const home = load('views/HomeTrade/useHomeTradeData.ts')
    const pools = load('views/Home/hooks/useGetTopPoolsByApr.tsx')
    const farms = load('views/Home/hooks/useGetTopFarmsByApr.tsx')
    expect(home).not.toContain('usePollFarmsWithUserData()')
    expect(pools).not.toContain('usePollFarmsWithUserData()')
    expect(farms).toContain('fetchFarmsPublicDataAsync')
  })
})
