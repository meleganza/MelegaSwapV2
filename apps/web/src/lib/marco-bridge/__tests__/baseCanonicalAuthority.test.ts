import { readFileSync } from 'fs'
import { join } from 'path'
import { describe, expect, it, vi } from 'vitest'
import { applyCanonicalBnbSolanaApplicationGate } from '../canonicalBnbSolanaGate'
import { FORBIDDEN_ARC_TESTNET_CHAIN_ID, FORBIDDEN_ARC_TESTNET_EID } from '../arcChain'
import {
  isActivationRoute,
  isRouteExecutable,
  MARCO_BRIDGE_ACTIVATION_ROUTES,
  resolveRouteExecution,
} from '../executableRoutes'
import {
  assertCanonicalRouteAuthority,
  fetchCanonicalRouteAuthority,
  type CanonicalMmnNetwork,
} from '../routeAuthority'
import { localRouteActivationEnabled, MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const LIB_ROOT = join(__dirname, '..')

const envelope = () => ({
  schema_version: '1' as const,
  provenance: 'canonical_registry' as const,
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-09-18T00:00:00.000Z',
    hub: 'bnb' as const,
    global_execution_enabled: false,
    networks: [
      {
        id: 'bnb' as const,
        name: 'BNB Smart Chain',
        family: 'evm' as const,
        chain_id: 56,
        eid: 30102,
        model: 'evm_oft_adapter' as const,
        token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
        requires_approval: true,
        paused: false,
      },
      {
        id: 'base' as const,
        name: 'Base',
        family: 'evm' as const,
        chain_id: 8453,
        eid: 30184,
        model: 'evm_oft' as const,
        token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.base.endpointContract,
        requires_approval: false,
        paused: false,
      },
      {
        id: 'solana' as const,
        name: 'Solana',
        family: 'solana' as const,
        chain_id: null,
        eid: 30168,
        model: 'solana_oft' as const,
        token: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
        token_decimals: 9,
        endpoint_contract: MARCO_WAVE1_NETWORKS.solana.endpointContract,
        requires_approval: false,
        paused: false,
      },
      {
        id: 'robinhood' as const,
        name: 'Robinhood Chain',
        family: 'evm' as const,
        chain_id: 4663,
        eid: 30416,
        model: 'evm_oft' as const,
        token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
        token_decimals: 18,
        endpoint_contract: MARCO_WAVE1_NETWORKS.robinhood.endpointContract,
        requires_approval: false,
        paused: false,
      },
    ] as CanonicalMmnNetwork[],
    routes: [
      ['bnb', 'base'],
      ['base', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
    ].map(([from, to]) => ({
      from,
      to,
      certified: true,
      publicly_active: from === 'bnb' || from === 'base' ? from === 'base' || to === 'base' : false,
      execution_enabled: from === 'base' || to === 'base',
      paused: false,
      reason: from === 'base' || to === 'base' ? 'canonical_base_active' : 'certified',
    })),
  },
})

describe('canonical BNB↔Base authority is accepted without Melega Base execution', () => {
  it('accepts live MMN BNB↔Base publicly_active/execution_enabled=true', () => {
    const payload = envelope()
    payload.data.routes[0].publicly_active = true
    payload.data.routes[0].execution_enabled = true
    payload.data.routes[1].publicly_active = true
    payload.data.routes[1].execution_enabled = true
    const state = assertCanonicalRouteAuthority(payload)
    expect(state.routes.filter((route) => route.from === 'base' || route.to === 'base')).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ from: 'bnb', to: 'base', publicly_active: true, execution_enabled: true }),
        expect.objectContaining({ from: 'base', to: 'bnb', publicly_active: true, execution_enabled: true }),
      ]),
    )
  })

  it('does not make Base locally executable or an activation route', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(envelope()), {
      solanaStorePaused: false,
    })
    expect(MARCO_BRIDGE_ACTIVATION_ROUTES).toEqual([
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'polygon'],
      ['polygon', 'bnb'],
      ['bnb', 'arc'],
      ['arc', 'bnb'],
    ])
    expect(isActivationRoute('bnb', 'base')).toBe(false)
    expect(isActivationRoute('base', 'bnb')).toBe(false)
    expect(localRouteActivationEnabled('bnb', 'base')).toBe(false)
    expect(localRouteActivationEnabled('base', 'bnb')).toBe(false)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    expect(isRouteExecutable('base', 'bnb', live)).toBe(false)
    expect(resolveRouteExecution('bnb', 'base', live).executable).toBe(false)
    expect(resolveRouteExecution('bnb', 'base', live).blockers[0]).toMatch(/outside BNB↔Robinhood, BNB↔Solana, BNB↔Arc, and BNB↔Polygon/)
  })

  it('fetching live authority with Base active does not fail closed as unavailable/503', async () => {
    const payload = envelope()
    payload.data.routes[0].publicly_active = true
    payload.data.routes[0].execution_enabled = true
    payload.data.routes[1].publicly_active = true
    payload.data.routes[1].execution_enabled = true
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => payload,
    })
    const live = await fetchCanonicalRouteAuthority(fetcher as unknown as typeof fetch, async () => ({
      ok: true,
      paused: false,
      store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
      owner: '7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW',
      mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
    }))
    expect(live.routes.find((route) => route.from === 'bnb' && route.to === 'base')?.execution_enabled).toBe(true)
    expect(() => assertCanonicalRouteAuthority(payload)).not.toThrow()
    const handler = readFileSync(join(LIB_ROOT, '../../pages/api/marco-bridge/route-state.ts'), 'utf8')
    expect(handler).toContain("return res.status(200).json(state)")
    expect(handler).toContain("error: 'CANONICAL_ROUTE_AUTHORITY_UNAVAILABLE'")
    expect(handler).toMatch(/catch \(cause\)/)
    expect(readFileSync(join(LIB_ROOT, 'routeAuthority.ts'), 'utf8')).not.toContain(
      'Base MMN routes must remain disabled',
    )
  })

  it('keeps BNB↔Arc application overlay available when Base is canonically active', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(envelope()), {
      solanaStorePaused: false,
    })
    expect(live.routes.find((route) => route.from === 'bnb' && route.to === 'arc')).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
    })
    expect(live.routes.find((route) => route.from === 'arc' && route.to === 'bnb')).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
    })
    expect(isRouteExecutable('bnb', 'arc', live)).toBe(true)
    expect(isRouteExecutable('arc', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
  })

  it('still fails closed on forbidden Arc testnet IDs and retired adapter identities', () => {
    const testnet = envelope()
    testnet.data.networks.push({
      id: 'arc' as const,
      name: 'Arc',
      family: 'evm' as const,
      chain_id: FORBIDDEN_ARC_TESTNET_CHAIN_ID,
      eid: FORBIDDEN_ARC_TESTNET_EID,
      model: 'evm_oft' as const,
      token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.arc.endpointContract,
      requires_approval: false,
      paused: false,
    })
    expect(() => assertCanonicalRouteAuthority(testnet)).toThrow(/5042002|40434/)

    const retired = envelope()
    retired.data.networks[1].token = MARCO_WAVE1_NETWORKS.bnb.endpointContract
    retired.data.networks[1].endpoint_contract = MARCO_WAVE1_NETWORKS.bnb.endpointContract
    expect(() => assertCanonicalRouteAuthority(retired)).toThrow(/mismatch|Retired BNB adapter/)
  })
})
