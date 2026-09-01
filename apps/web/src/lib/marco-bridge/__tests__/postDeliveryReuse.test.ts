import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { describe, expect, it } from 'vitest'
import {
  applyBridgeRouteSelection,
  beginNewBridgeTransfer,
  BRIDGE_COPY,
  isCompletedDelivery,
  resolveSubmitCta,
  shouldShowCompletedDeliveryCard,
  sourceSubmissionLocksControls,
} from '../bridgeActionState'
import { isRouteExecutable } from '../executableRoutes'
import { planMarcoBridgeRoute } from '../routePolicy'
import type { CanonicalMmnRouteState } from '../routeAuthority'
import type { MarcoBridgeQuote, MarcoBridgeTracking } from '../types'
import { localRouteActivationEnabled, MARCO_WAVE1_NETWORKS } from '../wave1Registry'

const WEB_ROOT = join(dirname(new URL(import.meta.url).pathname), '../../../..')

const liveQuote = (): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei: '72607980676756',
  nativeFeeSymbol: 'BNB',
  routeLabel: 'BNB → Solana',
  quotedAt: '2026-09-01T12:00:00.000Z',
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

const delivered: MarcoBridgeTracking = {
  status: 'delivered',
  sourceTx: '0xabc',
  destinationTx: '0xdef',
  guid: 'guid-1',
}

const inFlight: MarcoBridgeTracking[] = [
  { status: 'submitted', sourceTx: '0xabc' },
  { status: 'source-confirmed', sourceTx: '0xabc' },
  { status: 'verifying', sourceTx: '0xabc' },
  { status: 'destination-executing', sourceTx: '0xabc' },
  { status: 'action-required', sourceTx: '0xabc' },
]

const liveAuthority = (): CanonicalMmnRouteState => ({
  binding_version: 'mmn.mainnet.1.0.0',
  updated_at: '2026-09-01T00:00:00.000Z',
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
      token: MARCO_WAVE1_NETWORKS.bnb.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.bnb.endpointContract,
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
      token: MARCO_WAVE1_NETWORKS.base.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.base.endpointContract,
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
      token: MARCO_WAVE1_NETWORKS.solana.marcoIdentity,
      token_decimals: 9,
      endpoint_contract: MARCO_WAVE1_NETWORKS.solana.endpointContract,
      requires_approval: false,
      paused: false,
    },
    {
      id: 'robinhood',
      name: 'Robinhood Chain',
      family: 'evm',
      chain_id: 4663,
      eid: 30416,
      model: 'evm_oft',
      token: MARCO_WAVE1_NETWORKS.robinhood.marcoIdentity,
      token_decimals: 18,
      endpoint_contract: MARCO_WAVE1_NETWORKS.robinhood.endpointContract,
      requires_approval: false,
      paused: false,
    },
  ],
  routes: [
    ['bnb', 'base', true],
    ['base', 'bnb', true],
    ['bnb', 'solana', false],
    ['solana', 'bnb', false],
    ['bnb', 'robinhood', false],
    ['robinhood', 'bnb', false],
  ].map(([from, to, paused]) => ({
    from: from as CanonicalMmnRouteState['routes'][number]['from'],
    to: to as CanonicalMmnRouteState['routes'][number]['to'],
    certified: true,
    publicly_active: false,
    execution_enabled: false,
    paused: Boolean(paused),
    reason: paused ? 'protective_pause' : 'public_activation_disabled',
  })),
})

describe('post-delivery route reuse', () => {
  it('locks From/To/⇄ while an unresolved broadcast sourceTx is in flight', () => {
    for (const tracking of inFlight) {
      expect(sourceSubmissionLocksControls(tracking)).toBe(true)
      expect(isCompletedDelivery(tracking)).toBe(false)
      expect(
        resolveSubmitCta({
          from: 'bnb',
          to: 'solana',
          connectedChainId: 56,
          executable: true,
          approvalRequired: false,
          submitting: false,
          quote: liveQuote(),
          tracking,
          nowMs: Date.parse(liveQuote().quotedAt),
        }),
      ).toMatchObject({ label: BRIDGE_COPY.bridgeInProgress, disabled: true })
    }
  })

  it('unlocks form controls after a genuine delivered broadcast while showing BRIDGE COMPLETE', () => {
    expect(isCompletedDelivery(delivered)).toBe(true)
    expect(sourceSubmissionLocksControls(delivered)).toBe(false)
    expect(shouldShowCompletedDeliveryCard(delivered)).toBe(true)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: false,
        submitting: false,
        quote: liveQuote(),
        tracking: delivered,
        nowMs: Date.parse(liveQuote().quotedAt),
      }),
    ).toMatchObject({ label: BRIDGE_COPY.bridgeComplete, disabled: true })
  })

  it('keeps the completed delivery card across a background re-render until a deliberate route change', () => {
    expect(shouldShowCompletedDeliveryCard(delivered)).toBe(true)
    expect(shouldShowCompletedDeliveryCard({ ...delivered })).toBe(true)
    const inFlightSelection = applyBridgeRouteSelection({
      tracking: { status: 'submitted', sourceTx: '0xabc' },
      nextFrom: 'solana',
      nextTo: 'bnb',
    })
    expect(inFlightSelection.resetCompletedTransfer).toBe(false)
    expect(shouldShowCompletedDeliveryCard(delivered)).toBe(true)
  })

  it('reverses BNB→Solana into Solana→BNB after delivery and clears stale transfer state', () => {
    const next = applyBridgeRouteSelection({
      tracking: delivered,
      nextFrom: 'solana',
      nextTo: 'bnb',
    })
    expect(next.resetCompletedTransfer).toBe(true)
    expect(next).toMatchObject({
      from: 'solana',
      to: 'bnb',
      destination: '',
      quote: null,
      review: false,
      allowanceLD: null,
      nativeBalanceWei: null,
      gasPriceWei: null,
      nativeReadState: 'idle',
      error: '',
      submitting: false,
      submissionPhase: 'idle',
      tracking: { status: 'idle' },
    })
    expect(next.tracking).not.toHaveProperty('sourceTx')
    expect(shouldShowCompletedDeliveryCard(next.tracking)).toBe(false)
    expect(planMarcoBridgeRoute(next.from, next.to)).toMatchObject({ kind: 'direct', legs: ['solana', 'bnb'] })
    expect(localRouteActivationEnabled(next.from, next.to)).toBe(true)
    expect(isRouteExecutable(next.from, next.to, liveAuthority())).toBe(true)
  })

  it('applies the same new-transfer reset when From or To changes after delivery', () => {
    const fromChange = applyBridgeRouteSelection({
      tracking: delivered,
      nextFrom: 'robinhood',
      nextTo: 'solana',
    })
    const toChange = applyBridgeRouteSelection({
      tracking: delivered,
      nextFrom: 'bnb',
      nextTo: 'base',
    })
    expect(fromChange.resetCompletedTransfer).toBe(true)
    expect(toChange.resetCompletedTransfer).toBe(true)
    expect(fromChange.tracking).toEqual({ status: 'idle' })
    expect(toChange.tracking).toEqual({ status: 'idle' })
    expect(fromChange.quote).toBeNull()
    expect(toChange.quote).toBeNull()
  })

  it('does not expand executable routes when the reversed Solana source is displayed', () => {
    const authority = liveAuthority()
    expect(isRouteExecutable('bnb', 'solana', authority)).toBe(true)
    expect(isRouteExecutable('solana', 'bnb', authority)).toBe(true)
    expect(isRouteExecutable('solana', 'base', authority)).toBe(false)
    expect(isRouteExecutable('solana', 'robinhood', authority)).toBe(false)
    expect(isRouteExecutable('base', 'solana', authority)).toBe(false)
    expect(isRouteExecutable('robinhood', 'solana', authority)).toBe(false)
    expect(localRouteActivationEnabled('solana', 'bnb')).toBe(true)
    expect(localRouteActivationEnabled('solana', 'base')).toBe(false)
    expect(localRouteActivationEnabled('solana', 'robinhood')).toBe(false)
    expect(beginNewBridgeTransfer('solana', 'base').tracking).toEqual({ status: 'idle' })
    expect(isRouteExecutable('solana', 'base', authority)).toBe(false)
  })

  it('wires the workspace ⇄ and From/To handlers through applyBridgeRouteSelection', () => {
    const workspace = readFileSync(join(WEB_ROOT, 'src/views/MarcoBridge/MarcoBridgeWorkspace.tsx'), 'utf8')
    expect(workspace).toContain('applyBridgeRouteSelection')
    expect(workspace).toContain('applyRouteChange(to, from)')
    expect(workspace).toContain('applyRouteChange(event.target.value as MarcoBridgeNetworkId, to)')
    expect(workspace).toContain('applyRouteChange(from, event.target.value as MarcoBridgeNetworkId)')
    expect(workspace).toContain('shouldShowCompletedDeliveryCard')
    expect(workspace).toContain('disabled={sourceLocked}')
  })
})
