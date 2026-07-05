import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { buildAiAdvisorRows } from '../buildAiAdvisor'
import { buildCollectibleHealth } from '../buildCollectibleHealth'
import { buildCollectiblePrivileges } from '../buildCollectiblePrivileges'
import { buildMachineProfile } from '../buildMachineProfile'
import { buildMembershipStatus } from '../buildMembershipStatus'
import { createCollectiblesRuntimeError } from '../collectiblesRuntimeErrors'
import {
  commandCenterIdentitySummary,
  formatCommandCenterCollectibles,
} from '../formatCommandCenterCollectibles'
import type { WalletCollectibleOwnership } from '../useWalletCollectibleOwnership'

describe('collectiblesRuntime', () => {
  const records = getAllCollectibles()
  const genesis = records.find((r) => r.slug === 'babymarco-genesis')!
  const notOwned: WalletCollectibleOwnership = {
    slug: genesis.slug,
    balance: 0,
    status: 'Not owned',
    transferable: true,
    tokenIds: [],
  }
  const owned: WalletCollectibleOwnership = {
    slug: genesis.slug,
    balance: 1,
    status: 'Owned',
    transferable: true,
    tokenIds: ['1'],
  }

  it('indexes only canonical registry collectibles', () => {
    expect(records.length).toBe(3)
    expect(records.map((r) => r.slug)).toEqual([
      'babymarco-genesis',
      'masterm-identity',
      'achievement-collectibles',
    ])
  })

  it('builds health dimensions without fabricated values', () => {
    const health = buildCollectibleHealth(genesis, notOwned)
    expect(health.dimensions.length).toBe(6)
    expect(health.score).toBeGreaterThan(0)
    expect(health.dimensions.some((d) => d.label === 'Ownership')).toBe(true)
  })

  it('derives privileges from category and ownership', () => {
    const privileges = buildCollectiblePrivileges(genesis, owned)
    expect(privileges.some((p) => p.id === 'Governance' && p.status === 'Active')).toBe(true)
    const inactive = buildCollectiblePrivileges(genesis, notOwned)
    expect(inactive.every((p) => p.status === 'Inactive' || p.status === 'Pending')).toBe(true)
  })

  it('resolves membership tiers from registry', () => {
    const membership = buildMembershipStatus(genesis, owned)
    expect(membership.tier).toBe('Genesis')
    expect(membership.acquired).toBe('Wallet verified')
  })

  it('builds heuristic AI advisor rows without auto-actions', () => {
    const rows = buildAiAdvisorRows(records, { [genesis.slug]: notOwned })
    expect(rows.length).toBeGreaterThan(0)
    expect(rows.length).toBeLessThanOrEqual(5)
    expect(rows.some((r) => r.category.includes('Genesis') || r.category.includes('Builder'))).toBe(true)
  })

  it('exports machine-readable identity profile', () => {
    const profile = buildMachineProfile({
      account: '0xabc',
      chainId: 56,
      records,
      ownershipBySlug: { [genesis.slug]: owned },
      totalOwned: 1,
    })
    expect(profile.schema).toBe('melega.collectibles-identity.v1')
    expect(profile.collections.length).toBe(3)
    expect(profile.capabilities.builderLevel).toBe(1)
  })

  it('formats command center collectibles from wallet ownership', () => {
    const items = formatCommandCenterCollectibles(records, { [genesis.slug]: owned }, '0xabc')
    expect(items.length).toBe(3)
    expect(items[0].subtitle).toContain('Genesis')
  })

  it('summarizes identity for command center machine JSON', () => {
    const summary = commandCenterIdentitySummary(records, { [genesis.slug]: owned }, 1)
    expect(summary.owned).toBe(1)
    expect(summary.builderLevel).toBe(1)
  })

  it('exposes runtime error catalog', () => {
    const err = createCollectiblesRuntimeError('NO_OWNER')
    expect(err.code).toBe('NO_OWNER')
    expect(err.message).toMatch(/wallet/i)
  })
})
