import { describe, expect, it } from 'vitest'
import {
  BRIDGE_COPY,
  layerZeroScanTxUrl,
  liveQuoteBlockReason,
  marcoBridgeStepStates,
  operationalCopyMustNotRequireUnpause,
  resolveQuoteCta,
  resolveSubmitCta,
  sourceSubmissionLocksControls,
} from '../bridgeActionState'
import {
  applyCanonicalBnbSolanaApplicationGate,
  CANONICAL_BNB_SOLANA_GATE,
  CANONICAL_SOLANA_OFT_STORE_PAUSED,
} from '../canonicalBnbSolanaGate'
import { isRouteExecutable } from '../executableRoutes'
import { bridgeRecoveryMessage } from '../lifecycle'
import { assertCanonicalRouteAuthority, type CanonicalMmnRouteState } from '../routeAuthority'
import { parseOftStoreAccount, SOLANA_OFT_PROGRAM_ID, solanaUnpauseOperatorMessage } from '../solanaUnpause'
import { trackingFromLayerZeroMessages } from '../tracking'
import { buildMarcoBridgeTransactions, OFT_SEND_IFACE } from '../transactionBuilder'
import type { MarcoBridgeQuote, MarcoBridgeTracking } from '../types'
import { destinationToBytes32, parseBridgeAmount } from '../validation'
import { localRouteActivationEnabled, MARCO_WAVE1_NETWORKS, wave1ActivationBlockers } from '../wave1Registry'

const evm = '0x1111111111111111111111111111111111111111'
const solanaRecipient = CANONICAL_BNB_SOLANA_GATE.recipientExample

const staleEnvelope = () => ({
  schema_version: '1',
  provenance: 'canonical_registry',
  data: {
    binding_version: 'mmn.mainnet.1.0.0',
    updated_at: '2026-08-12',
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
        paused: true,
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

const staleAuthority = (): CanonicalMmnRouteState => assertCanonicalRouteAuthority(staleEnvelope())

const liveQuote = (quotedAt = '2026-09-01T12:00:00.000Z'): MarcoBridgeQuote => ({
  amount: '0.000001',
  expectedReceive: '0.000001',
  nativeFee: '0.000072607980676756',
  nativeFeeWei: '72607980676756',
  nativeFeeSymbol: 'BNB',
  routeLabel: 'BNB → Solana',
  quotedAt,
  live: true,
  routePaused: false,
  publiclyActive: true,
  executionEnabled: true,
})

const idleTracking = (): MarcoBridgeTracking => ({ status: 'review' })

describe('canonical BNB→Solana application gate', () => {
  it('1) paused=false makes only the canonical BNB→Solana route operational', () => {
    expect(CANONICAL_SOLANA_OFT_STORE_PAUSED).toBe(false)
    const paused = applyCanonicalBnbSolanaApplicationGate(staleAuthority(), { solanaStorePaused: true })
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority(), { solanaStorePaused: false })

    expect(isRouteExecutable('bnb', 'solana', paused)).toBe(false)
    expect(isRouteExecutable('bnb', 'solana', live)).toBe(true)
    expect(live.global_execution_enabled).toBe(false)
    expect(isRouteExecutable('solana', 'bnb', live)).toBe(false)
    expect(isRouteExecutable('bnb', 'base', live)).toBe(false)
    expect(isRouteExecutable('base', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'base', live)).toBe(false)
    expect(isRouteExecutable('solana', 'robinhood', live)).toBe(false)
    expect(isRouteExecutable('robinhood', 'solana', live)).toBe(false)
    expect(localRouteActivationEnabled('bnb', 'solana')).toBe(true)
    expect(localRouteActivationEnabled('solana', 'bnb')).toBe(false)
  })

  it('2) a valid live quote enables the BNB→Solana send flow', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority())
    const amount = parseBridgeAmount('0.000001', 18)
    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
        allowanceLD: amount?.amountLD.toString(),
      },
      liveQuote(),
      live,
    )
    expect(built.executable).toBe(true)
    expect(built.sendParam.dstEid).toBe(30168)
    expect(built.sendParam.extraOptions).toBe('0x')
    expect(built.sendParam.minAmountLD).toBe(built.sendParam.amountLD)
    expect(built.sendParam.to).toBe(destinationToBytes32(solanaRecipient, 'solana'))
    const decoded = OFT_SEND_IFACE.decodeFunctionData('send', (built.transactions[0] as { data: string }).data)
    expect(decoded.sendParam.dstEid).toBe(30168)
    const cta = resolveSubmitCta({
      from: 'bnb',
      to: 'solana',
      connectedChainId: 56,
      executable: true,
      approvalRequired: false,
      submitting: false,
      quote: liveQuote(),
      tracking: idleTracking(),
      nowMs: Date.parse(liveQuote().quotedAt),
    })
    expect(cta).toMatchObject({ label: BRIDGE_COPY.bridgeMarco, disabled: false })
  })

  it('3) allowance 0 shows APPROVE MARCO', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority())
    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
        allowanceLD: '0',
      },
      liveQuote(),
      live,
    )
    expect(built.approvalRequired).toBe(true)
    expect(built.transactions[0]).toMatchObject({ purpose: 'approve', chainId: 56 })
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: true,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.parse(liveQuote().quotedAt),
      }).label,
    ).toBe(BRIDGE_COPY.approveMarco)
  })

  it('4) sufficient allowance shows BRIDGE MARCO', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority())
    const amount = parseBridgeAmount('0.000001', 18)
    const built = buildMarcoBridgeTransactions(
      {
        from: 'bnb',
        to: 'solana',
        amount: '0.000001',
        sourceWallet: evm,
        destinationWallet: solanaRecipient,
        allowanceLD: amount?.amountLD.toString(),
      },
      liveQuote(),
      live,
    )
    expect(built.approvalRequired).toBe(false)
    expect(built.transactions).toHaveLength(1)
    expect(built.transactions[0]).toMatchObject({ purpose: 'oft_send', chainId: 56 })
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: false,
        submitting: false,
        quote: liveQuote(),
        tracking: idleTracking(),
        nowMs: Date.parse(liveQuote().quotedAt),
      }).label,
    ).toBe(BRIDGE_COPY.bridgeMarco)
  })

  it('5) an expired or failed quote disables send with an explicit reason', () => {
    const expired = resolveSubmitCta({
      from: 'bnb',
      to: 'solana',
      connectedChainId: 56,
      executable: true,
      approvalRequired: false,
      submitting: false,
      quote: liveQuote('2026-09-01T12:00:00.000Z'),
      tracking: idleTracking(),
      nowMs: Date.parse('2026-09-01T12:02:00.000Z'),
    })
    expect(expired.disabled).toBe(true)
    expect(expired.reason).toBe(BRIDGE_COPY.quoteExpired)
    expect(liveQuoteBlockReason(null)).toBe(BRIDGE_COPY.quoteFailed)
    expect(
      resolveSubmitCta({
        from: 'bnb',
        to: 'solana',
        connectedChainId: 56,
        executable: true,
        approvalRequired: false,
        submitting: false,
        quote: null,
        tracking: idleTracking(),
      }),
    ).toMatchObject({ disabled: true, reason: BRIDGE_COPY.quoteFailed })
  })

  it('6) the wrong chain asks for a BNB switch', () => {
    const cta = resolveSubmitCta({
      from: 'bnb',
      to: 'solana',
      connectedChainId: 8453,
      executable: true,
      approvalRequired: false,
      submitting: false,
      quote: liveQuote(),
      tracking: idleTracking(),
      nowMs: Date.parse(liveQuote().quotedAt),
    })
    expect(cta.label).toBe(BRIDGE_COPY.switchToBnb)
    expect(cta.reason).toMatch(/BNB Smart Chain/)
  })

  it('7) direct Base and Robinhood Solana routes stay disabled', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority())
    expect(localRouteActivationEnabled('base', 'solana')).toBe(false)
    expect(localRouteActivationEnabled('solana', 'base')).toBe(false)
    expect(localRouteActivationEnabled('robinhood', 'solana')).toBe(false)
    expect(localRouteActivationEnabled('solana', 'robinhood')).toBe(false)
    expect(isRouteExecutable('base', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'base', live)).toBe(false)
    expect(isRouteExecutable('robinhood', 'solana', live)).toBe(false)
    expect(isRouteExecutable('solana', 'robinhood', live)).toBe(false)
    expect(isRouteExecutable('bnb', 'robinhood', live)).toBe(true)
  })

  it('8) operational copy no longer requires the completed unpause', () => {
    const live = applyCanonicalBnbSolanaApplicationGate(staleAuthority())
    const route = live.routes.find((item) => item.from === 'bnb' && item.to === 'solana')
    expect(route?.reason).not.toMatch(/set_pause|unpause/i)
    expect(wave1ActivationBlockers().join(' ')).not.toMatch(/set_pause|infrastructure pause/i)
    expect(operationalCopyMustNotRequireUnpause(BRIDGE_COPY.submitted)).toBe(true)
    expect(operationalCopyMustNotRequireUnpause(BRIDGE_COPY.delivered)).toBe(true)
    expect(operationalCopyMustNotRequireUnpause(solanaUnpauseOperatorMessage())).toBe(false)
    expect(MARCO_WAVE1_NETWORKS.solana.protectivePaused).toBe(false)
  })

  it('9) quote refresh, submitted, tracker, and delivered states lock double send', () => {
    expect(resolveQuoteCta({ hasLiveQuote: false, sourceSubmitted: false }).label).toBe(BRIDGE_COPY.getLiveQuote)
    expect(resolveQuoteCta({ hasLiveQuote: true, sourceSubmitted: false }).label).toBe(BRIDGE_COPY.refreshLiveQuote)
    expect(resolveQuoteCta({ hasLiveQuote: true, sourceSubmitted: true }).disabled).toBe(true)

    const submitted = resolveSubmitCta({
      from: 'bnb',
      to: 'solana',
      connectedChainId: 56,
      executable: true,
      approvalRequired: false,
      submitting: false,
      quote: liveQuote(),
      tracking: { status: 'submitted', sourceTx: '0xabc' },
      nowMs: Date.parse(liveQuote().quotedAt),
    })
    expect(submitted).toMatchObject({ label: BRIDGE_COPY.bridgeInProgress, disabled: true })
    expect(sourceSubmissionLocksControls('submitted')).toBe(true)
    expect(sourceSubmissionLocksControls('verifying')).toBe(true)
    expect(bridgeRecoveryMessage({ status: 'submitted', sourceTx: '0xabc' })).toBe(BRIDGE_COPY.submitted)
    expect(layerZeroScanTxUrl('0xabc')).toBe('https://layerzeroscan.com/tx/0xabc')

    expect(marcoBridgeStepStates({ status: 'verifying' })).toEqual([
      'completed',
      'completed',
      'current',
      'pending',
      'pending',
    ])
    const delivered = trackingFromLayerZeroMessages('0xabc', [
      { guid: 'guid-1', status: { name: 'DELIVERED' }, destination: { tx: { txHash: '0xdef' } } },
    ])
    expect(delivered.status).toBe('delivered')
    expect(delivered.message).toBe(BRIDGE_COPY.delivered)
    expect(marcoBridgeStepStates(delivered)).toEqual(['completed', 'completed', 'completed', 'completed', 'completed'])
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
      }).label,
    ).toBe(BRIDGE_COPY.bridgeComplete)
  })

  it('parses the certified unpaused store bytes and keeps the BNB-hub topology', () => {
    const raw = Buffer.from(
      'c3d76886b9c3f07200e80300000000000050d3851adc069482df20b05faf8841e614a9729223b552c3f265abe4170f4ffe02fa19808ef6991a81ed7786c4baa549d0687c48b0b684834cc3a23a0cffd7325aad76da514b6e1dcf11037e904dac3d375f525c9fbafcb19507b78907d8c18bff00000000000000009ae83ccef8e3f380108a1f8dc09c6a84161a477546b981040034b5a5c5d55128000000011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094',
      'hex',
    )
    const store = parseOftStoreAccount(raw, SOLANA_OFT_PROGRAM_ID)
    expect(store.paused).toBe(false)
    expect(store.mint).toBe(CANONICAL_BNB_SOLANA_GATE.mint)
    expect(CANONICAL_BNB_SOLANA_GATE.store).toBe('7L8x99W1yVVgtsu3wWy9DgD9ysnnfF4XXhdKhUrQxEuW')
    expect(CANONICAL_BNB_SOLANA_GATE.srcEid).toBe(30102)
    expect(CANONICAL_BNB_SOLANA_GATE.dstEid).toBe(30168)
    expect(CANONICAL_BNB_SOLANA_GATE.unpauseTx).toMatch(/^4CDyThR9JDebAqQPHW4bAZ7VkHJcrnn6/)
  })
})
