import { describe, expect, it } from 'vitest'
import type { PoolPreviewCard } from '../../poolsStudioData'
import {
  deduplicatePoolPreviewCards,
  resolvePoolCardIdentity,
} from '../poolCardInventoryDedup'
import { parseClassificationCounts, resolveKpiLifecycleFields } from '../poolClassificationSummary'

const MASTER_CHEF = '0x41D5487836452d23f2c467070244E5842B412794'
const CHAIN_ID = 56

function makeCard(overrides: Partial<PoolPreviewCard> & Pick<PoolPreviewCard, 'id' | 'contractAddress'>): PoolPreviewCard {
  return {
    name: overrides.name ?? overrides.id,
    tokens: ['MARCO', 'MARCO'],
    stakeToken: 'MARCO',
    apr: '—',
    status: 'ended',
    displayStatus: 'ENDED',
    visibilityStatus: 'DISCOVERABLE',
    discoveryClass: 'inactive',
    lifecycle: {
      contractVerified: true,
      started: true,
      ended: true,
      rewardBalancePositive: false,
      rewardPerBlockPositive: false,
      stakeTokenResolved: true,
      rewardTokenResolved: true,
      totalStakedPositive: false,
      active: false,
      funded: false,
      rewarding: false,
      finished: true,
      eligibleForDisplay: true,
    },
    rewardBadge: 'Official',
    visualType: 'Official',
    tvl: '—',
    rewardToken: 'MARCO',
    dailyRewards: '—',
    estimatedDailyReward: '—',
    remainingRewards: '—',
    remainingRewardsPct: 0,
    remainingRewardsTone: 'red',
    rewardBudgetUsd: '—',
    estimatedDuration: '—',
    lockPeriod: 'Flexible',
    cooldown: 'None',
    poolSafetyRisk: 'Low',
    rewardSustainability: 'Ended',
    sustainabilityScore: 0,
    weeklyRewards: '—',
    monthlyRewards: '—',
    stakeContractAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    rewardContractAddress: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    contractLabel: '0x41D5...2794',
    explorerUrl: 'https://bscscan.com',
    stakeExplorerUrl: 'https://bscscan.com',
    rewardExplorerUrl: 'https://bscscan.com',
    participants: '—',
    cta: 'none',
    analyzePreview: {
      rewardBudget: '—',
      remainingRewards: '—',
      dailyEmission: '—',
      emissionEndEstimate: '—',
      aprHistory: '—',
      rewardSustainability: 'Ended',
      risk: 'Low',
      contractAddress: overrides.contractAddress,
      contractExplorerUrl: 'https://bscscan.com',
      sousChefAddress: '0x41D5...2794',
      depositFee: '0%',
      withdrawFee: '0%',
      harvestInterval: 'Manual',
      autoCompound: 'Manual',
      poolVersion: 'SousChef #0',
      created: '—',
      lastUpdated: '—',
      rewardToken: 'MARCO',
      emission: '—',
      contract: '0x41D5...2794',
      rewardContract: '—',
      stakeContract: '—',
      tokenExplorerUrl: 'https://bscscan.com',
      estimatedRoi: '—',
      duration: '—',
      poolHistory: 'https://bscscan.com',
      transactions: 'https://bscscan.com',
    },
    poolTypeLabel: 'Flexible Pool',
    ...overrides,
  }
}

function makeUniqueEndedCard(index: number): PoolPreviewCard {
  const hex = index.toString(16).padStart(40, '0')
  const contract = `0x${hex}`
  return makeCard({
    id: `sous-${index}`,
    sousId: index,
    name: `MARCO → T${index}`,
    contractAddress: contract,
    status: 'ended',
  })
}

function buildCurrentInventoryFixture(): PoolPreviewCard[] {
  const cards = Array.from({ length: 238 }, (_, i) => makeUniqueEndedCard(i + 1))
  cards.push(
    makeCard({
      id: 'cakeVault',
      vaultKey: 'cakeVault' as PoolPreviewCard['vaultKey'],
      sousId: 0,
      name: 'MARCO Locked',
      contractAddress: MASTER_CHEF,
      status: 'ended',
      lockPeriod: '365d',
    }),
    makeCard({
      id: 'sous-0',
      sousId: 0,
      name: 'MARCO Staking',
      contractAddress: MASTER_CHEF.toLowerCase(),
      status: 'ended',
    }),
  )
  return cards
}

function filterFinished(cards: PoolPreviewCard[]): PoolPreviewCard[] {
  return cards.filter((p) => p.status === 'ended')
}

describe('poolCardInventoryDedup', () => {
  it('TEST 1 — same chain and same normalized address collapses to one card', () => {
    const cards = [
      makeCard({ id: 'a', contractAddress: MASTER_CHEF, name: 'A' }),
      makeCard({ id: 'b', contractAddress: MASTER_CHEF.toLowerCase(), name: 'B' }),
    ]
    const deduped = deduplicatePoolPreviewCards(cards, CHAIN_ID)
    expect(deduped).toHaveLength(1)
    expect(resolvePoolCardIdentity(cards[0], CHAIN_ID)).toBe(resolvePoolCardIdentity(cards[1], CHAIN_ID))
  })

  it('TEST 2 — canonical runtime record beats legacy vault alias', () => {
    const canonical = makeCard({
      id: 'sous-0',
      sousId: 0,
      name: 'MARCO Staking',
      contractAddress: MASTER_CHEF,
    })
    const legacy = makeCard({
      id: 'cakeVault',
      vaultKey: 'cakeVault' as PoolPreviewCard['vaultKey'],
      sousId: 0,
      name: 'MARCO Locked',
      contractAddress: MASTER_CHEF,
    })
    const deduped = deduplicatePoolPreviewCards([legacy, canonical], CHAIN_ID)
    expect(deduped).toHaveLength(1)
    expect(deduped[0].id).toBe('sous-0')
    expect(deduped[0].name).toBe('MARCO Staking')
  })

  it('TEST 3 — different contract addresses retain separate cards', () => {
    const cards = [
      makeCard({ id: 'a', contractAddress: '0x1111111111111111111111111111111111111111', name: 'MARCO Locked' }),
      makeCard({ id: 'b', contractAddress: '0x2222222222222222222222222222222222222222', name: 'MARCO Locked' }),
    ]
    expect(deduplicatePoolPreviewCards(cards, CHAIN_ID)).toHaveLength(2)
  })

  it('TEST 4 — same address on different chains uses distinct identities', () => {
    const card = makeCard({ id: 'a', contractAddress: MASTER_CHEF })
    const bscIdentity = resolvePoolCardIdentity(card, 56)
    const ethIdentity = resolvePoolCardIdentity(card, 1)
    expect(bscIdentity).toBe(`56:${MASTER_CHEF.toLowerCase()}`)
    expect(ethIdentity).toBe(`1:${MASTER_CHEF.toLowerCase()}`)
    expect(bscIdentity).not.toBe(ethIdentity)
    expect(deduplicatePoolPreviewCards([card, { ...card, id: 'b' }], 56)).toHaveLength(1)
    expect(deduplicatePoolPreviewCards([card, { ...card, id: 'b' }], 1)).toHaveLength(1)
  })

  it('TEST 5 — current inventory fixture removes one duplicate identity', () => {
    const pre = buildCurrentInventoryFixture()
    expect(pre).toHaveLength(240)
    const post = deduplicatePoolPreviewCards(pre, CHAIN_ID)
    expect(post).toHaveLength(239)
    const masterChefCards = post.filter((c) => resolvePoolCardIdentity(c, CHAIN_ID) === `${CHAIN_ID}:${MASTER_CHEF.toLowerCase()}`)
    expect(masterChefCards).toHaveLength(1)
    expect(pre.length - post.length).toBe(1)
  })

  it('TEST 6 — Finished filtering yields 239 ended cards for current fixture', () => {
    const post = deduplicatePoolPreviewCards(buildCurrentInventoryFixture(), CHAIN_ID)
    const finished = filterFinished(post)
    expect(finished).toHaveLength(239)
    expect(finished.every((c) => c.status === 'ended')).toBe(true)
  })

  it('TEST 7 — deduplication does not mutate classification KPI totals', () => {
    const payload = {
      counts: {
        discovered: 239,
        verified: 239,
        active: 0,
        funded: 229,
        rewarding: 0,
        ended: 239,
        invalid: 0,
      },
    }
    const countsBefore = parseClassificationCounts(payload)
    deduplicatePoolPreviewCards(buildCurrentInventoryFixture(), CHAIN_ID)
    const countsAfter = parseClassificationCounts(payload)
    const kpiBefore = resolveKpiLifecycleFields({ status: 'ready', counts: countsBefore! })
    const kpiAfter = resolveKpiLifecycleFields({ status: 'ready', counts: countsAfter! })
    expect(kpiAfter.discoveredValue).toBe(kpiBefore.discoveredValue)
    expect(kpiAfter.lifecycleSecondary).toBe(kpiBefore.lifecycleSecondary)
    expect(countsAfter).toEqual(countsBefore)
  })
})
