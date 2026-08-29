import { describe, expect, it } from 'vitest'
import { assertMarcoRouteExecutable } from '../executionGate'
import type { CanonicalMmnRouteState } from '../routeAuthority'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const authority = (active: boolean): CanonicalMmnRouteState => ({
  binding_version: 'mmn.mainnet.1.0.0',
  updated_at: '2026-08-29T00:00:00.000Z',
  hub: 'bnb',
  global_execution_enabled: active,
  networks: Object.values(MARCO_WAVE1_NETWORKS).map((network) => ({
    id: network.id,
    name: network.label,
    family: network.walletFamily,
    chain_id: network.chainId,
    eid: network.layerZeroEid,
    model: network.id === 'bnb' ? 'evm_oft_adapter' : network.id === 'solana' ? 'solana_oft' : 'evm_oft',
    token: network.marcoIdentity,
    token_decimals: network.tokenDecimals,
    endpoint_contract: network.endpointContract,
    requires_approval: network.id === 'bnb',
    paused: false,
  })),
  routes: [
    {
      from: 'bnb',
      to: 'robinhood',
      certified: true,
      publicly_active: active,
      execution_enabled: active,
      paused: false,
      reason: active ? 'Route available.' : 'Public execution disabled.',
    },
  ],
})

describe('production execution gate', () => {
  it('opens only when global and route gates are all true', () => {
    expect(assertMarcoRouteExecutable(authority(true), 'bnb', 'robinhood').execution_enabled).toBe(true)
  })

  it('fails closed before canonical activation', () => {
    expect(() => assertMarcoRouteExecutable(authority(false), 'bnb', 'robinhood')).toThrow('not open')
  })
})
