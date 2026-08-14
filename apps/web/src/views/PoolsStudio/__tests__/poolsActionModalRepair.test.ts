/**
 * Pools/Farms action modal repair — orphan overlay guards + Create Pool permanence.
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'
import { activeBlocksInWindow, buildPools24hRewards } from '../modules/buildPools24hRewards'
import {
  describeCreatePoolFee,
  describeCreateFarmFee,
  MELEGA_TREASURY_FEE_DESTINATION,
} from 'config/constants/feeSchedule'
import { createDefaultWizardState, deriveDailyRewards } from '../components/createPoolWizardState'
import BigNumber from 'bignumber.js'

const WEB = path.resolve(__dirname, '../../../../')
const STUDIO = path.resolve(__dirname, '..')

describe('Pools/Farms action modal repair', () => {
  it('PoolsActionHost disables updateOnPropsChange and never presents empty fragment', () => {
    const src = readFileSync(path.join(STUDIO, 'poolsRuntime/PoolsActionHost.tsx'), 'utf8')
    expect(src).toContain('updateOnPropsChange must stay false')
    expect(src).not.toMatch(/useModal\(\s*<>\s*<\/>/)
    expect(src).toMatch(/useModal\([^)]+,\s*true,\s*false/)
    expect(src).toContain('clearModal()')
    expect(src).toContain('StakeModalPlaceholder')
  })

  it('resolves stake capacity from the live wallet balance before opening the modal', () => {
    const host = readFileSync(path.join(STUDIO, 'poolsRuntime/PoolsActionHost.tsx'), 'utf8')
    const modal = readFileSync(path.join(STUDIO, '../Pools/components/Modals/StakeModal.tsx'), 'utf8')

    expect(host).toContain('useLiveCurrencyBalance')
    expect(host).toContain('if (!stakeBalanceResolved) return')
    expect(modal).toContain('userDataStakingTokenBalance={stakingTokenBalance}')
    expect(modal).not.toContain('userDataStakingTokenBalance={userData.stakingTokenBalance}')
  })

  it('FarmsActionHost opens Harvest confirmation dialog instead of auto-executing', () => {
    const host = readFileSync(path.join(STUDIO, '../FarmsStudio/farmsRuntime/FarmsActionHost.tsx'), 'utf8')
    const harvest = readFileSync(path.join(STUDIO, '../FarmsStudio/farmsRuntime/FarmHarvestConfirmModal.tsx'), 'utf8')
    expect(host).toContain('FarmHarvestConfirmModal')
    expect(host).toMatch(/useModal\([^)]+,\s*true,\s*false/)
    expect(host).not.toContain('handleHarvest().finally(clearModal)')
    expect(harvest).toContain('Confirm Harvest')
    expect(harvest).toContain('data-farms-harvest-modal')
  })

  it('shared Overlay uses premium neutral dim and z-index 0 under modal content', () => {
    const overlay = readFileSync(path.join(WEB, '../../packages/uikit/src/components/Overlay/Overlay.tsx'), 'utf8')
    expect(overlay).toContain('rgba(2, 3, 4, 0.74)')
    expect(overlay).toContain('backdrop-filter: blur(8px)')
    expect(overlay).toContain('z-index: 0')
    expect(overlay).not.toContain('theme.colors.text99')
  })

  it('uses the canonical MelegaDEX lockup and a continuous slider in pool dialogs', () => {
    const modal = readFileSync(path.join(WEB, '../../packages/uikit/src/widgets/Modal/Modal.tsx'), 'utf8')
    const slider = readFileSync(path.join(WEB, '../../packages/uikit/src/components/Slider/styles.ts'), 'utf8')
    const stake = readFileSync(path.join(WEB, '../../packages/uikit/src/widgets/Pool/StakeModal.tsx'), 'utf8')

    expect(modal).toContain('<ModalBrandText>')
    expect(modal).toContain('<strong>DEX</strong>')
    expect(modal).not.toContain('ModalBrandProduct')
    expect(slider).toContain('BarProgress')
    expect(slider).toContain('::-webkit-slider-thumb')
    expect(slider).not.toContain('background-image: url(${bunnyHead})')
    expect(stake).toContain('aria-hidden="true"')
  })

  it('opens wallet connect instead of an empty stake dialog when no account is connected', () => {
    const card = readFileSync(path.join(STUDIO, 'modules/PoolsExplorePoolCard.tsx'), 'utf8')
    const list = readFileSync(path.join(STUDIO, 'modules/PoolsExplorePoolsModule.tsx'), 'utf8')
    const featured = readFileSync(path.join(STUDIO, 'modules/PoolsHeroFeaturedCompact.tsx'), 'utf8')

    expect(card).toContain("pool.primaryAction === 'Connect Wallet'")
    expect(card).toContain('<ConnectBtn')
    expect(list).toContain('<ConnectActionBtn')
    expect(featured).toContain('account ? (')
    expect(featured).toContain('<ConnectBtn')
  })

  it('Create Pool is permanently expanded with canonical fee display', () => {
    const cta = readFileSync(path.join(STUDIO, 'components/CreatePoolCta.tsx'), 'utf8')
    expect(cta).toContain('data-ps-create-pool-permanently-expanded')
    expect(cta).toContain('describeWizardCreatePoolFee')
    expect(cta).toContain('Review Pool Creation')
    expect(cta).not.toContain('data-ps-create-pool-compact')
    expect(cta).not.toMatch(/setExpanded\(false\)/)
    expect(cta).not.toContain('Continue in Build Studio')
    expect(cta).not.toContain('<Label>Deposit Fee</Label>')
  })

  it('derives daily emission from budget and duration', () => {
    expect(deriveDailyRewards({ ...createDefaultWizardState(), rewardBudget: '1000', emissionDuration: '30' })).toBe(
      '33.33333333',
    )
  })

  it('Create Pool fee free for MARCO staking and 0.25 otherwise', () => {
    expect(describeCreatePoolFee(true).display).toBe('FREE')
    expect(describeCreatePoolFee(false).display).toBe('0.25 BNB')
    expect(describeCreatePoolFee(true).recipient).toBe(MELEGA_TREASURY_FEE_DESTINATION)
  })

  it('Create Pool executes through the certified public adapter', () => {
    const cta = readFileSync(path.join(STUDIO, 'components/CreatePoolCta.tsx'), 'utf8')
    expect(cta).toContain('buildPoolCreationPlan')
    expect(cta).toContain('executePoolCreation')
    expect(cta).toContain('MARCO reward pools require the authorized MELEGA DEPLOYER')
    expect(cta).toContain('Non-MARCO reward pools are permissionless')
  })

  it('Create Farm fee priority rules', () => {
    expect(describeCreateFarmFee({ rewardTokenIsMarco: true, pairContainsMarco: true }).display).toBe('1.00 BNB')
    expect(describeCreateFarmFee({ rewardTokenIsMarco: false, pairContainsMarco: true }).display).toBe('FREE')
    expect(describeCreateFarmFee({ rewardTokenIsMarco: false, pairContainsMarco: false }).display).toBe('0.25 BNB')
  })

  it('aggregates Pools 24H rewards from tokenPerBlock with partial pricing', () => {
    const windowBlocks = activeBlocksInWindow({
      startBlock: 100,
      endBlock: 200,
      windowStart: 150,
      windowEnd: 180,
    })
    expect(windowBlocks).toBe(31)

    const priced = buildPools24hRewards({
      pools: [
        {
          sousId: 1,
          tokenPerBlock: new BigNumber('1000000000000000000'),
          earningToken: { symbol: 'MARCO', decimals: 18 },
          earningTokenPrice: 2,
          stakingToken: { symbol: 'BNB' },
          startBlock: 0,
          endBlock: 0,
          isFinished: false,
        } as any,
        {
          sousId: 2,
          tokenPerBlock: new BigNumber('1000000000000000000'),
          earningToken: { symbol: 'UNK', decimals: 18 },
          earningTokenPrice: 0,
          stakingToken: { symbol: 'USDT' },
          startBlock: 0,
          endBlock: 0,
          isFinished: false,
        } as any,
      ],
      currentBlock: 28800,
      updatedAt: '2026-07-15T00:00:00.000Z',
    })
    expect(priced.status).toBe('partial')
    expect(priced.pricedUsd).toBeGreaterThan(0)
    expect(priced.unpricedTokenCount).toBe(1)
    expect(priced.methodology).toBe('reward_rate_x_active_blocks_in_rolling_24h')
  })

  it('standalone Finished Farms section is unmounted; Create Farm present', () => {
    const screen = readFileSync(path.join(STUDIO, '../FarmsStudio/FarmsStudioScreen.tsx'), 'utf8')
    expect(screen).not.toContain('<FarmsFinishedFarmsModule')
    expect(screen).toContain('CreateFarmWorkspace')
    expect(screen).toContain('data-farms-create-farm="modal"')
  })

  it('Treasury Runtime remains absent from fee helpers', () => {
    const fee = readFileSync(path.join(WEB, 'src/config/constants/feeSchedule.ts'), 'utf8')
    const schedule = readFileSync(path.join(WEB, 'src/config/constants/fee-schedule.json'), 'utf8')
    expect(fee).not.toMatch(/Treasury Runtime/i)
    // SSOT may document decommission; no live fee path may settle to Treasury Runtime.
    expect(fee).not.toMatch(/treasuryRuntime|TREASURY_RUNTIME/i)
    expect(schedule).toContain('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
    expect(fee).toContain('MELEGA_TREASURY_FEE_DESTINATION')
    expect(describeCreatePoolFee(false).recipient).toBe(MELEGA_TREASURY_FEE_DESTINATION)
    expect(describeCreateFarmFee({ rewardTokenIsMarco: true, pairContainsMarco: false }).recipient).toBe(
      MELEGA_TREASURY_FEE_DESTINATION,
    )
  })
})
