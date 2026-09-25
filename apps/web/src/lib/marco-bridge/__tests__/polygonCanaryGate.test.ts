import { describe, expect, it, vi } from 'vitest'
import { applyPolygonBinding } from '../polygonAuthority'
import { resolveRouteExecution } from '../executableRoutes'
import { readOnlyMarcoBridgeQuote } from '../quoteTransport'
import { buildMarcoBridgeTransactions, OFT_SEND_IFACE } from '../transactionBuilder'
import { simulateMarcoBridgeBuild } from '../simulate'
import { assertCanonicalRouteAuthority, type CanonicalMmnRouteState } from '../routeAuthority'
import { MARCO_WAVE1_NETWORKS, MARCO_WAVE1_DIRECT_ROUTES, localRouteActivationEnabled } from '../wave1Registry'
import { ensurePolygonWalletNetwork } from '../polygonChain'

const founder = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const recipient = '0x1111111111111111111111111111111111111111'
const authority = (): CanonicalMmnRouteState => ({
  binding_version: 'test',
  updated_at: new Date().toISOString(),
  hub: 'bnb',
  global_execution_enabled: true,
  networks: Object.values(MARCO_WAVE1_NETWORKS).map((n) => ({
    id: n.id,
    name: n.label,
    family: n.walletFamily,
    chain_id: n.chainId,
    eid: n.layerZeroEid,
    model: n.id === 'bnb' ? 'evm_oft_adapter' : n.id === 'solana' ? 'solana_oft' : 'evm_oft',
    token: n.marcoIdentity,
    token_decimals: n.tokenDecimals,
    endpoint_contract: n.endpointContract,
    requires_approval: n.id === 'bnb',
    paused: false,
  })),
  routes: MARCO_WAVE1_DIRECT_ROUTES.map((r) => ({
    ...r,
    certified: true,
    publicly_active: true,
    execution_enabled: true,
    paused: false,
    reason: 'test',
  })),
})
const live = { verified: true, reason: 'verified' }

describe('Polygon reverse canary gate', () => {
  it('activates the certified round-trip without changing other routes', () => {
    const original = authority(),
      state = applyPolygonBinding(original, live)
    for (const [from, to] of [
      ['bnb', 'polygon'],
      ['polygon', 'bnb'],
    ] as const) {
      expect(resolveRouteExecution(from, to, state).executable).toBe(true)
      expect(localRouteActivationEnabled(from, to)).toBe(true)
      expect(state.routes.find((r) => r.from === from && r.to === to)).toMatchObject({
        certified: true,
        publicly_active: true,
        execution_enabled: true,
        live_binding_verified: true,
      })
      expect(
        resolveRouteExecution(from, to, null, { live: true, executionEnabled: true, routePaused: false }).executable,
      ).toBe(true)
    }
    expect(state.routes.filter((r) => r.from !== 'polygon' && r.to !== 'polygon')).toEqual(
      original.routes.filter((r) => r.from !== 'polygon' && r.to !== 'polygon'),
    )
    expect(localRouteActivationEnabled('bnb', 'base')).toBe(false)
  })
  it('quotes and builds both directions with arbitrary recipients and simulates unsigned calls', async () => {
    for (const [from, to] of [
      ['bnb', 'polygon'],
      ['polygon', 'bnb'],
    ] as const) {
      const state = applyPolygonBinding(authority(), live)
      const quote = await readOnlyMarcoBridgeQuote(
        { from, to, amount: '0.000001', destinationWallet: recipient },
        state,
        {
          quoteSend: async () => ({ nativeFee: '100' }),
          quoteOft: async () => ({ amountReceivedLD: '1000000000000' }),
        },
      )
      expect(quote.executionEnabled).toBe(true)
      const build = buildMarcoBridgeTransactions(
        {
          from,
          to,
          amount: '0.000001',
          sourceWallet: founder,
          destinationWallet: recipient,
          allowanceLD: '1000000000000',
        },
        quote,
        state,
      )
      expect(build.executable).toBe(true)
      const tx = build.transactions[0]
      expect(tx.family).toBe('evm')
      if (tx.family !== 'evm') throw Error('Expected EVM')
      const decoded = OFT_SEND_IFACE.decodeFunctionData('send', tx.data)
      expect(decoded.sendParam.to.toLowerCase()).toBe('0x000000000000000000000000' + recipient.slice(2))
      expect(tx.chainId).toBe(from === 'polygon' ? 137 : 56)
      expect(tx.nativeFeeSymbol).toBe(from === 'polygon' ? 'POL' : 'BNB')
      const ethCall = vi.fn().mockResolvedValue({ ok: true, reverted: false })
      expect((await simulateMarcoBridgeBuild(build, { ethCall })).ok).toBe(true)
      expect(ethCall).toHaveBeenCalledTimes(1)
    }
  })
  it('fails closed on RPC failure and preserves upstream pause', async () => {
    const state = applyPolygonBinding(authority(), { verified: false, reason: 'peer mismatch' })
    expect(resolveRouteExecution('polygon', 'bnb', state).executable).toBe(false)
    expect(resolveRouteExecution('bnb', 'polygon', state).executable).toBe(false)
    await expect(
      readOnlyMarcoBridgeQuote(
        { from: 'polygon', to: 'bnb', amount: '0.000001', destinationWallet: recipient },
        state,
        { quoteSend: vi.fn(), quoteOft: vi.fn() },
      ),
    ).rejects.toThrow()
    const original = authority()
    original.routes.find((r) => r.from === 'polygon')!.paused = true
    expect(applyPolygonBinding(original, live).routes.find((r) => r.from === 'polygon')?.paused).toBe(true)
  })
  it('rejects a stale standalone Polygon identity', () => {
    const state = authority()
    state.networks.find((n) => n.id === 'polygon')!.token = '0xD3e28c74177B812d1543A406aD1A97ee3C398AC2'
    expect(() =>
      assertCanonicalRouteAuthority({ schema_version: '1', provenance: 'canonical_registry', data: state }),
    ).toThrow('binding mismatch for polygon')
  })
  it('switches/adds Polygon with POL metadata', async () => {
    const request = vi.fn().mockRejectedValueOnce({ code: 4902 }).mockResolvedValue(undefined)
    await ensurePolygonWalletNetwork({ request })
    expect(request.mock.calls[0][0]).toEqual({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x89' }] })
    expect(request.mock.calls[1][0].params[0]).toMatchObject({
      chainId: '0x89',
      nativeCurrency: { symbol: 'POL' },
      rpcUrls: ['https://polygon-bor-rpc.publicnode.com'],
    })
  })
})
