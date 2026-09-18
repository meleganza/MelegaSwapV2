import { describe, expect, it } from 'vitest'
import {
  applyCanonicalBnbSolanaApplicationGate,
  CANONICAL_ARC_BNB_GATE_REASON,
  CANONICAL_BNB_ARC_GATE_REASON,
} from '../canonicalBnbSolanaGate'
import { isActivationRoute, isRouteExecutable, MARCO_BRIDGE_ACTIVATION_ROUTES, resolveRouteExecution } from '../executableRoutes'
import {
  assertCanonicalRouteAuthority,
  fetchCanonicalRouteAuthority,
} from '../routeAuthority'
import { MARCO_WAVE1_NETWORKS, localRouteActivationEnabled } from '../wave1Registry'

const canonicalEnvelope = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-26T00:00:00.000Z',
    hub: 'bnb',
    global_execution_enabled: false,
    networks: [
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
        paused: true,
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
    ],
    routes: [
      ['bnb', 'base', false],
      ['base', 'bnb', false],
      ['bnb', 'solana', true],
      ['solana', 'bnb', true],
      ['bnb', 'robinhood', false],
      ['robinhood', 'bnb', false],
    ].map(([from, to, paused]) => ({
      from,
      to,
      certified: true,
      publicly_active: false,
      execution_enabled: false,
      paused,
      reason: paused ? 'protective_pause' : 'public_activation_disabled',
    })),
  },
})

describe('canonical MMN route authority binding', () => {
  it('accepts the exact certified mainnet registry and exposes no null binding', () => {
    const state = assertCanonicalRouteAuthority(canonicalEnvelope())
    expect(state.global_execution_enabled).toBe(false)
    expect(state.networks.map(({ id, eid, chain_id }) => ({ id, eid, chain_id }))).toEqual([
      { id: 'bnb', eid: 30102, chain_id: 56 },
      { id: 'base', eid: 30184, chain_id: 8453 },
      { id: 'solana', eid: 30168, chain_id: null },
      { id: 'robinhood', eid: 30416, chain_id: 4663 },
    ])
    expect(Object.values(MARCO_WAVE1_NETWORKS).every((network) => network.layerZeroEid > 0)).toBe(true)
  })

  it('fails closed on retired Robinhood 62831 or a retired canonical token', () => {
    const wrongChain = canonicalEnvelope()
    wrongChain.data.networks[3].chain_id = 62831
    expect(() => assertCanonicalRouteAuthority(wrongChain)).toThrow('62831')

    const wrongToken = canonicalEnvelope()
    wrongToken.data.networks[1].token = MARCO_WAVE1_NETWORKS.bnb.endpointContract
    expect(() => assertCanonicalRouteAuthority(wrongToken)).toThrow('binding mismatch')
  })

  it('accepts canonical BNB↔Base publicly_active/execution_enabled without opening Melega local Base execution', async () => {
    const publicBase = canonicalEnvelope()
    publicBase.data.routes[0].publicly_active = true
    publicBase.data.routes[0].execution_enabled = true
    publicBase.data.routes[1].publicly_active = true
    publicBase.data.routes[1].execution_enabled = true

    const accepted = assertCanonicalRouteAuthority(publicBase)
    expect(accepted.routes[0]).toMatchObject({ from: 'bnb', to: 'base', publicly_active: true, execution_enabled: true })
    expect(accepted.routes[1]).toMatchObject({ from: 'base', to: 'bnb', publicly_active: true, execution_enabled: true })

    expect(MARCO_BRIDGE_ACTIVATION_ROUTES).toEqual([
      ['bnb', 'robinhood'],
      ['robinhood', 'bnb'],
      ['bnb', 'solana'],
      ['solana', 'bnb'],
      ['bnb', 'arc'],
      ['arc', 'bnb'],
    ])
    expect(isActivationRoute('bnb', 'base')).toBe(false)
    expect(isActivationRoute('base', 'bnb')).toBe(false)
    expect(localRouteActivationEnabled('bnb', 'base')).toBe(false)
    expect(localRouteActivationEnabled('base', 'bnb')).toBe(false)
    expect(isRouteExecutable('bnb', 'base', accepted)).toBe(false)
    expect(isRouteExecutable('base', 'bnb', accepted)).toBe(false)
    expect(resolveRouteExecution('bnb', 'base', accepted).executable).toBe(false)
    expect(resolveRouteExecution('bnb', 'base', accepted).blockers.join(' ')).not.toMatch(/unavailable|503/i)

    const fetcher = (async () => ({
      ok: true,
      status: 200,
      json: async () => publicBase,
    })) as unknown as typeof fetch
    const ingested = await fetchCanonicalRouteAuthority(fetcher, async () => ({
      ok: true,
      paused: true,
      store: MARCO_WAVE1_NETWORKS.solana.endpointContract,
      owner: 'owner',
      mint: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
    }))
    expect(ingested.routes.some((route) => route.from === 'bnb' && route.to === 'base' && route.publicly_active)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', ingested)).toBe(false)
  })

  it('keeps BNB↔Arc application overlay available when canonical BNB↔Base is active', () => {
    const publicBase = canonicalEnvelope()
    publicBase.data.routes[0].publicly_active = true
    publicBase.data.routes[0].execution_enabled = true
    publicBase.data.routes[1].publicly_active = true
    publicBase.data.routes[1].execution_enabled = true

    const live = applyCanonicalBnbSolanaApplicationGate(assertCanonicalRouteAuthority(publicBase), {
      solanaStorePaused: false,
    })
    const forward = live.routes.find((route) => route.from === 'bnb' && route.to === 'arc')
    const reverse = live.routes.find((route) => route.from === 'arc' && route.to === 'bnb')
    expect(forward).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
      reason: CANONICAL_BNB_ARC_GATE_REASON,
    })
    expect(reverse).toMatchObject({
      certified: true,
      publicly_active: true,
      execution_enabled: true,
      reason: CANONICAL_ARC_BNB_GATE_REASON,
    })
    expect(isRouteExecutable('bnb', 'arc', live)).toBe(true)
    expect(isRouteExecutable('arc', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
  })

  it('still allows BNB↔Robinhood plus Solana unpause', () => {
    const publicRobinhood = canonicalEnvelope()
    publicRobinhood.data.routes[4].publicly_active = true
    publicRobinhood.data.routes[4].execution_enabled = true
    expect(assertCanonicalRouteAuthority(publicRobinhood).routes[4].publicly_active).toBe(true)

    const unpausedSolana = canonicalEnvelope()
    unpausedSolana.data.networks[2].paused = false
    unpausedSolana.data.routes[2].paused = false
    unpausedSolana.data.routes[3].paused = false
    expect(assertCanonicalRouteAuthority(unpausedSolana).networks[2].paused).toBe(false)
  })

  it('fails closed on forbidden Arc testnet and retired-address leakage', () => {
    const testnet = canonicalEnvelope()
    testnet.data.networks.push({
      id: 'arc',
      name: 'Arc',
      family: 'evm',
      chain_id: 5042002,
      eid: 40434,
      model: 'evm_oft',
      token: MARCO_WAVE1_NETWORKS.arc.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.arc.endpointContract,
      requires_approval: false,
      paused: false,
    })
    expect(() => assertCanonicalRouteAuthority(testnet)).toThrow(/5042002|40434/)

    const retiredArc = canonicalEnvelope()
    retiredArc.data.networks.push({
      id: 'arc',
      name: 'Arc',
      family: 'evm',
      chain_id: 5042,
      eid: 30417,
      model: 'evm_oft',
      token: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      requires_approval: false,
      paused: false,
    })
    expect(() => assertCanonicalRouteAuthority(retiredArc)).toThrow(/mismatch|Retired BNB adapter/)
  })
})
