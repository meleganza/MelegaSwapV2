import fs from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { listEligibleFarmTargets, listEligiblePoolTargets } from 'lib/monetization/eligibleVisibilityTargets'

const SRC = path.resolve(__dirname, '../../..')
const read = (relative: string) => fs.readFileSync(path.join(SRC, relative), 'utf8')

describe('paid visibility consumption', () => {
  it('offers only configured active MM72 farms and associated live pools', () => {
    const identity = {
      chainId: 56,
      address: '0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E',
      symbol: 'MM72',
    }
    const farms = listEligibleFarmTargets(identity)
    const pools = listEligiblePoolTargets(identity)

    expect(farms.length).toBeGreaterThan(0)
    expect(farms.every((farm) => farm.kind === 'farm' && farm.chainId === 56)).toBe(true)
    expect(farms.some((farm) => farm.title.includes('MM72'))).toBe(true)
    expect(pools.every((pool) => pool.kind === 'pool' && pool.chainId === 56)).toBe(true)
    expect(pools.every((pool) => pool.stakeSymbol === 'MM72' || pool.rewardSymbol === 'MM72')).toBe(true)
  })

  it('injects verified Trend Boost orders into the server snapshot used by the global ribbon', () => {
    const producer = read('lib/trending/buildServerTopMoversSnapshot.ts')
    expect(producer).toContain('listTrendBoostOrdersDurably')
    expect(producer).toContain('paid-boosted-')
    expect(producer).toContain('formatPaidPlacementRemaining')
    expect(producer).toContain('🚀')
  })

  it('discloses paid search results in the header and keeps MARCO Connect mounted for Passport access', () => {
    const search = read('app-shell/components/GlobalSearch.tsx')
    const connect = read('components/MarcoWidgets/MarcoConnect.tsx')
    const swapSuggestions = read('views/shared/monetization/SponsoredSuggestionsStrip.tsx')

    expect(search).toContain('service=sponsored-research')
    expect(search).toContain('<Sponsored>Sponsored</Sponsored>')
    expect(connect).not.toContain('if (address) return null')
    expect(connect).toContain('<ConnectedDisplay')
    expect(connect).toContain('syncWalletSession(payload)')
    expect(connect).not.toContain('[address, connectAsync, connectors, size]')
    expect(swapSuggestions).not.toContain('<Title>Featured · Trending · Sponsored</Title>')
  })
})
