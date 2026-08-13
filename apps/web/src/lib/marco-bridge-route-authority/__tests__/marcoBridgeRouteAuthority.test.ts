import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  CANONICAL_ROUTE_IDS,
  EXPECTED_NETWORK_IDENTITY,
  LEGACY_FORBIDDEN_CHAIN_IDS,
  LEGACY_RETIRED_BASE_RH_TOKEN,
  ROUTE_STATE_CACHE_TTL_MS,
  __resetMarcoBridgeRouteStateCacheForTests,
  deriveAuthoritySnapshot,
  fetchMarcoBridgeRouteAuthority,
  isAnyRouteExecutable,
  parseAndValidateRouteState,
  resolveClientRouteOverrideAttempts,
} from '../index'

function canonicalFixture(overrides?: {
  global_execution_enabled?: boolean
  solanaPaused?: boolean
  routePatches?: Record<string, Partial<{ execution_enabled: boolean; publicly_active: boolean; paused: boolean }>>
  networkPatches?: Record<string, Partial<{ chain_id: number | null; eid: number; token: string; paused: boolean }>>
}) {
  const networks = [
    {
      id: 'bnb',
      name: 'BNB Smart Chain',
      family: 'evm',
      chain_id: 56,
      eid: 30102,
      model: 'evm_oft_adapter',
      token: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
      token_decimals: 18,
      endpoint_contract: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E',
      requires_approval: true,
      paused: false,
    },
    {
      id: 'base',
      name: 'Base',
      family: 'evm',
      chain_id: 8453,
      eid: 30184,
      model: 'evm_oft',
      token: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
      token_decimals: 18,
      endpoint_contract: '0xa2c8b941542AE0599774D1661CB7B773BC0e79C7',
      requires_approval: false,
      paused: false,
    },
    {
      id: 'solana',
      name: 'Solana',
      family: 'solana',
      chain_id: null,
      eid: 30168,
      model: 'solana_oft',
      token: '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF',
      token_decimals: 9,
      endpoint_contract: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
      requires_approval: false,
      paused: overrides?.solanaPaused ?? true,
    },
    {
      id: 'robinhood',
      name: 'Robinhood Chain',
      family: 'evm',
      chain_id: 4663,
      eid: 30416,
      model: 'evm_oft',
      token: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
      token_decimals: 18,
      endpoint_contract: '0x803925DacEcCc32343cdac0C731dB07a1A384bFB',
      requires_approval: false,
      paused: false,
    },
  ].map((n) => ({ ...n, ...(overrides?.networkPatches?.[n.id] ?? {}) }))

  const routes = [
    { from: 'bnb', to: 'base', certified: true, publicly_active: false, execution_enabled: false, paused: false },
    { from: 'base', to: 'bnb', certified: true, publicly_active: false, execution_enabled: false, paused: false },
    { from: 'bnb', to: 'solana', certified: true, publicly_active: false, execution_enabled: false, paused: true },
    { from: 'solana', to: 'bnb', certified: true, publicly_active: false, execution_enabled: false, paused: true },
    { from: 'bnb', to: 'robinhood', certified: true, publicly_active: false, execution_enabled: false, paused: false },
    { from: 'robinhood', to: 'bnb', certified: true, publicly_active: false, execution_enabled: false, paused: false },
  ].map((r) => ({ ...r, ...(overrides?.routePatches?.[`${r.from}>${r.to}`] ?? {}) }))

  return {
    schema_version: '1',
    portal_version: '1.0.0-foundation',
    updated_at: '2026-07-20',
    source: 'marco.public_portal',
    provenance: 'canonical_registry',
    data: {
      binding_version: 'mmn.mainnet.1.0.0',
      updated_at: '2026-08-12',
      hub: 'bnb',
      shared_with: ['marco.melega.ai', 'melega-dex'],
      global_execution_enabled: overrides?.global_execution_enabled ?? false,
      networks,
      routes,
    },
    canonical_url: '/api/public/bridge/route-state',
    notice: 'Consumers must fail closed.',
  }
}

afterEach(() => {
  __resetMarcoBridgeRouteStateCacheForTests()
  vi.restoreAllMocks()
})

describe('MMN_BRIDGE_DEX_SHARED_ROUTE_AUTHORITY_V1', () => {
  it('validates canonical endpoint fixture and maps all six routes', () => {
    const parsed = parseAndValidateRouteState(canonicalFixture())
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const snapshot = deriveAuthoritySnapshot(parsed.response)
    expect(snapshot.routes.map((r) => r.id).sort()).toEqual([...CANONICAL_ROUTE_IDS].sort())
    expect(snapshot.globalExecutionEnabled).toBe(false)
    expect(snapshot.executableRouteCount).toBe(0)
    expect(isAnyRouteExecutable(snapshot)).toBe(false)
  })

  it('fail-closes when endpoint unavailable', async () => {
    const fetchImpl = vi.fn(async () => new Response('down', { status: 503 }))
    const result = await fetchMarcoBridgeRouteAuthority({ fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(result.ok).toBe(false)
    if (result.ok !== false) return
    expect(result.reason).toBe('fetch_failed')
  })

  it('fail-closes on invalid response', async () => {
    const fetchImpl = vi.fn(async () => new Response('{not-json', { status: 200 }))
    const result = await fetchMarcoBridgeRouteAuthority({ fetchImpl: fetchImpl as unknown as typeof fetch })
    expect(result.ok).toBe(false)
  })

  it('fail-closes when global execution disabled — zero executable routes', () => {
    const parsed = parseAndValidateRouteState(canonicalFixture({ global_execution_enabled: false }))
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const snapshot = deriveAuthoritySnapshot(parsed.response)
    expect(snapshot.routes.every((r) => r.executable === false)).toBe(true)
  })

  it('respects Solana pause for BNB_SOLANA and SOLANA_BNB', () => {
    const parsed = parseAndValidateRouteState(
      canonicalFixture({
        solanaPaused: true,
        routePatches: {
          'bnb>solana': { paused: false, execution_enabled: true, publicly_active: true },
          'solana>bnb': { paused: false, execution_enabled: true, publicly_active: true },
        },
        global_execution_enabled: true,
      }),
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const snapshot = deriveAuthoritySnapshot(parsed.response)
    const solanaRoutes = snapshot.routes.filter((r) => r.id === 'BNB_SOLANA' || r.id === 'SOLANA_BNB')
    expect(solanaRoutes).toHaveLength(2)
    expect(solanaRoutes.every((r) => r.paused && !r.executable && r.status === 'paused')).toBe(true)
  })

  it('marks route paused / inactive without inventing executability', () => {
    const parsed = parseAndValidateRouteState(
      canonicalFixture({
        routePatches: {
          'bnb>base': { paused: true },
          'base>bnb': { publicly_active: false, execution_enabled: false },
        },
      }),
    )
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    const snapshot = deriveAuthoritySnapshot(parsed.response)
    expect(snapshot.routes.find((r) => r.id === 'BNB_BASE')?.status).toBe('paused')
    expect(snapshot.routes.find((r) => r.id === 'BASE_BNB')?.status).toBe('prepared_inactive')
  })

  it('rejects legacy chainId 62831 and old Base/RH token binds', () => {
    expect(LEGACY_FORBIDDEN_CHAIN_IDS.has(62831)).toBe(true)
    const legacyChain = parseAndValidateRouteState(
      canonicalFixture({ networkPatches: { robinhood: { chain_id: 62831 } } }),
    )
    expect(legacyChain.ok).toBe(false)

    const legacyToken = parseAndValidateRouteState(
      canonicalFixture({
        networkPatches: { base: { token: '0xC92B49ddF9312cbfc01Ad397963dF915C7a2399E' } },
      }),
    )
    expect(legacyToken.ok).toBe(false)
    if (legacyToken.ok !== false) return
    expect(legacyToken.reason).toBe('legacy_identity')
    expect(LEGACY_RETIRED_BASE_RH_TOKEN).toBe('0xc92b49ddf9312cbfc01ad397963df915c7a2399e')
  })

  it('validates BNB/Base and BNB/Robinhood identities', () => {
    expect(EXPECTED_NETWORK_IDENTITY.bnb).toEqual({ chainId: 56, eid: 30102 })
    expect(EXPECTED_NETWORK_IDENTITY.base).toEqual({ chainId: 8453, eid: 30184 })
    expect(EXPECTED_NETWORK_IDENTITY.robinhood).toEqual({ chainId: 4663, eid: 30416 })
    const badBase = parseAndValidateRouteState(
      canonicalFixture({ networkPatches: { base: { eid: 99999 } } }),
    )
    expect(badBase.ok).toBe(false)
  })

  it('uses short TTL cache and never returns stale ENABLED beyond TTL', async () => {
    let calls = 0
    const fetchImpl = vi.fn(async () => {
      calls += 1
      const body =
        calls === 1
          ? canonicalFixture({
              global_execution_enabled: true,
              solanaPaused: false,
              routePatches: {
                'bnb>base': { execution_enabled: true, publicly_active: true, paused: false },
              },
            })
          : canonicalFixture({ global_execution_enabled: false })
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const first = await fetchMarcoBridgeRouteAuthority({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: 1_000,
    })
    expect(first.ok).toBe(true)
    if (!first.ok) return
    expect(first.executableRouteCount).toBe(1)

    const cached = await fetchMarcoBridgeRouteAuthority({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: 1_000 + ROUTE_STATE_CACHE_TTL_MS - 1,
    })
    expect(cached.ok).toBe(true)
    expect(calls).toBe(1)

    const refreshed = await fetchMarcoBridgeRouteAuthority({
      fetchImpl: fetchImpl as unknown as typeof fetch,
      now: 1_000 + ROUTE_STATE_CACHE_TTL_MS + 1,
    })
    expect(refreshed.ok).toBe(true)
    if (!refreshed.ok) return
    expect(calls).toBe(2)
    expect(refreshed.globalExecutionEnabled).toBe(false)
    expect(refreshed.executableRouteCount).toBe(0)
  })

  it('ignores client override query parameters', () => {
    const params = new URLSearchParams('enable=1&global_execution_enabled=true&route=BNB_BASE')
    const resolved = resolveClientRouteOverrideAttempts(params)
    expect(resolved.applied).toBe(false)
    expect(resolved.ignored).toEqual(
      expect.arrayContaining(['enable', 'global_execution_enabled', 'route']),
    )
  })

  it('does not invent extra routes from chain presence alone', () => {
    const parsed = parseAndValidateRouteState(canonicalFixture())
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return
    // Dropping a route must fail closed — cannot infer from networks.
    const missing = structuredClone(canonicalFixture())
    missing.data.routes = missing.data.routes.filter((r) => !(r.from === 'bnb' && r.to === 'base'))
    expect(parseAndValidateRouteState(missing).ok).toBe(false)
  })

  it('live canonical endpoint matches DEX authority mapping (shared truth)', async () => {
    const result = await fetchMarcoBridgeRouteAuthority({ forceRefresh: true })
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.globalExecutionEnabled).toBe(false)
    expect(result.executableRouteCount).toBe(0)
    expect(result.routes.map((r) => r.id).sort()).toEqual([...CANONICAL_ROUTE_IDS].sort())
    expect(result.routes.every((r) => r.executable === false)).toBe(true)
    const solana = result.networks.find((n) => n.id === 'solana')
    expect(solana?.paused).toBe(true)
    expect(result.networks.find((n) => n.id === 'bnb')?.chain_id).toBe(56)
    expect(result.networks.find((n) => n.id === 'base')?.chain_id).toBe(8453)
    expect(result.networks.find((n) => n.id === 'robinhood')?.chain_id).toBe(4663)
    expect(result.networks.some((n) => n.chain_id === 62831)).toBe(false)
  })
})
