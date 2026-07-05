import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'
import { buildAiAdvisorRows } from '../buildAiAdvisor'
import { buildCollectibleHealth } from '../buildCollectibleHealth'
import { buildCollectiblePrivileges } from '../buildCollectiblePrivileges'
import { buildMachineProfile, IDENTITY_MACHINE_SCHEMA } from '../buildMachineProfile'
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

  it('derives privileges from genesis identity mapping', () => {
    const privileges = buildCollectiblePrivileges(genesis, owned)
    expect(privileges.some((p) => p.label === 'Identity Badge' && p.status === 'ACTIVE')).toBe(true)
    expect(privileges.some((p) => p.label === 'Future Governance' && p.status === 'COMING SOON')).toBe(true)
    const locked = buildCollectiblePrivileges(genesis, notOwned)
    expect(locked.every((p) => p.status === 'LOCKED' || p.status === 'COMING SOON')).toBe(true)
  })

  it('resolves membership tiers from registry', () => {
    const membership = buildMembershipStatus(genesis, owned)
    expect(membership.tier).toBe('Genesis')
    expect(membership.acquired).toBe('Wallet verified')
    const builder = records.find((r) => r.slug === 'masterm-identity')!
    expect(buildMembershipStatus(builder, notOwned).tier).toBe('Builder')
    const validator = records.find((r) => r.slug === 'achievement-collectibles')!
    expect(buildMembershipStatus(validator, notOwned).tier).toBe('Validator')
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
      primaryRarityLabel: 'Normal',
      primaryTokenId: '1',
    })
    expect(profile.schema).toBe(IDENTITY_MACHINE_SCHEMA)
    expect(profile.schema).toBe('melega.identity.v1')
    expect(profile.wallet_identity.currentIdentity).toBe('Genesis')
    expect(profile.ownership.genesis).toBe(true)
    expect(profile.rarity_tiers.length).toBe(4)
    expect(profile.identity_hub.label).toBe('Identity Hub')
    expect(profile.registry_collections.length).toBe(3)
  })

  it('formats command center collectibles from wallet ownership', () => {
    const items = formatCommandCenterCollectibles(records, { [genesis.slug]: owned }, '0xabc')
    expect(items.length).toBe(3)
    expect(items[0].subtitle).toContain('Genesis')
    expect(items[0].privileges.length).toBeGreaterThan(0)
    expect(items[1].privileges).toContain('Builder')
    expect(items[2].privileges).toContain('Validator')
  })

  it('summarizes identity for command center machine JSON', () => {
    const summary = commandCenterIdentitySummary(records, { [genesis.slug]: owned }, 1, '0xabc')
    expect(summary.owned).toBe(1)
    expect(summary.currentIdentity).toBe('Genesis')
    expect(summary.identity).toBe('Genesis Identity')
    expect(summary.collection).toBe('BabyMARCO Genesis')
    expect(summary.identityLevel).toBe('L1 Genesis Owner')
  })

  it('exposes runtime error catalog', () => {
    const err = createCollectiblesRuntimeError('NO_OWNER')
    expect(err.code).toBe('NO_OWNER')
    expect(err.message).toMatch(/wallet/i)
  })
})
