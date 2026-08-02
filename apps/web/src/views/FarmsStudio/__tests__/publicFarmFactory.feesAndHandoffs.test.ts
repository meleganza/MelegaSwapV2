import { describe, expect, it } from 'vitest'
import { resolvePublicFarmFactoryFee, PUBLIC_FARM_FACTORY_FEE_POLICY } from '../modules/publicFarmFactoryFee'
import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import {
  buildAiBuilderHandoffUrl,
  buildCreatePairHandoffUrl,
  buildManualLiquidityHandoffUrl,
  createDefaultPublicFarmFactoryDraft,
  parseReturnToCreateFarm,
} from '../modules/publicFarmFactoryDraft'
import { MARCO_REWARD_REJECTION_MESSAGE } from '../modules/publicFarmEligibility'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from '../modules/publicFarmFactoryCapability'
import { dedupeCanonicalFarms, PUBLIC_FARM_CREATED_TOPIC0 } from 'lib/bsc-indexer/indexer/publicFarmFactoryTopics'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const TREASURY = '0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b'

describe('publicFarmFactory fees', () => {
  it('rejects MARCO reward — no 1 BNB public path', () => {
    const fee = resolvePublicFarmFactoryFee({ rewardToken: 'MARCO', pairContainsMarco: true })
    expect(fee.ok).toBe(false)
    if (!fee.ok) {
      expect(fee.reason).toBe('MARCO_REWARD_UNSUPPORTED')
      expect(fee.message).toBe(MARCO_REWARD_REJECTION_MESSAGE)
      expect(fee.recipient).toBe(TREASURY)
    }
  })

  it('FREE when non-MARCO reward and pair contains MARCO', () => {
    const fee = resolvePublicFarmFactoryFee({ rewardToken: 'USDT', pairContainsMarco: true })
    expect(fee.ok).toBe(true)
    if (fee.ok) {
      expect(fee.isFree).toBe(true)
      expect(fee.feeBnb).toBe('0')
      expect(fee.fee.display).toBe('FREE')
      expect(fee.fee.recipient).toBe(MELEGA_TREASURY_FEE_DESTINATION)
    }
  })

  it('0.25 BNB when non-MARCO reward and pair without MARCO', () => {
    const fee = resolvePublicFarmFactoryFee({ rewardToken: 'USDT', pairContainsMarco: false })
    expect(fee.ok).toBe(true)
    if (fee.ok) {
      expect(fee.feeBnb).toBe('0.25')
      expect(fee.fee.display).toBe('0.25 BNB')
    }
  })

  it('documents Public Factory fee policy and forbids treasury runtime', () => {
    expect(PUBLIC_FARM_FACTORY_FEE_POLICY.treasuryRuntime).toBe('FORBIDDEN')
    expect(PUBLIC_FARM_FACTORY_FEE_POLICY.marcoReward).toBe('UNSUPPORTED')
    expect(PUBLIC_FARM_FACTORY_FEE_POLICY.recipient).toBe(TREASURY)
  })
})

describe('publicFarmFactory handoffs + draft', () => {
  it('create pair handoff preserves draftId and return destination', () => {
    const draft = createDefaultPublicFarmFactoryDraft()
    const href = buildCreatePairHandoffUrl(draft)
    expect(href.startsWith('/add?')).toBe(true)
    expect(href).toContain(`draftId=${draft.draftId}`)
    expect(href).toContain('return=create-farm')
  })

  it('manual liquidity handoff preloads pair + missing TVL', () => {
    const draft = createDefaultPublicFarmFactoryDraft()
    draft.selectedPair = {
      pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      lpTokenAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token0: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      token1: '0x55d398326f99059ff775485246999027b3197955',
      symbol0: 'BNB',
      symbol1: 'USDT',
      classification: 'tradeable',
      reserve0: '1',
      reserve1: '1',
      sourceBlock: 1,
    }
    const href = buildManualLiquidityHandoffUrl(draft, 0.15)
    expect(href).toContain('/add/')
    expect(href).toContain('missingTvlBnb=0.15')
    expect(href).toContain(`draftId=${draft.draftId}`)
    expect(href).toContain('return=create-farm')
  })

  it('Builder blocked when undeployed — manual liquidity handoff remains', () => {
    const draft = createDefaultPublicFarmFactoryDraft()
    const blocked = buildAiBuilderHandoffUrl(draft, 0.15, false)
    expect(blocked.blocked).toBe(true)
    expect(buildManualLiquidityHandoffUrl(draft, 0.15)).toContain('/add')
    // UI surfaces Increase Liquidity / Add Liquidity Manually — no protocol wording.
  })

  it('Builder preload when available includes recommended budget', () => {
    const draft = createDefaultPublicFarmFactoryDraft()
    draft.selectedPair = {
      pairAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      lpTokenAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      token0: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
      token1: '0x55d398326f99059ff775485246999027b3197955',
      symbol0: 'BNB',
      symbol1: 'USDT',
      classification: 'tradeable',
      reserve0: '1',
      reserve1: '1',
      sourceBlock: 1,
    }
    const open = buildAiBuilderHandoffUrl(draft, 0.15, true)
    expect(open.blocked).toBe(false)
    expect(open.href).toContain('/liquidity-studio?')
    expect(open.href).toContain('recommendedBudgetBnb=')
    expect(open.href).toContain('return=create-farm')
  })

  it('parses return-to-Create-Farm query', () => {
    expect(parseReturnToCreateFarm('?return=create-farm&draftId=abc').returning).toBe(true)
    expect(parseReturnToCreateFarm('?return=create-farm&draftId=abc').draftId).toBe('abc')
  })
})

describe('publicFarmFactory capability + indexer', () => {
  it('outcome B — MasterBuilder not exposed', () => {
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.outcome).toBe('B_FACTORY_DEPLOYMENT_REQUIRED')
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.masterBuilderExposed).toBe(false)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.contracts.publicFarmFactory).toBeNull()
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.deployment.status).toBe('AWAITING_VALIDATION')
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.readyForFounderSignature).toBe(true)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute).toBe(false)
  })

  it('FarmCreated topic0 is deterministic and dedupe works', () => {
    expect(PUBLIC_FARM_CREATED_TOPIC0.startsWith('0x')).toBe(true)
    const farms = dedupeCanonicalFarms([
      {
        chainId: 56,
        farmAddress: '0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
        lpToken: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        rewardToken: '0xcccccccccccccccccccccccccccccccccccccccc',
        creator: '0xdddddddddddddddddddddddddddddddddddddddd',
        rewardBudget: '1',
        start: 1,
        end: 2,
        emission: '1',
        creationFee: '0',
        timestamp: 1,
        provenance: 'public_farm_factory',
        source: 'public_factory_event',
      },
      {
        chainId: 56,
        farmAddress: '0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB',
        lpToken: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        rewardToken: '0xcccccccccccccccccccccccccccccccccccccccc',
        creator: null,
        rewardBudget: null,
        start: null,
        end: null,
        emission: null,
        creationFee: null,
        timestamp: null,
        provenance: 'masterbuilder',
        source: 'masterchef_pool',
      },
      {
        chainId: 56,
        farmAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
        lpToken: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
        rewardToken: '0xcccccccccccccccccccccccccccccccccccccccc',
        creator: null,
        rewardBudget: null,
        start: null,
        end: null,
        emission: null,
        creationFee: null,
        timestamp: null,
        provenance: 'masterbuilder',
        source: 'masterchef_pool',
      },
    ])
    expect(farms).toHaveLength(2)
    expect(farms.some((f) => f.provenance === 'masterbuilder')).toBe(true)
    expect(farms.some((f) => f.provenance === 'public_farm_factory')).toBe(true)
  })

  it('factory package rejects MARCO and does not mention MasterBuilder exposure', () => {
    const root = path.resolve(__dirname, '../../../../../..')
    const factory = readFileSync(
      path.join(root, 'contracts/public-farm-factory/PublicFarmFactoryV1.sol'),
      'utf8',
    )
    expect(factory).toContain('MarcoRewardForbidden')
    expect(factory).toContain('0.25 ether')
    expect(factory).toContain('emit FarmCreated')
    expect(factory).not.toMatch(/MasterChef\.add/)
    expect(factory).toContain('Does not expose MasterBuilder')
    expect(factory).toContain('eligibilitySigner')
  })
})
