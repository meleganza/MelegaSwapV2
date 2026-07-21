import { getAllProjects } from 'registry/projects/getAllProjects'
import type { StaticProjectRecord } from 'registry/projects/types'
import {
  buildPendingDiscoverySummary,
  resolveProjectRegistryLookup,
} from 'registry/projects/pending'
import type { PendingProjectRecord } from 'registry/projects/pending/types'
import { buildDexTokenIndex } from 'views/RadarStudio/radarRuntime/buildDexTokenIndex'
import { createProjectsRuntimeError, type ProjectsRuntimeError } from './projectsRuntimeErrors'

export interface ContractDiscoveryResult {
  found: boolean
  registryTier: 'canonical' | 'pending' | 'none'
  project?: StaticProjectRecord
  pending?: PendingProjectRecord
  pendingCreated?: boolean
  name?: string
  ticker?: string
  logo?: string
  website?: string
  twitter?: string
  telegram?: string
  discord?: string
  github?: string
  whitepaper?: string
  explorer?: string
  discoveryReason?: string | null
  errors: ProjectsRuntimeError[]
}

export interface ContractDiscoveryHints {
  name?: string | null
  symbol?: string | null
}

function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

function socialUrl(project: StaticProjectRecord, type: string): string | undefined {
  return project.socialLinks?.find((s) => s.type === type)?.url
}

function mapRegistryProject(project: StaticProjectRecord): ContractDiscoveryResult {
  const token = project.resources.tokens[0]
  const errors: ProjectsRuntimeError[] = []
  if (!token?.address) errors.push(createProjectsRuntimeError('NO_CONTRACT'))
  if (!project.displayName) errors.push(createProjectsRuntimeError('NO_METADATA'))

  return {
    found: true,
    registryTier: 'canonical',
    project,
    name: project.displayName,
    ticker: token?.symbol,
    logo: token?.symbol?.slice(0, 2),
    website: project.websiteUrl,
    twitter: socialUrl(project, 'twitter'),
    telegram: socialUrl(project, 'telegram'),
    discord: socialUrl(project, 'discord'),
    github: socialUrl(project, 'github'),
    whitepaper: project.docsUrl,
    explorer: token?.address ? `https://bscscan.com/token/${token.address}` : undefined,
    errors,
  }
}

function mapPendingProject(
  pending: PendingProjectRecord,
  pendingCreated?: boolean,
  discoveryReason?: string | null,
): ContractDiscoveryResult {
  return {
    found: false,
    registryTier: 'pending',
    pending,
    pendingCreated,
    name: pending.name.available ? pending.name.value ?? undefined : undefined,
    ticker: pending.symbol.available ? pending.symbol.value ?? undefined : undefined,
    website: pending.website.available ? pending.website.value ?? undefined : undefined,
    twitter: pending.socials.twitter?.available ? pending.socials.twitter.value ?? undefined : undefined,
    telegram: pending.socials.telegram?.available ? pending.socials.telegram.value ?? undefined : undefined,
    discord: pending.socials.discord?.available ? pending.socials.discord.value ?? undefined : undefined,
    github: pending.socials.github?.available ? pending.socials.github.value ?? undefined : undefined,
    explorer: pending.contract,
    discoveryReason: discoveryReason ?? null,
    errors: [],
  }
}

export function discoverProjectFromContract(
  contract: string,
  chainId?: number,
  hints?: ContractDiscoveryHints,
): ContractDiscoveryResult {
  const normalized = normalizeAddress(contract)
  if (!normalized || !normalized.startsWith('0x') || normalized.length < 10) {
    return {
      found: false,
      registryTier: 'none',
      errors: [createProjectsRuntimeError('NO_CONTRACT')],
      discoveryReason: 'Invalid contract address.',
    }
  }

  const resolvedChainId = chainId ?? 56
  const projects = getAllProjects()
  const match = projects.find((project) =>
    project.resources.tokens.some(
      (token) =>
        token.address.toLowerCase() === normalized &&
        (chainId == null || token.chainId === chainId),
    ),
  )

  if (match) return mapRegistryProject(match)

  // Cross-chain honesty: same address listed on another chain — explain, do not silent-unknown.
  const otherChain = projects.find((project) =>
    project.resources.tokens.some((token) => token.address.toLowerCase() === normalized),
  )
  if (otherChain && chainId != null) {
    const token = otherChain.resources.tokens.find((t) => t.address.toLowerCase() === normalized)
    return {
      found: false,
      registryTier: 'none',
      project: otherChain,
      name: otherChain.displayName,
      ticker: token?.symbol,
      errors: [createProjectsRuntimeError('UNKNOWN')],
      discoveryReason: `Contract is registered on chain ${token?.chainId} for project ${otherChain.slug}, not on selected chain ${chainId}. Open /@${otherChain.slug}/ or switch chain.`,
    }
  }

  const dexMatch = buildDexTokenIndex().find(
    (entry) => entry.address.toLowerCase() === normalized && (chainId == null || entry.chainId === chainId),
  )
  if (dexMatch) {
    const lookup = resolveProjectRegistryLookup(normalized, resolvedChainId, {
      name: hints?.name ?? dexMatch.symbol,
      symbol: hints?.symbol ?? dexMatch.symbol,
    })
    if (lookup.tier === 'pending' && lookup.pending) {
      return mapPendingProject(
        lookup.pending,
        lookup.pendingCreated,
        'Token appears on Melega DEX lists but has no canonical Project Page yet — pending review profile created.',
      )
    }
  }

  const lookup = resolveProjectRegistryLookup(normalized, resolvedChainId, {
    name: hints?.name ?? null,
    symbol: hints?.symbol ?? null,
  })
  if (lookup.tier === 'pending' && lookup.pending) {
    const reason =
      !lookup.pending.name.available && !lookup.pending.symbol.available
        ? 'No on-chain name/symbol hints were provided. Re-run Import via the API path to fetch ERC-20 metadata.'
        : null
    return mapPendingProject(lookup.pending, lookup.pendingCreated, reason)
  }

  return {
    found: false,
    registryTier: 'none',
    errors: [createProjectsRuntimeError('UNKNOWN')],
    discoveryReason: 'Contract not found in Melega registry and pending upsert failed.',
  }
}

export function findProjectBySlug(slug: string): StaticProjectRecord | undefined {
  return getAllProjects().find((p) => p.slug === slug)
}

export function getPendingDiscoverySummary(pending: PendingProjectRecord): string {
  return buildPendingDiscoverySummary(pending)
}
