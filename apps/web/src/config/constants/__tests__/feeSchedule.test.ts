import { describe, expect, it } from 'vitest'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_BNB,
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FEE_RECIPIENT,
} from 'config/constants/createTokenFactoryDeployment'
import {
  assertTreasuryDestination,
  getFounderFeeSchedule,
  MELEGA_TREASURY_FEE_DESTINATION,
  resolveCreateFarmFeeBnb,
  resolveCreatePoolFeeBnb,
} from 'config/constants/feeSchedule'
import { FEATURED_OFFER } from 'lib/featured-placement/constants'

const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'

describe('MELEGA_DEX_V1_FEE_SCHEDULE_FOUNDER_GOVERNANCE_FINALIZATION', () => {
  it('loads Founder fee-schedule.json as canonical SSOT', () => {
    const schedule = getFounderFeeSchedule()
    expect(schedule.schema).toBe('melega.dex.v1.founder-fee-schedule')
    expect(schedule.status).toBe('FOUNDER_APPROVED')
    expect(schedule.treasury.address).toBe(TREASURY)
    expect(schedule.treasury.treasuryRuntime).toBe('FORBIDDEN_IN_DEX_FEE_PATH')
  })

  it('Create Token fee is 0.10 BNB / 1e17 wei and supersedes 0.05', () => {
    const ct = getFounderFeeSchedule().services.createToken
    expect(ct.fee.bnb).toBe('0.10')
    expect(ct.fee.wei).toBe('100000000000000000')
    expect(BigInt(ct.fee.wei)).toBe(10n ** 17n)
    expect(CREATE_TOKEN_CREATION_FEE_BNB).toBe('0.10')
    expect(CREATE_TOKEN_CREATION_FEE_WEI).toBe('100000000000000000')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeDecision).toBe('APPROVED')
    expect(CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress?.toLowerCase()).toBe(
      '0x6dbb5d7162842da94ef9172aedc8d148d203d311',
    )
    expect(getFounderFeeSchedule().supersedes[0].priorCreateTokenFeeBnb).toBe('0.05')
  })

  it('every service destination is MELEGA TREASURY WALLET', () => {
    const s = getFounderFeeSchedule().services
    expect(s.smartRouter.destination).toBe(TREASURY)
    expect(s.createToken.destination).toBe(TREASURY)
    expect(s.createPool.destination).toBe(TREASURY)
    expect(s.createFarm.destination).toBe(TREASURY)
    expect(s.featuredProject.destination).toBe(TREASURY)
    expect(s.liquidityBuilder.destination).toBe(TREASURY)
    expect(assertTreasuryDestination(CREATE_TOKEN_FEE_RECIPIENT)).toBe(true)
    expect(MELEGA_TREASURY_FEE_DESTINATION).toBe(TREASURY)
  })

  it('Smart Router / Create Pool / Create Farm / Featured / LB match Founder schedule', () => {
    const s = getFounderFeeSchedule().services
    expect(s.smartRouter.fee.percent).toBe(25)
    expect(resolveCreatePoolFeeBnb(true)).toBe('0')
    expect(resolveCreatePoolFeeBnb(false)).toBe('0.25')
    expect(resolveCreateFarmFeeBnb({ rewardTokenIsMarco: true, pairContainsMarco: false })).toBe('1.00')
    expect(resolveCreateFarmFeeBnb({ rewardTokenIsMarco: false, pairContainsMarco: true })).toBe('0')
    expect(resolveCreateFarmFeeBnb({ rewardTokenIsMarco: false, pairContainsMarco: false })).toBe('0.25')
    expect(FEATURED_OFFER.usdPrice).toBe(99)
    expect(FEATURED_OFFER.durationDays).toBe(7)
    expect(FEATURED_OFFER.marcoCashbackPct).toBe(5)
    expect(FEATURED_OFFER.acceptedAssets).toEqual(['BNB', 'USDT', 'USDC', 'MARCO'])
    expect(FEATURED_OFFER.treasuryWallet).toBe(TREASURY)
    expect(s.liquidityBuilder.fee.percent).toBe(10)
    expect(s.liquidityBuilder.fee.bps).toBe(1000)
    expect(s.liquidityBuilder.certifiedExecutionModel.lockedSuccessFeeBps).toBe(1000)
  })
})
