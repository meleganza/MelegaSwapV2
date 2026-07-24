/**
 * DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY — source guards.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '..')
const SRC = path.resolve(__dirname, '../../..')

function load(rel: string) {
  return readFileSync(path.join(ROOT, rel), 'utf8')
}

function loadSrc(rel: string) {
  return readFileSync(path.join(SRC, rel), 'utf8')
}

describe('DEX_V1_FULL_INDEXING_SWAP_LIQUIDITY_RUNTIME_RECOVERY', () => {
  it('consumes checksummed local token logos', () => {
    const local = loadSrc('lib/token-logo/localTokenLogoPath.ts')
    const resolve = loadSrc('lib/token-logo/resolveTokenLogoSources.ts')
    const assetLogo = loadSrc('lib/dex-asset-index/resolveAssetLogo.ts')
    expect(local).toContain('getAddress')
    expect(resolve).toContain('localBscTokenLogoCandidates')
    expect(assetLogo).toContain('localBscTokenLogoPath')
    expect(assetLogo).not.toMatch(/LOCAL_LOGO_PREFIX.*toLowerCase\(\)\.png/)
  })

  it('formats farm/pool stakes with decimals (no raw uint256)', () => {
    const cutover = loadSrc('views/CommandCenter/commandCenterRuntime/commandCenterPortfolioCutover.ts')
    expect(cutover).toContain('formatStakeAmount')
    expect(cutover).toContain('getBalanceNumber')
    expect(cutover).not.toMatch(/formatted:\s*card\.userStaked\?\.toString\(\)/)
  })

  it('removes Liquidity ticker accent and exposes Smart Swap from Home', () => {
    const tier = loadSrc('lib/trending/tierTrendingModel.ts')
    const home = load('DexHomeScreen.tsx')
    const style = load('HomeTradeGlobalStyle.tsx')
    expect(tier).not.toMatch(/return \{\s*accent:\s*'Liquidity'\s*\}/)
    expect(home).toContain('dex-home-smart-swap')
    expect(home).toContain('href="/trade"')
    expect(style).toMatch(/is-disconnected \.token-amount-input[\s\S]*pointer-events:\s*auto/)
  })

  it('wires Home TVL/Volume KPI cards and paginated factory pools', () => {
    const data = load('useHomeTradeData.ts')
    const factories = loadSrc('views/PoolsStudio/poolsRuntime/useMelegaFactoryPools.ts')
    expect(data).toContain("label: 'TVL'")
    expect(data).toContain("label: '24H Volume'")
    expect(factories).toContain('MAX_PAGES')
    expect(factories).toContain('melega-factory-pools-v2-paginated')
  })

  it('Liquidity pair select opens full token search', () => {
    const add = loadSrc('views/LiquidityStudio/onePage/AddLiquidityCard.tsx')
    expect(add).toContain('onClick={onPresentSelectA}')
    expect(add).toContain('liq-add-pair-suggest')
    expect(add).toContain('CurrencySearchModal')
  })
})
