import { BigNumber } from '@ethersproject/bignumber'
import { describe, expect, it, vi } from 'vitest'
import { readOnlyMarcoBridgeQuote } from '../quoteTransport'
import type { CanonicalMmnRouteState } from '../routeAuthority'
import { requestMarcoBridgeQuote } from '../service'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solana = '6SWgjmuTyPAcYYU77Mzf1gE6QA7ZcZsbsfiThz2cW1VF'

const authority = {
  binding_version: 'mmn.mainnet.1.0.0',
  updated_at: '2026-08-26T00:00:00.000Z',
  hub: 'bnb',
  global_execution_enabled: false,
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
    paused: network.id === 'solana',
  })),
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
} as CanonicalMmnRouteState

describe('read-only LayerZero quote transport', () => {
  it.each([
    ['base', evm, 30184, false],
    ['robinhood', evm, 30416, false],
    ['solana', solana, 30168, true],
  ] as const)('quotes BNB to %s with canonical parameters', async (to, destination, eid, paused) => {
    const quoteSend = vi.fn().mockResolvedValue({ nativeFee: BigNumber.from('72607980676756') })
    const quoteOft = vi.fn().mockResolvedValue({ amountReceivedLD: BigNumber.from('1000000000000') })
    const quote = await readOnlyMarcoBridgeQuote(
      { from: 'bnb', to, amount: '0.000001', destinationWallet: destination },
      authority,
      { quoteSend, quoteOft },
      '2026-08-26T00:00:00.000Z',
    )

    expect(quoteSend).toHaveBeenCalledWith(
      MARCO_WAVE1_NETWORKS.bnb.endpointContract,
      expect.objectContaining({ dstEid: eid, amountLD: '1000000000000', minAmountLD: '1000000000000' }),
    )
    expect(quote).toMatchObject({
      live: true,
      expectedReceive: '0.000001',
      nativeFee: '0.000072607980676756',
      nativeFeeSymbol: 'BNB',
      routePaused: paused,
      publiclyActive: false,
      executionEnabled: false,
    })
  })

  it('accepts only an actual successful live quote response', async () => {
    const response = {
      amount: '0.000001',
      expectedReceive: '0.000001',
      nativeFee: '0.0001',
      nativeFeeSymbol: 'BNB',
      routeLabel: 'BNB → Base',
      quotedAt: '2026-08-26T00:00:00.000Z',
      live: true as const,
      routePaused: false,
      publiclyActive: false as const,
      executionEnabled: false as const,
    }
    const fetcher = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => response })
    await expect(
      requestMarcoBridgeQuote(
        { from: 'bnb', to: 'base', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
        fetcher,
      ),
    ).resolves.toEqual(response)

    const unavailable = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ ...response, live: false }),
    })
    await expect(
      requestMarcoBridgeQuote(
        { from: 'bnb', to: 'base', amount: '0.000001', sourceWallet: evm, destinationWallet: evm },
        unavailable,
      ),
    ).rejects.toThrow('LayerZero quote failed')
  })
})
