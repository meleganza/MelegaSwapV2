import { MARCO_ROUTE_STATE_URL, ROUTE_STATE_CACHE_TTL_MS } from './constants'
import { deriveAuthoritySnapshot } from './derive'
import type { MarcoBridgeAuthorityResult, MarcoBridgeAuthoritySnapshot } from './types'
import { parseAndValidateRouteState } from './validate'

type CacheEntry = {
  expiresAt: number
  snapshot: MarcoBridgeAuthoritySnapshot
}

let memoryCache: CacheEntry | null = null

/** Test / harness only — not a client enable override. */
export function __resetMarcoBridgeRouteStateCacheForTests(): void {
  memoryCache = null
}

function readFreshCache(now: number): MarcoBridgeAuthoritySnapshot | null {
  if (!memoryCache) return null
  if (now >= memoryCache.expiresAt) {
    memoryCache = null
    return null
  }
  return memoryCache.snapshot
}

function writeCache(snapshot: MarcoBridgeAuthoritySnapshot, now: number): void {
  memoryCache = {
    snapshot,
    expiresAt: now + ROUTE_STATE_CACHE_TTL_MS,
  }
}

/**
 * Fetch canonical MARCO bridge route-state.
 * Short TTL cache. On any uncertainty: fail closed (never assume enabled).
 */
export async function fetchMarcoBridgeRouteAuthority(options?: {
  forceRefresh?: boolean
  fetchImpl?: typeof fetch
  now?: number
  url?: string
}): Promise<MarcoBridgeAuthorityResult> {
  const now = options?.now ?? Date.now()
  const forceRefresh = options?.forceRefresh === true
  const fetchImpl = options?.fetchImpl ?? fetch
  const url = options?.url ?? MARCO_ROUTE_STATE_URL

  if (!forceRefresh) {
    const cached = readFreshCache(now)
    if (cached) return cached
  } else {
    memoryCache = null
  }

  try {
    const response = await fetchImpl(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!response.ok) {
      memoryCache = null
      return {
        ok: false,
        fetchedAt: now,
        error: `Route-state HTTP ${response.status}`,
        reason: 'fetch_failed',
      }
    }

    let json: unknown
    try {
      json = await response.json()
    } catch {
      memoryCache = null
      return {
        ok: false,
        fetchedAt: now,
        error: 'Route-state JSON parse failed',
        reason: 'invalid_response',
      }
    }

    const validated = parseAndValidateRouteState(json)
    if (validated.ok === false) {
      memoryCache = null
      return {
        ok: false,
        fetchedAt: now,
        error: validated.error,
        reason: validated.reason,
      }
    }

    const snapshot = deriveAuthoritySnapshot(validated.response, now)
    writeCache(snapshot, now)
    return snapshot
  } catch (error) {
    memoryCache = null
    return {
      ok: false,
      fetchedAt: now,
      error: error instanceof Error ? error.message : 'Route-state fetch failed',
      reason: 'fetch_failed',
    }
  }
}

/**
 * Security: ignore URL query / localStorage / client flags.
 * Availability is derived only from the authority result.
 */
export function resolveClientRouteOverrideAttempts(searchParams?: URLSearchParams | null): {
  ignored: string[]
  applied: false
} {
  const ignored: string[] = []
  if (!searchParams) return { ignored, applied: false }
  for (const key of [
    'enable',
    'enabled',
    'execution',
    'route',
    'activate',
    'global_execution_enabled',
    'forceEnable',
  ]) {
    if (searchParams.has(key)) ignored.push(key)
  }
  return { ignored, applied: false }
}
