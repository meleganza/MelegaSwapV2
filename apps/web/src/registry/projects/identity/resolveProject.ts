import { STATIC_PROJECTS } from '../projects.data'
import type { StaticProjectRecord } from '../types'
import { normalizeEvmAddress } from './caip'
import { normalizeProjectDocument } from './normalizeProject'
import type { CanonicalProjectDocument } from './types'

/** Slug shape: lowercase alphanumeric segments separated by single hyphens. */
const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/

export type ProjectSlugResolveResult =
  | { ok: true; slug: string; project: StaticProjectRecord; matchedVia: 'slug' | 'alias' }
  | { ok: false; reason: 'malformed' | 'not_found' }

/**
 * Normalize raw route/query input for project slug resolution.
 * Rejects malformed values; strips a single leading `@`.
 */
export function normalizeProjectSlugInput(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  let value = raw.trim().toLowerCase()
  if (!value) return null
  if (value.startsWith('@')) value = value.slice(1)
  if (!value || value.includes('/') || value.includes('\\') || value.includes('..')) return null
  if (!SLUG_RE.test(value)) return null
  return value
}

function findByCanonicalSlug(slug: string): StaticProjectRecord | undefined {
  return STATIC_PROJECTS.find((project) => project.slug === slug)
}

function findByAlias(slug: string): StaticProjectRecord | undefined {
  return STATIC_PROJECTS.find((project) => (project.aliases ?? []).some((alias) => alias.toLowerCase() === slug))
}

/**
 * Resolve a registered project by canonical slug or alias.
 * Alias resolution never creates a second identity — returns the same StaticProjectRecord.
 */
export function resolveProjectBySlug(raw: unknown): ProjectSlugResolveResult {
  const slug = normalizeProjectSlugInput(raw)
  if (!slug) return { ok: false, reason: 'malformed' }

  const bySlug = findByCanonicalSlug(slug)
  if (bySlug) return { ok: true, slug: bySlug.slug, project: bySlug, matchedVia: 'slug' }

  const byAlias = findByAlias(slug)
  if (byAlias) return { ok: true, slug: byAlias.slug, project: byAlias, matchedVia: 'alias' }

  return { ok: false, reason: 'not_found' }
}

/**
 * Optional discovery helpers: symbol or contract address may resolve a project.
 * Contract addresses must never become the canonical public URL.
 */
export function resolveProjectByTokenSymbol(symbol: string): StaticProjectRecord | undefined {
  if (typeof symbol !== 'string' || !symbol.trim()) return undefined
  const needle = symbol.trim().toUpperCase()
  const matches = STATIC_PROJECTS.filter((project) =>
    project.resources.tokens.some((token) => token.symbol.toUpperCase() === needle),
  )
  if (matches.length !== 1) return undefined
  return matches[0]
}

export function resolveProjectByContractAddress(address: string): StaticProjectRecord | undefined {
  const normalized = normalizeEvmAddress(address)
  if (!normalized) return undefined
  const matches = STATIC_PROJECTS.filter((project) =>
    project.resources.tokens.some((token) => normalizeEvmAddress(token.address) === normalized),
  )
  if (matches.length !== 1) return undefined
  return matches[0]
}

/**
 * Prevent two projects from claiming the same chain+address as distinct identities.
 * Returns colliding caip10 keys (chain-scoped) when duplicates exist across projects.
 */
export function findCrossProjectContractCollisions(): string[] {
  const seen = new Map<string, string>()
  const collisions: string[] = []
  for (const project of STATIC_PROJECTS) {
    for (const token of project.resources.tokens) {
      const address = normalizeEvmAddress(token.address)
      if (!address) continue
      const key = `${token.chainId}:${address}`
      const prior = seen.get(key)
      if (prior && prior !== project.upi) {
        collisions.push(key)
      } else {
        seen.set(key, project.upi)
      }
    }
  }
  return collisions
}

export function getAllResolvableProjectSlugs(): string[] {
  const slugs = new Set<string>()
  for (const project of STATIC_PROJECTS) {
    slugs.add(project.slug)
    for (const alias of project.aliases ?? []) {
      const normalized = normalizeProjectSlugInput(alias)
      if (normalized) slugs.add(normalized)
    }
  }
  return Array.from(slugs)
}

export function loadCanonicalProjectDocument(
  rawSlug: unknown,
  options?: { generatedAt?: string; origin?: string },
): CanonicalProjectDocument | null {
  const resolved = resolveProjectBySlug(rawSlug)
  if (!resolved.ok) return null
  return normalizeProjectDocument(resolved.project, options)
}
