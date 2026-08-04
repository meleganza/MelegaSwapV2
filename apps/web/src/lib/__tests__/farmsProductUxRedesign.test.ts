/**
 * Farms product UX redesign — unit contracts.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { LIVE_CHAIN_FILTERS } from 'lib/data-truth/globalYieldInventory'
import { FARMS_HERO_COPY } from 'views/FarmsStudio/modules/farmsHeroTokens'
import { CREATE_FARM_RETURN_PATH } from 'views/FarmsStudio/modules/publicFarmFactoryDraft'
import { farmsExplore } from 'views/FarmsStudio/modules/farmsExploreFarmsTokens'

const ROOT = path.resolve(__dirname, '../..')
const load = (rel: string) => readFileSync(path.join(ROOT, rel), 'utf8')

describe('farms product UX redesign', () => {
  it('Hero primary CTA is Create Farm; Explore is secondary', () => {
    expect(FARMS_HERO_COPY.primaryCta).toBe('Create Farm')
    expect(FARMS_HERO_COPY.secondaryCta).toBe('Explore Farms')
    const hero = load('views/FarmsStudio/modules/FarmsHeroModule.tsx')
    expect(hero).toContain('farms-hero-create-farm')
    expect(hero).toContain('onRequestCreateFarm')
  })

  it('Create Farm opens as modal — not a permanent page column', () => {
    const screen = load('views/FarmsStudio/FarmsStudioScreen.tsx')
    expect(screen).toContain('create-farm-modal')
    expect(screen).toContain("data-farms-create-farm=\"modal\"")
    expect(screen).toContain('melega:open-create-farm')
    expect(screen.indexOf('<FarmsHeroModule')).toBeLessThan(screen.indexOf('<FarmsOverviewKpisModule'))
    expect(screen.indexOf('<FarmsOverviewKpisModule')).toBeLessThan(screen.indexOf('<FarmsMyFarmsModule'))
    expect(screen.indexOf('<FarmsMyFarmsModule')).toBeLessThan(screen.indexOf('<FarmsExploreFarmsModule'))
    expect(screen).not.toContain('FarmsYieldAdvisorModule')
    expect(screen).not.toContain('FarmsAnalyticsModule')
    expect(screen).not.toContain('FarmsActivityTable')
    expect(CREATE_FARM_RETURN_PATH).toContain('create=1')
  })

  it('Explore cards are compact with Stake/Manage/View Farm/View LP and activity pulse', () => {
    expect(Number.parseInt(farmsExplore.cardH, 10)).toBeLessThanOrEqual(260)
    const card = load('views/FarmsStudio/modules/FarmsExploreFarmCard.tsx')
    expect(card).toContain('MelegaExploreChainBadge')
    expect(card).toContain('farms-explore-stake')
    expect(card).toContain('farms-explore-manage')
    expect(card).toContain('farms-explore-view-farm')
    expect(card).toContain('farms-explore-view-lp')
    expect(card).toContain('farms-explore-activity')
    expect(card).toContain('ActivityPulse')
  })

  it('unified multichain filters cover required LIVE chains', () => {
    const labels = LIVE_CHAIN_FILTERS.map((f) => f.label)
    expect(labels).toEqual(['All', 'BNB', 'Base', 'Polygon', 'Ethereum', 'Arbitrum', 'Avalanche'])
  })

  it('Create Farm workspace still discloses fee before confirmation', () => {
    const ui = load('views/FarmsStudio/modules/PublicFarmFactoryWorkspace.tsx')
    expect(ui).toContain('create-farm-fee')
    expect(ui).toContain('create-farm-advanced-toggle')
    expect(ui).toContain('create-farm-submit')
  })
})
