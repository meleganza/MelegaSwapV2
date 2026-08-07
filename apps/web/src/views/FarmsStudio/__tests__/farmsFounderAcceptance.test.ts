/**
 * Farms Final Founder Acceptance — source contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { selectFeaturedFarm } from '../farmsRuntime/formatFarmsRuntime'
import type { FarmPreviewCard } from '../farmsStudioData'

const STUDIO = path.resolve(__dirname, '..')
const WEB = path.resolve(__dirname, '../../../')

function card(partial: Partial<FarmPreviewCard> & { pid: number; liq: number; apr: string }): FarmPreviewCard {
  return {
    id: `farm-${partial.pid}`,
    pid: partial.pid,
    pair: partial.pair ?? `T${partial.pid} / MARCO`,
    tokens: partial.tokens ?? ['T', 'MARCO'],
    apr: partial.apr,
    displayApr: partial.apr,
    status: 'live',
    tvl: `$${partial.liq}`,
    liquidity: `$${partial.liq}`,
    dailyRewards: '10 MARCO',
    multiplier: '1x',
    rewardToken: 'MARCO',
    participants: '—',
    cta: 'stake',
    emissionState: 'active',
    analyzePreview: {
      aprHistory: partial.apr,
      rewardToken: 'MARCO',
      emission: '10 MARCO / day',
      contract: '0x1',
      risk: 'Standard',
    },
    rawFarm: {
      pid: partial.pid,
      multiplier: '1X',
      liquidity: new BigNumber(partial.liq),
    } as FarmPreviewCard['rawFarm'],
    ...partial,
  } as FarmPreviewCard
}

describe('Farms Founder Acceptance', () => {
  it('IA order: Hero → KPI → My Farms → Explore; Create Farm is modal-only', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    const order = [
      'FarmsHeroModule',
      'FarmsOverviewKpisModule',
      'FarmsMyFarmsModule',
      'FarmsExploreFarmsModule',
    ]
    let prev = -1
    for (const name of order) {
      const idx = screen.indexOf(`<${name}`)
      expect(idx, name).toBeGreaterThan(-1)
      expect(idx).toBeGreaterThan(prev)
      prev = idx
    }
    expect(screen).toContain('create-farm-modal')
    expect(screen).toContain('<CreateFarmWorkspace')
    expect(screen).not.toContain('<FarmsFinishedFarmsModule')
    expect(screen).not.toContain('<FarmsYieldAdvisorModule')
    expect(screen).not.toContain('<FarmsAnalyticsModule')
  })
  it('hero artwork is animated CSS/SVG with MARCO logo and reduced-motion', () => {
    const art = readFileSync(path.join(STUDIO, 'modules/FarmsHeroArtwork.tsx'), 'utf8')
    expect(art).toContain('keyframes')
    expect(art).toContain('prefers-reduced-motion')
    expect(art).toContain('0x963556de0eb8138E97A85F0A86eE0acD159D210b')
    expect(art).toContain('MARCO Rewards')
  })

  it('Active Farmers KPI never invents zero while loading', () => {
    const kpi = readFileSync(path.join(STUDIO, 'modules/buildFarmsOverviewKpis.ts'), 'utf8')
    expect(kpi).toContain('Indexing…')
    expect(kpi).toContain('Unique wallets that participated in Melega DEX farms')
    expect(kpi).toContain("'activeFarmers'")
    // Uncertified Active Farmers renders as em-dash (Global Data Truth), never invented zero.
    expect(kpi).toMatch(/activeFarmers[\s\S]{0,80}'—'/)
  })

  it('Position cards expose chain-aware View Farm / View LP explorer links', () => {
    const my = readFileSync(path.join(STUDIO, 'modules/FarmsMyFarmCard.tsx'), 'utf8')
    expect(my).toContain('View Farm')
    expect(my).toContain('View LP')
    expect(my).toContain('getBlockExploreLink')
    expect(my).not.toContain('bscscan.com/address/')
    const featured = readFileSync(path.join(STUDIO, 'modules/FarmsHeroFeaturedCompact.tsx'), 'utf8')
    expect(featured).toContain('Farm Contract ↗')
    expect(featured).toContain('LP Contract ↗')
    expect(featured).toContain('masterChefExplorerUrl')
  })
  it('Explore Farms card exposes compact Farm/LP contract links', () => {
    const src = readFileSync(path.join(STUDIO, 'modules/FarmsExploreFarmCard.tsx'), 'utf8')
    expect(src).toContain('View Farm')
    expect(src).toContain('View LP')
    expect(src).toContain('getBlockExploreLink')
  })
  it('featured selection prefers TVL then APR then pid and reads BigNumber liquidity', () => {
    const fmt = readFileSync(path.join(STUDIO, 'farmsRuntime/formatFarmsRuntime.ts'), 'utf8')
    expect(fmt).toContain('tie-break by lowest pid')
    expect(fmt).toContain('emissionState !== \'active\'')
    expect(fmt).toContain('farmLiquidityUsd')
    expect(fmt).toContain('resolveFarmLiquidityUsd')

    const selected = selectFeaturedFarm([
      card({ pid: 3, liq: 50_000, apr: '40%' }),
      card({ pid: 1, liq: 200_000, apr: '10%' }),
      card({ pid: 2, liq: 200_000, apr: '36%' }),
      card({ pid: 9, liq: 0, apr: '99%' }),
    ])
    // Highest TVL wins; among equal TVL highest APR; BigNumber liquidity must not zero-out eligibility
    expect(selected?.pid).toBe(2)
  })

  it('unique-farmers API exposes provenance + indexing status', () => {
    const api = readFileSync(path.join(WEB, 'pages/api/farms/unique-farmers.ts'), 'utf8')
    expect(api).toContain('coveragePct')
    expect(api).toContain('deploymentBlock')
    expect(api).toContain('advanceFarmerParticipantIndex')
    expect(api).toContain('uniqueFarmers:')
    expect(api).toContain('snap.primaryCount')
    expect(api).toContain('lastIndexedBlock')
  })

  it('MasterChef topics match Melega ABI keccak (not Pancake V2)', () => {
    const topics = readFileSync(path.join(WEB, 'lib/bsc-indexer/indexer/masterchefTopics.ts'), 'utf8')
    expect(topics).toContain('0x90890809c654f11d6e72a28fa60149770a0d11ec6c92319d6ceb2bb0a4ea1a15')
    expect(topics).not.toContain('0x90890809c654f11f630942b0e6f67ee8cb438cbdfb1d1f45533e7576391dc195')
    expect(topics).toContain('deploymentBlock: 20_330_833')
  })

  it('Explore desktop targets 4 cards per row at 1440', () => {
    const mod = readFileSync(path.join(STUDIO, 'modules/FarmsExploreFarmsModule.tsx'), 'utf8')
    expect(mod).toContain('repeat(4, minmax(0, 1fr))')
  })
})
