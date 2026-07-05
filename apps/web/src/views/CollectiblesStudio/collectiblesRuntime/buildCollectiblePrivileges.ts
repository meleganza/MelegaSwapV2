import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import {
  buildGenesisIdentityPrivileges,
  type PrivilegeDisplayStatus,
} from './identityCapabilities'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export type PrivilegeId = string

export interface CollectiblePrivilege {
  id: PrivilegeId
  label: string
  status: PrivilegeDisplayStatus
}

export function buildCollectiblePrivileges(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
): CollectiblePrivilege[] {
  if (record.slug === 'babymarco-genesis') {
    return buildGenesisIdentityPrivileges(record, ownership).map((p) => ({
      id: p.label,
      label: p.label,
      status: p.status,
    }))
  }

  const owned = ownership.status === 'Owned'
  const tier =
    record.slug === 'masterm-identity'
      ? 'Builder'
      : record.slug === 'achievement-collectibles'
        ? 'Validator'
        : null

  if (!tier) return []

  return [
    {
      id: tier,
      label: tier,
      status:
        record.status === 'planned' || record.status === 'planned_or_external'
          ? 'COMING SOON'
          : owned
            ? 'ACTIVE'
            : 'LOCKED',
    },
  ]
}

export function privilegeLabels(privileges: CollectiblePrivilege[]): string[] {
  return privileges.filter((p) => p.status === 'ACTIVE' || p.status === 'COMING SOON').map((p) => p.label)
}
