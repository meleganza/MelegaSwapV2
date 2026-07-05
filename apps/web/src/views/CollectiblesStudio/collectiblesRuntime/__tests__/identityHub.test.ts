import {
  IDENTITY_HUB_COLLECTIONS,
  IDENTITY_HUB_NAV_LABEL,
} from 'registry/collectibles/identity-hub-collections.config'
import {
  BABYMARCO_GENESIS_RARITY_TIERS,
  getBabyMarcoTierByMetadataLabel,
} from 'registry/collectibles/babymarco-genesis-identity.config'
import { shellNavigation } from 'app-shell/config/navigation'
import {
  buildGenesisIdentityPrivileges,
  resolvePrivilegeDisplayStatus,
} from '../identityCapabilities'
import { buildMachineProfile, IDENTITY_MACHINE_SCHEMA } from '../buildMachineProfile'
import { getAllCollectibles } from 'registry/collectibles/getAllCollectibles'

describe('identityHub R400.1', () => {
  const records = getAllCollectibles()
  const genesis = records.find((r) => r.slug === 'babymarco-genesis')!

  it('exposes Identity Hub nav label while keeping /collectibles route', () => {
    const findSection = shellNavigation.flatMap((s) => s.items).find((i) => i.id === 'collectibles')
    expect(findSection?.label).toBe(IDENTITY_HUB_NAV_LABEL)
    expect(findSection?.href).toBe('/collectibles')
  })

  it('registers honest identity collection cards with only BabyMARCO active', () => {
    expect(IDENTITY_HUB_COLLECTIONS.length).toBe(5)
    const active = IDENTITY_HUB_COLLECTIONS.filter((c) => c.status === 'active')
    expect(active).toHaveLength(1)
    expect(active[0].name).toBe('BabyMARCO Genesis')
    expect(IDENTITY_HUB_COLLECTIONS.filter((c) => c.mintAvailable)).toHaveLength(1)
  })

  it('maps privilege status to ACTIVE / LOCKED / COMING SOON', () => {
    expect(resolvePrivilegeDisplayStatus('live', true, true)).toBe('ACTIVE')
    expect(resolvePrivilegeDisplayStatus('live', false, true)).toBe('LOCKED')
    expect(resolvePrivilegeDisplayStatus('future', true, true)).toBe('COMING SOON')
    expect(resolvePrivilegeDisplayStatus('future', false, true)).toBe('COMING SOON')

    const owned = buildGenesisIdentityPrivileges(genesis, {
      slug: genesis.slug,
      balance: 1,
      status: 'Owned',
      transferable: true,
      tokenIds: ['1'],
    })
    expect(owned.some((p) => p.label === 'Identity Badge' && p.status === 'ACTIVE')).toBe(true)
    expect(owned.some((p) => p.label === 'Future Governance' && p.status === 'COMING SOON')).toBe(true)

    const locked = buildGenesisIdentityPrivileges(genesis, {
      slug: genesis.slug,
      balance: 0,
      status: 'Not owned',
      transferable: true,
      tokenIds: [],
    })
    expect(locked.every((p) => p.status === 'LOCKED' || p.status === 'COMING SOON')).toBe(true)
    expect(locked.some((p) => p.status === 'LOCKED')).toBe(true)
  })

  it('reads BabyMARCO pricing from configuration tiers', () => {
    const normal = getBabyMarcoTierByMetadataLabel('Normal')
    const ssr = getBabyMarcoTierByMetadataLabel('Super Super Rare')
    expect(normal?.priceMarco).toBe(25_000)
    expect(ssr?.priceMarco).toBe(300_000)
    expect(BABYMARCO_GENESIS_RARITY_TIERS.reduce((s, t) => s + t.supply, 0)).toBe(1000)
  })

  it('exports melega.identity.v1 machine JSON with identity hub fields', () => {
    const profile = buildMachineProfile({
      account: '0xabc',
      chainId: 56,
      records,
      ownershipBySlug: {
        [genesis.slug]: {
          slug: genesis.slug,
          balance: 1,
          status: 'Owned',
          transferable: true,
          tokenIds: ['1'],
        },
      },
      totalOwned: 1,
      primaryRarityLabel: 'Normal',
      primaryTokenId: '1',
    })

    expect(profile.schema).toBe(IDENTITY_MACHINE_SCHEMA)
    expect(profile.identity_hub.label).toBe('Identity Hub')
    expect(profile.collections.length).toBe(5)
    expect(profile.active_collection).toBe('babymarco-genesis')
    expect(profile.wallet_identity.currentIdentity).toBe('Genesis')
    expect(profile.rarity_tiers.length).toBe(4)
    expect(profile.pricing_marco.length).toBe(4)
    expect(profile.privileges.length).toBeGreaterThan(0)
    expect(profile.capabilities.length).toBe(3)
    expect(profile.identity_levels.length).toBe(6)
    expect(profile.ownership.genesis).toBe(true)
    expect(profile.ipfs_metadata.metadataCid).toBeTruthy()
    expect(profile.registry_collections.length).toBe(3)
  })
})
