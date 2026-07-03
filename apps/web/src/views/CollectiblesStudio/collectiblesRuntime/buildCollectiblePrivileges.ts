import type { StaticCollectibleRecord } from 'registry/collectibles/collectible-types'
import type { WalletCollectibleOwnership } from './useWalletCollectibleOwnership'

export type PrivilegeId =
  | 'Builder'
  | 'Validator'
  | 'AI Agent'
  | 'Governance'
  | 'Infrastructure'
  | 'Marketplace'
  | 'Treasury'
  | 'Execution'
  | 'Rewards'
  | 'DEX'

export interface CollectiblePrivilege {
  id: PrivilegeId
  label: string
  status: 'Active' | 'Inactive' | 'Pending' | 'Revoked' | 'Unavailable'
}

const CATEGORY_PRIVILEGES: Record<StaticCollectibleRecord['category'], PrivilegeId[]> = {
  mascot_ecosystem: ['Governance', 'Rewards', 'DEX', 'Marketplace'],
  identity: ['Builder', 'Governance', 'AI Agent', 'Infrastructure'],
  participation_proof: ['Execution', 'Rewards', 'Infrastructure'],
  ai_agent_identity: ['AI Agent', 'Execution', 'Governance'],
}

export function buildCollectiblePrivileges(
  record: StaticCollectibleRecord,
  ownership: WalletCollectibleOwnership,
): CollectiblePrivilege[] {
  const base = CATEGORY_PRIVILEGES[record.category] ?? ['DEX']
  const owned = ownership.status === 'Owned'

  return base.map((id) => ({
    id,
    label: id,
    status:
      record.status === 'planned' || record.status === 'planned_or_external'
        ? 'Pending'
        : owned
          ? 'Active'
          : record.contract.indexed
            ? 'Inactive'
            : 'Unavailable',
  }))
}

export function privilegeLabels(privileges: CollectiblePrivilege[]): string[] {
  return privileges.filter((p) => p.status === 'Active' || p.status === 'Pending').map((p) => p.label)
}
