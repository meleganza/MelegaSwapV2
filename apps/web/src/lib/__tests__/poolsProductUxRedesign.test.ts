/**
 * MELEGASWAP_V2_POOLS_PRODUCT_UX_REDESIGN — unit gates.
 */
import { readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CREATE_POOL_FLOW_SECTIONS, WIZARD_STEP_LABELS } from 'views/PoolsStudio/components/createPoolWizardState'
import { LIVE_CHAIN_FILTERS } from 'lib/data-truth/globalYieldInventory'
import { POOLS_HERO_COPY, poolsHero } from 'views/PoolsStudio/modules/poolsHeroTokens'
import { poolsExplore } from 'views/PoolsStudio/modules/poolsExplorePoolsTokens'

const STUDIO = path.resolve(__dirname, '../../views/PoolsStudio')

describe('MELEGASWAP_V2_POOLS_PRODUCT_UX_REDESIGN', () => {
  it('locks product IA markers and modal create', () => {
    const screen = readFileSync(path.join(STUDIO, 'PoolsStudioScreen.tsx'), 'utf8')
    expect(screen).toContain('data-pools-ia="product-ux-redesign-v1"')
    expect(screen).toContain('data-pools-create-pool="modal"')
    expect(screen).toContain('create-pool-modal')
    expect(screen).not.toContain('<PoolsAnalyticsModule')
    expect(screen).toContain('variant="with-create-side"')
  })

  it('Create Pool flow covers required sections with compact stepper labels', () => {
    expect([...CREATE_POOL_FLOW_SECTIONS]).toEqual([
      'Stake Token',
      'Reward Token',
      'Reward Budget',
      'Emission Schedule',
      'Lock/Safety',
      'Review',
      'Create',
    ])
    expect([...WIZARD_STEP_LABELS]).toEqual(['Tokens', 'Rewards', 'Safety', 'Review'])
    const preview = readFileSync(path.join(STUDIO, 'components/CreatePoolWizardPreview.tsx'), 'utf8')
    expect(preview).toContain('data-ps-preview-stake')
    expect(preview).toContain('data-ps-preview-reward')
    expect(preview).toContain('data-ps-preview-chain')
    expect(preview).toContain('data-ps-preview-fee')
    expect(preview).toContain('data-ps-create-preview-compact')
  })

  it('Hero Create Pool + community CTA; compact explore cards', () => {
    expect(POOLS_HERO_COPY.primaryCta).toBe('Create Pool')
    expect(POOLS_HERO_COPY.communityCtaTitle).toContain('staking pool for your community')
    expect(poolsHero.communityCtaMaxW).toBe('340px')
    expect(poolsExplore.cardW).toBe('328px')
    expect(poolsExplore.cardH).toBe('248px')
    expect(poolsExplore.cardPad).toBe('12px')
  })

  it('unified multichain filters use short All label', () => {
    expect(LIVE_CHAIN_FILTERS.map((f) => f.label)).toEqual([
      'All',
      'BNB',
      'Base',
      'Polygon',
      'Ethereum',
      'Arbitrum',
      'Avalanche',
    ])
  })

  it('reward logos never blank — PoolTokenIcon falls back to TOKEN', () => {
    const prim = readFileSync(path.join(STUDIO, 'components/poolsStudioPrimitives.tsx'), 'utf8')
    expect(prim).toContain("|| 'TOKEN'")
    expect(prim).toContain('data-ps-token-icon')
  })
})
