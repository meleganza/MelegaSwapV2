import { describe, expect, it } from 'vitest'
import { resolvePublicFarmFactoryFee, PUBLIC_FARM_FACTORY_FEE_POLICY } from '../modules/publicFarmFactoryFee'
import { MELEGA_TREASURY_FEE_DESTINATION } from 'config/constants/feeSchedule'
import { createDefaultPublicFarmFactoryDraft, parseReturnToCreateFarm } from '../modules/publicFarmFactoryDraft'
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

describe('publicFarmFactory inline liquidity + draft', () => {
  it('keeps pair creation and liquidity inside the Create Farm accordion', () => {
    const root = path.resolve(__dirname, '..')
    const workspace = readFileSync(path.join(root, 'modules/PublicFarmFactoryWorkspace.tsx'), 'utf8')
    const inline = readFileSync(path.join(root, 'modules/FarmInlineLiquidityStep.tsx'), 'utf8')
    expect(workspace).toContain('create-farm-acc-liquidity')
    expect(workspace).toContain('public-farm-inline-liquidity-open')
    expect(workspace).not.toContain('buildManualLiquidityHandoffUrl')
    expect(workspace).not.toContain('buildCreatePairHandoffUrl')
    expect(inline).toContain('LiquidityRuntimeProvider')
    expect(inline).toContain('<LiquidityAddModule embedded />')
  })

  it('creates a durable draft before any wallet action', () => {
    const draft = createDefaultPublicFarmFactoryDraft()
    expect(draft.draftId).toMatch(/^pff-/)
  })

  it('parses return-to-Create-Farm query', () => {
    expect(parseReturnToCreateFarm('?return=create-farm&draftId=abc').returning).toBe(true)
    expect(parseReturnToCreateFarm('?return=create-farm&draftId=abc').draftId).toBe('abc')
  })
})

describe('publicFarmFactory capability + indexer', () => {
  it('outcome B — MasterBuilder not exposed', () => {
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.outcome).toBe('A_PERMISSIONLESS_FACTORY_AVAILABLE')
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.masterBuilderExposed).toBe(false)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.contracts.publicFarmFactory?.toLowerCase()).toBe(
      '0x89ffa439b197fe98f0f5388e00edf1ebfd80d7e9',
    )
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.deployment.status).toBe('READY')
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.readyForFounderSignature).toBe(false)
    expect(PUBLIC_FARM_FACTORY_CAPABILITY.readiness.walletCanExecute).toBe(true)
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
    const factory = readFileSync(path.join(root, 'contracts/public-farm-factory/PublicFarmFactoryV1.sol'), 'utf8')
    expect(factory).toContain('MarcoRewardForbidden')
    expect(factory).toContain('0.25 ether')
    expect(factory).toContain('emit FarmCreated')
    expect(factory).not.toMatch(/MasterChef\.add/)
    expect(factory).toContain('Does not expose MasterBuilder')
    expect(factory).toContain('eligibilitySigner')
  })
})
