import { describe, expect, it } from 'vitest'
import { BRIDGE_COPY, resolveSubmitCta } from '../bridgeActionState'
import {
  applyCanonicalBnbSolanaApplicationGate,
  CANONICAL_BNB_ROBINHOOD_GATE_REASON,
} from '../canonicalBnbSolanaGate'
import { isRouteExecutable, resolveRouteExecution, routeExecutionBlockers } from '../executableRoutes'
import { assertCanonicalRouteAuthority, type CanonicalMmnRouteState } from '../routeAuthority'
import { buildMarcoBridgeTransactions } from '../transactionBuilder'
import type { MarcoBridgeQuote } from '../types'
import { MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const founder = '0xe6A3e3D6F4e8337AB5c1BdAF06a7fa741b08B8ab'

const staleEnvelope = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-12',
    hub: 'bnb' as const,
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
      paused: false,
    })),
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
      publicly_active: false,
      execution_enabled: false,
      paused: false,
      reason: 'Certified route. Public activation has not been authorized yet.',
    })),
  },
})

const liveQuote = (): MarcoBridgeQuote => ({
  amount: '20000000',
  expectedReceive: '20000000',
  nativeFee: '0.000755787527862431',
  nativeFeeWei: '755787527862431',
  nativeFeeSymbol: 'BNB',
  routeLabel: 'BNB → Robinhood',
  quotedAt: '2026-09-08T13:05:55.243Z',
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

const overlay = (authority = assertCanonicalRouteAuthority(staleEnvelope())): CanonicalMmnRouteState =>
  applyCanonicalBnbSolanaApplicationGate(authority, { solanaStorePaused: false })

describe('BNB→Robinhood review/submit uses the same executable overlay as quote', () => {
  it('flips stale MMN publicly_active flags for BNB↔Robinhood only', () => {
    const live = overlay()
    const forward = live.routes.find((route) => route.from === 'bnb' && route.to === 'robinhood')
    const reverse = live.routes.find((route) => route.from === 'robinhood' && route.to === 'bnb')
    const base = live.routes.find((route) => route.from === 'bnb' && route.to === 'base')
    expect(forward).toMatchObject({
      publicly_active: true,
      execution_enabled: true,
      paused: false,
      reason: CANONICAL_BNB_ROBINHOOD_GATE_REASON,
    })
    expect(reverse?.publicly_active).toBe(true)
    expect(base?.publicly_active).toBe(false)
    expect(isRouteExecutable('bnb', 'robinhood', live)).toBe(true)
    expect(isRouteExecutable('robinhood', 'bnb', live)).toBe(true)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    expect(routeExecutionBlockers('bnb', 'robinhood', live)).toEqual([])
  })

  it('keeps real pause / identity blockers fail-closed', () => {
    const paused = applyCanonicalBnbSolanaApplicationGate(
      {
        ...assertCanonicalRouteAuthority(staleEnvelope()),
        routes: assertCanonicalRouteAuthority(staleEnvelope()).routes.map((route) =>
          route.from === 'bnb' && route.to === 'robinhood' ? { ...route, paused: true } : route,
        ),
      },
      { solanaStorePaused: false },
    )
    expect(isRouteExecutable('bnb', 'robinhood', paused)).toBe(false)
    expect(resolveRouteExecution('bnb', 'robinhood', paused, liveQuote()).executable).toBe(false)
  })

  it('review/submit CTA reaches wallet-signing for a live 20M quote', () => {
    const authority = overlay()
    const quote = liveQuote()
    const execution = resolveRouteExecution('bnb', 'robinhood', authority, quote)
    expect(execution).toEqual({ executable: true, blockers: [] })

    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'robinhood',
        amount: '20000000',
        sourceWallet: founder,
        destinationWallet: founder,
        allowanceLD: '0',
      },
      quote,
      authority,
    )
    expect(built.executable).toBe(true)
    expect(built.blockers).toEqual([])
    expect(built.approvalRequired).toBe(true)
    expect(built.sendParam.dstEid).toBe(30416)
    expect(built.sendParam.amountLD).toBe('20000000000000000000000000')
    expect(built.transactions[0]).toMatchObject({ purpose: 'approve', chainId: 56 })
    expect(built.transactions[1]).toMatchObject({
      purpose: 'oft_send',
      chainId: 56,
      to: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
    })

    const cta = resolveSubmitCta({
      from: 'bnb',
      to: 'robinhood',
      connectedChainId: 56,
      executable: execution.executable,
      approvalRequired: built.approvalRequired,
      submitting: false,
      quote,
      tracking: { status: 'review' },
      nowMs: Date.parse(quote.quotedAt),
    })
    expect(cta).toEqual({ label: BRIDGE_COPY.approveMarco, disabled: false, reason: null })
    expect(cta.label).not.toBe('SUBMISSION DISABLED')
    expect(cta.reason).not.toBe('This route is not publicly executable.')
  })

  it('a live quote can unlock review while route-state is still loading', () => {
    const execution = resolveRouteExecution('bnb', 'robinhood', null, liveQuote())
    expect(execution.executable).toBe(true)
    const cta = resolveSubmitCta({
      from: 'bnb',
      to: 'robinhood',
      connectedChainId: 56,
      executable: execution.executable,
      approvalRequired: true,
      submitting: false,
      quote: liveQuote(),
      tracking: { status: 'review' },
      nowMs: Date.parse(liveQuote().quotedAt),
    })
    expect(cta.disabled).toBe(false)
    expect(cta.label).toBe(BRIDGE_COPY.approveMarco)
  })

  it('does not unlock Base from a Robinhood live quote', () => {
    expect(resolveRouteExecution('bnb', 'base', overlay(), liveQuote()).executable).toBe(false)
  })
})
