import { describe, expect, it } from 'vitest'
import { assertCanonicalRouteAuthority } from '../routeAuthority'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

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

  it('accepts a consistent explicitly active route and rejects partial activation', () => {
    const publicRoute = canonicalEnvelope()
    publicRoute.data.global_execution_enabled = true
    publicRoute.data.routes[0].publicly_active = true
    publicRoute.data.routes[0].execution_enabled = true
    expect(assertCanonicalRouteAuthority(publicRoute).routes[0].execution_enabled).toBe(true)

    const partialRoute = canonicalEnvelope()
    partialRoute.data.routes[0].execution_enabled = true
    expect(() => assertCanonicalRouteAuthority(partialRoute)).toThrow('unsafe execution state')
  })

  it('requires Solana network and route pause states to agree', () => {
    const unpausedSolana = canonicalEnvelope()
    unpausedSolana.data.networks[2].paused = false
    expect(() => assertCanonicalRouteAuthority(unpausedSolana)).toThrow('disagree')

    unpausedSolana.data.routes[2].paused = false
    unpausedSolana.data.routes[3].paused = false
    expect(assertCanonicalRouteAuthority(unpausedSolana).networks[2].paused).toBe(false)
  })
})
