import { getAllProjects } from '../getAllProjects'
import type { StaticProjectRecord } from '../types'
import { buildPendingDiscoverySummary, buildPendingProjectRecord } from './discoverPendingProject'
import { getPendingProjectRegistry } from './pendingProjectStore'
import { serializePendingProjectProfile } from './serializePendingProfile'
import type { PendingProjectRecord } from './types'

export type ProjectRegistryTier = 'canonical' | 'pending'

export interface ProjectRegistryLookupResult {
  tier: ProjectRegistryTier
  canonical?: StaticProjectRecord
  pending?: PendingProjectRecord
  pendingCreated?: boolean
  machine?: ReturnType<typeof serializePendingProjectProfile>
  summary?: string
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

function findCanonicalProject(contract: string, chainId?: number): StaticProjectRecord | undefined {
  const normalized = normalizeAddress(contract)
  const matches = getAllProjects().filter((project) =>
    project.resources.tokens.some(
      (token) =>
        token.address.toLowerCase() === normalized && (chainId == null || token.chainId === chainId),
    ),
  )
  if (matches.length === 0) return undefined
  // Prefer dedicated token/crypto project identities over exchange platform projects.
  const tokenProject = matches.find(
    (project) =>
      project.projectType === 'Cryptocurrency' ||
      project.slug === 'marco' ||
      project.resources.tokens.some((t) => t.symbol.toUpperCase() === project.displayName.toUpperCase()),
  )
  return tokenProject ?? matches[0]
}

export function resolveProjectRegistryLookup(
  contract: string,
  chainId: number,
  hints?: Parameters<typeof buildPendingProjectRecord>[0]['onChain'],
): ProjectRegistryLookupResult {
  const canonical = findCanonicalProject(contract, chainId)
  if (canonical) {
    return { tier: 'canonical', canonical }
  }

  const registry = getPendingProjectRegistry()
  const normalized = normalizeAddress(contract)
  const existing = registry.getByContract(chainId, normalized)
  const pending = registry.upsert(
    buildPendingProjectRecord({
      contract: normalized,
      chainId,
      onChain: hints,
      existing,
    }),
  )

  return {
    tier: 'pending',
    pending,
    pendingCreated: !existing,
    machine: serializePendingProjectProfile(pending),
    summary: buildPendingDiscoverySummary(pending),
  }
}

export function getCanonicalPromotionRule(): {
  rule: string
  steps: string[]
} {
  return {
    rule: 'No auto-canonicalization. Approved pending projects require manual merge into canonical registry.',
    steps: [
      'Human reviewer sets pending status to approved (never canonical automatically).',
      'Operator validates provenance fields and owner-confirmed metadata.',
      'Operator manually adds StaticProjectRecord to STATIC_PROJECTS + public registry JSON.',
      'Only then may status become canonical with isCanonical: true.',
      'Pending profile remains in pending store for audit trail (archived after promotion).',
    ],
  }
}
