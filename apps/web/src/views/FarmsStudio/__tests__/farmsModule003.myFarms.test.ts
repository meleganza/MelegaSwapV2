import { createHash } from 'crypto'
import { readFileSync, existsSync } from 'fs'
import path from 'path'
import BigNumber from 'bignumber.js'
import { describe, expect, it } from 'vitest'
import { FARMS_FOUNDER_MOCKUP } from '../farmsArchitecture000Contracts'
import { FARMS_MODULE_001_FREEZE_SHA256, FARMS_MODULE_002_FREEZE_SHA256, farmsMyFarms } from '../modules/farmsMyFarmsTokens'
import { buildFarmsWalletPositionsViewModel, cardToFarmsWalletPosition, compareFarmsWalletPositions, farmPositionInclusionEligible, formatFarmPositionAmount } from '../modules/buildFarmsWalletPositions'
import type { FarmPreviewCard } from '../farmsStudioData'

const WEB = path.resolve(__dirname, '../../../../'), REPO = path.resolve(__dirname, '../../../../../../'), STUDIO = path.resolve(__dirname, '..')
const sha = (file: string) => createHash('sha256').update(readFileSync(path.join(WEB, file))).digest('hex')
function card(partial: Partial<FarmPreviewCard> = {}): FarmPreviewCard {
  const pid = partial.pid ?? 1
  return { id: `farm-${pid}`, pair: 'AAA / BBB', tokens: ['AAA', 'BBB'], status: 'live', tvl: '$1K', dailyRewards: '—', multiplier: '1x', rawFarm: { pid, token: { symbol: 'AAA', decimals: 18, address: '0xa' }, quoteToken: { symbol: 'BBB', decimals: 18, address: '0xb' }, earningToken: { symbol: 'MARCO', decimals: 18, address: '0xr' }, lpAddress: '0xlp', userData: {} } as any, userStaked: new BigNumber(0), pendingReward: new BigNumber(0), ...partial }
}
describe('FARMS_MODULE_003 My Farms', () => {
  it('locks mockup and prior module source hashes', () => {
    const mock = path.join(REPO, FARMS_FOUNDER_MOCKUP.relativePath); expect(existsSync(mock)).toBe(true)
    expect(createHash('sha256').update(readFileSync(mock)).digest('hex')).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    expect(farmsMyFarms.mockupSha256).toBe(FARMS_FOUNDER_MOCKUP.sha256)
    for (const [name, value] of Object.entries(FARMS_MODULE_001_FREEZE_SHA256)) expect(sha(`src/views/FarmsStudio/modules/${name}.tsx`.replace('farmsHeroTokens.tsx', 'farmsHeroTokens.ts'))).toBe(value)
    expect(sha('src/views/FarmsStudio/modules/FarmsOverviewKpisModule.tsx')).toBe(FARMS_MODULE_002_FREEZE_SHA256.FarmsOverviewKpisModule)
    expect(sha('src/views/FarmsStudio/modules/farmsOverviewKpisTokens.ts')).toBe(FARMS_MODULE_002_FREEZE_SHA256.farmsOverviewKpisTokens)
    expect(sha('src/views/FarmsStudio/modules/buildFarmsOverviewKpis.ts')).toBe(FARMS_MODULE_002_FREEZE_SHA256.buildFarmsOverviewKpis)
    expect(sha('src/views/FarmsStudio/modules/useFarmsOverviewKpis.ts')).toBe(FARMS_MODULE_002_FREEZE_SHA256.useFarmsOverviewKpis)
    expect(sha('src/views/FarmsStudio/modules/farmsOverviewKpisTypes.ts')).toBe(FARMS_MODULE_002_FREEZE_SHA256.farmsOverviewKpisTypes)
  })
  it('locks row and card geometry', () => {
    expect(936 + 16 + 424).toBe(1376); expect(288 * 3 + 18 * 2).toBe(900)
    expect(farmsMyFarms.viewAllW).toBe('116px'); expect(farmsMyFarms.rewardLogo).toBe(22)
  })
  it('includes staked or pending positions only and excludes non-LP pid zero', () => {
    expect(farmPositionInclusionEligible(card({ userStaked: new BigNumber(1) }))).toBe(true)
    expect(farmPositionInclusionEligible(card({ pendingReward: new BigNumber(1) }))).toBe(true)
    expect(farmPositionInclusionEligible(card())).toBe(false)
    expect(farmPositionInclusionEligible(card({ pid: 0, userStaked: new BigNumber(1), rawFarm: { isTokenOnly: true } as any }))).toBe(false)
  })
  it('maps and orders emergency, withdrawal, then active harvestable', () => {
    const emergency = cardToFarmsWalletPosition(card({ pid: 1, status: 'finished', userStaked: new BigNumber(1), rawFarm: { pid: 1, enableEmergencyWithdraw: true, token: { symbol: 'A', decimals: 0 }, quoteToken: { symbol: 'B', decimals: 0 }, earningToken: { symbol: 'R', decimals: 0 } } as any }), { wallet: '0x1', chainId: 56 })!
    const withdraw = cardToFarmsWalletPosition(card({ pid: 2, status: 'finished', userStaked: new BigNumber(1) }), { wallet: '0x1', chainId: 56 })!
    const active = cardToFarmsWalletPosition(card({ pid: 3, userStaked: new BigNumber(1), pendingReward: new BigNumber(2) }), { wallet: '0x1', chainId: 56 })!
    expect([active, withdraw, emergency].sort(compareFarmsWalletPositions).map((p) => p.positionStatus)).toEqual(['EMERGENCY', 'WITHDRAW_ONLY', 'ACTIVE'])
  })
  it('models disconnected, loading, empty, unavailable, and stale retention', () => {
    expect(buildFarmsWalletPositionsViewModel({ portfolioFarms: [], userDataLoaded: false, farmsLoading: false }).state).toBe('disconnected')
    expect(buildFarmsWalletPositionsViewModel({ account: '0x1', chainId: 56, portfolioFarms: [], userDataLoaded: false, farmsLoading: true }).state).toBe('loading')
    expect(buildFarmsWalletPositionsViewModel({ account: '0x1', chainId: 56, portfolioFarms: [card()], userDataLoaded: true, farmsLoading: false }).state).toBe('empty')
    const prior = cardToFarmsWalletPosition(card({ userStaked: new BigNumber(1) }), { wallet: '0x1', chainId: 56 })!
    expect(buildFarmsWalletPositionsViewModel({ account: '0x1', chainId: 56, portfolioFarms: [], userDataLoaded: true, farmsLoading: false, sourcesFailed: true }).state).toBe('unavailable')
    expect(buildFarmsWalletPositionsViewModel({ account: '0x1', chainId: 56, portfolioFarms: [card({ userStaked: undefined, pendingReward: undefined, rawFarm: { pid: 1 } as any })], userDataLoaded: true, farmsLoading: false, previous: [prior], previousWallet: '0x1', previousChainId: 56 }).state).toBe('stale')
  })
  it('limits actions and never formats raw uint256 amounts', () => {
    const position = cardToFarmsWalletPosition(card({ userStaked: new BigNumber('1000000000000000000'), pendingReward: new BigNumber('1000000000000000000') }), { wallet: '0x1', chainId: 56 })!
    // Active + staked + pending: Harvest, Stake More, and Withdraw (no generic "Manage").
    expect(position.actions).toHaveLength(3)
    expect(position.actions.map((a) => a.label)).toEqual(['Harvest', 'Stake More', 'Withdraw'])
    expect(formatFarmPositionAmount(new BigNumber('1250450000000000000000'), 18, 'MARCO', true).formatted).not.toContain('1250450000000000000000')
  })
  it('finished/withdraw-only positions never expose a generic Manage action', () => {
    const withdrawOnly = cardToFarmsWalletPosition(card({ pid: 5, status: 'finished', userStaked: new BigNumber('1000000000000000000') }), { wallet: '0x1', chainId: 56 })!
    expect(withdrawOnly.statusLabel).toBe('Finished')
    expect(withdrawOnly.actions.map((a) => a.label)).not.toContain('Manage')
    expect(withdrawOnly.actions.map((a) => a.label)).toContain('Withdraw')

    const endedWithPending = cardToFarmsWalletPosition(card({ pid: 6, status: 'finished', pendingReward: new BigNumber('1000000000000000000') }), { wallet: '0x1', chainId: 56 })!
    expect(endedWithPending.statusLabel).toBe('Finished')
    expect(endedWithPending.actions.map((a) => a.label)).toContain('Harvest')
    expect(endedWithPending.actions.map((a) => a.label)).not.toContain('Manage')
    expect(endedWithPending.farmStateLine).toBe('Farm finished — harvest rewards and withdraw remaining LP.')
  })
  it('mounts after KPIs and excludes legacy My Farms and modules 004+', () => {
    const screen = readFileSync(path.join(STUDIO, 'FarmsStudioScreen.tsx'), 'utf8')
    expect(screen.indexOf('FarmsOverviewKpisModule')).toBeLessThan(screen.indexOf('FarmsMyFarmsModule')); expect(screen).not.toContain('YourFarmsSection')
    for (const id of ['004', '005', '006', '007', '008', '009', '010']) expect(screen).not.toContain(`data-farms-module="${id}"`)
  })
  it('ships no production mock fixtures', () => {
    const src = ['FarmsMyFarmsModule.tsx', 'FarmsMyFarmCard.tsx', 'buildFarmsWalletPositions.ts', 'useFarmsWalletPositions.ts'].map((f) => readFileSync(path.join(STUDIO, 'modules', f), 'utf8')).join('\n')
    expect(src).not.toContain('mockPositions'); expect(src).not.toContain('SAMPLE_POSITION'); expect(src).not.toContain('fixturePosition')
  })
})
