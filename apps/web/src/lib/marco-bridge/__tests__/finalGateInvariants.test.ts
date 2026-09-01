import { BigNumber } from '@ethersproject/bignumber'
import { describe, expect, it, vi } from 'vitest'
import {
  BRIDGE_COPY,
  resolveSubmitCta,
  sourceSubmissionLocksControls,
} from '../bridgeActionState'
import { CANONICAL_BNB_SOLANA_GATE } from '../canonicalBnbSolanaGate'
import { bridgeRecoveryMessage, hasBroadcastSourceTx, sourceSucceeded } from '../lifecycle'
import {
  BNB_GAS_PRICE_FALLBACK_WEI,
  BNB_GAS_PRICE_HEADROOM_BPS,
  NATIVE_BNB_CHECKING_REASON,
  NATIVE_BNB_UNAVAILABLE_REASON,
  requiredNativeWeiForBridge,
  resolveNativeFundsBlockReason,
} from '../nativeFunds'
import { simulateMarcoBridgeBuild } from '../simulate'
import { readCanonicalSolanaStorePause } from '../solanaStoreRead'
import { trackingFromLayerZeroMessages } from '../tracking'
import type { MarcoBridgeQuote, MarcoBridgeTracking } from '../types'
import type { MarcoBridgeBuild } from '../transactionBuilder'

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

const submitInput = (overrides: Partial<Parameters<typeof resolveSubmitCta>[0]> = {}) =>
  resolveSubmitCta({
    from: 'bnb',
    to: 'solana',
    connectedChainId: 56,
    executable: true,
    approvalRequired: false,
    submitting: false,
    quote: liveQuote(),
    tracking: { status: 'review' },
    nowMs: Date.parse(liveQuote().quotedAt),
    ...overrides,
  })

describe('double-send lock uses sourceTx evidence', () => {
  it('locks action-required when a source tx hash exists', () => {
    const tracking: MarcoBridgeTracking = { status: 'action-required', sourceTx: '0xabc' }
    expect(hasBroadcastSourceTx(tracking)).toBe(true)
    expect(sourceSubmissionLocksControls(tracking)).toBe(true)
    expect(submitInput({ tracking })).toMatchObject({
      label: BRIDGE_COPY.bridgeInProgress,
      disabled: true,
    })
  })

  it('does not lock pre-submit action-required without a source tx', () => {
    const tracking: MarcoBridgeTracking = { status: 'action-required' }
    expect(hasBroadcastSourceTx(tracking)).toBe(false)
    expect(sourceSubmissionLocksControls(tracking)).toBe(false)
    expect(submitInput({ tracking })).toMatchObject({
      label: BRIDGE_COPY.bridgeMarco,
      disabled: false,
    })
  })

  it('keeps controls locked for BLOCKED / unknown / empty tracker results once sourceTx exists', () => {
    expect(sourceSubmissionLocksControls(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'BLOCKED' } }]))).toBe(
      true,
    )
    expect(sourceSubmissionLocksControls(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'UNKNOWN' } }]))).toBe(
      true,
    )
    expect(sourceSubmissionLocksControls(trackingFromLayerZeroMessages('0xabc', []))).toBe(true)
  })
})

describe('CTA timing is pre-hash vs post-hash', () => {
  it('shows APPROVING MARCO during the approval wallet prompt, not BRIDGE IN PROGRESS', () => {
    const cta = submitInput({
      approvalRequired: true,
      submitting: true,
      submissionPhase: 'approving',
      tracking: { status: 'review' },
    })
    expect(cta).toMatchObject({ label: BRIDGE_COPY.approvingMarco, disabled: true })
    expect(cta.label).not.toBe(BRIDGE_COPY.bridgeInProgress)
  })

  it('shows CONFIRM BRIDGE IN WALLET during the send prompt before a hash exists', () => {
    const cta = submitInput({
      submitting: true,
      submissionPhase: 'confirming-wallet',
      tracking: { status: 'review' },
    })
    expect(cta).toMatchObject({ label: BRIDGE_COPY.confirmBridgeInWallet, disabled: true })
    expect(cta.label).not.toBe(BRIDGE_COPY.bridgeInProgress)
    expect(cta.label).not.toBe(BRIDGE_COPY.bridgeMarco)
  })

  it('shows BRIDGE IN PROGRESS only after a source tx hash exists', () => {
    const preHash = submitInput({ submitting: true, tracking: { status: 'review' } })
    expect(preHash.label).toBe(BRIDGE_COPY.confirmBridgeInWallet)
    const postHash = submitInput({
      submitting: false,
      tracking: { status: 'submitted', sourceTx: '0xabc' },
    })
    expect(postHash).toMatchObject({ label: BRIDGE_COPY.bridgeInProgress, disabled: true })
  })
})

describe('recovery / no-resend requires sourceTx evidence', () => {
  it('does not treat action-required without sourceTx as source success or no-resend', () => {
    const tracking: MarcoBridgeTracking = { status: 'action-required' }
    expect(sourceSucceeded(tracking)).toBe(false)
    expect(bridgeRecoveryMessage(tracking)).not.toMatch(/Do not resend/)
    expect(bridgeRecoveryMessage(tracking)).not.toBe(BRIDGE_COPY.submitted)
  })

  it('uses no-resend copy for action-required only when sourceTx exists', () => {
    const tracking: MarcoBridgeTracking = { status: 'action-required', sourceTx: '0xabc' }
    expect(sourceSucceeded(tracking)).toBe(true)
    expect(bridgeRecoveryMessage(tracking)).toBe(BRIDGE_COPY.submitted)
  })
})

describe('native BNB sufficiency fails closed', () => {
  it('disables the submit CTA while native balance is loading or unavailable', () => {
    const checking = resolveNativeFundsBlockReason({
      from: 'bnb',
      quoteLive: true,
      nativeFeeWei: liveQuote().nativeFeeWei,
      readState: 'loading',
      balanceWei: null,
      gasPriceWei: null,
      approvalRequired: false,
    })
    expect(checking).toBe(NATIVE_BNB_CHECKING_REASON)
    expect(submitInput({ nativeBlockReason: checking })).toMatchObject({
      disabled: true,
      reason: NATIVE_BNB_CHECKING_REASON,
    })

    const unavailable = resolveNativeFundsBlockReason({
      from: 'bnb',
      quoteLive: true,
      nativeFeeWei: liveQuote().nativeFeeWei,
      readState: 'unavailable',
      balanceWei: null,
      gasPriceWei: null,
      approvalRequired: false,
    })
    expect(unavailable).toBe(NATIVE_BNB_UNAVAILABLE_REASON)
    expect(submitInput({ nativeBlockReason: unavailable })).toMatchObject({
      disabled: true,
      reason: NATIVE_BNB_UNAVAILABLE_REASON,
    })
  })

  it('reuses the gas-price fallback and keeps 20% headroom as 12_000 / 10_000', () => {
    expect(BNB_GAS_PRICE_HEADROOM_BPS).toBe(12_000)
    const withFallback = requiredNativeWeiForBridge({
      nativeFeeWei: liveQuote().nativeFeeWei,
      gasPriceWei: BNB_GAS_PRICE_FALLBACK_WEI,
      approvalRequired: false,
    })
    const expectedGas = BigNumber.from(BNB_GAS_PRICE_FALLBACK_WEI).mul(400_000).mul(12_000).div(10_000)
    expect(withFallback.toString()).toBe(BigNumber.from(liveQuote().nativeFeeWei).add(expectedGas).toString())

    const ready = resolveNativeFundsBlockReason({
      from: 'bnb',
      quoteLive: true,
      nativeFeeWei: liveQuote().nativeFeeWei,
      readState: 'ready',
      balanceWei: withFallback.add(1).toString(),
      gasPriceWei: null,
      approvalRequired: false,
    })
    expect(ready).toBeNull()
  })
})

describe('Solana store pause binding', () => {
  it('reads getAccountInfo at finalized commitment and keeps owner/program/mint checks', async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: {
          value: {
            data: [
              Buffer.from(
                'c3d76886b9c3f07200e80300000000000050d3851adc069482df20b05faf8841e614a9729223b552c3f265abe4170f4ffe02fa19808ef6991a81ed7786c4baa549d0687c48b0b684834cc3a23a0cffd7325aad76da514b6e1dcf11037e904dac3d375f525c9fbafcb19507d8c18bff00000000000000009ae83ccef8e3f380108a1f8dc09c6a84161a477546b981040034b5a5c5d55128000000011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094011c76a1a06e16b6ebdd781b7ca9161a4da765249c68ab9a16d60c317f9189d094',
                'hex',
              ).toString('base64'),
              'base64',
            ],
            owner: CANONICAL_BNB_SOLANA_GATE.programId,
          },
        },
      }),
    })
    await readCanonicalSolanaStorePause({ fetcher: fetcher as unknown as typeof fetch, timeoutMs: 50 })
    const body = JSON.parse(fetcher.mock.calls[0][1].body)
    expect(body.method).toBe('getAccountInfo')
    expect(body.params[0]).toBe(CANONICAL_BNB_SOLANA_GATE.store)
    expect(body.params[1]).toMatchObject({ encoding: 'base64', commitment: 'finalized' })
  })
})

describe('Solana source simulation copy', () => {
  it('uses BNB-hub operational copy instead of unpause instructions', async () => {
    const build = {
      from: 'solana',
      to: 'bnb',
      amount: '0.000001',
      executable: true,
      blockers: [],
      transactions: [{ family: 'solana', purpose: 'oft_send' }],
    } as unknown as MarcoBridgeBuild
    const simulation = await simulateMarcoBridgeBuild(build, {})
    expect(simulation.steps[0].reason).toBe(
      'Solana source submission is not publicly activated. Use BNB Smart Chain as the source.',
    )
    expect(simulation.steps[0].reason).not.toMatch(/set_pause|\bunpause\b|recovery[- ]required/i)
    expect(simulation.ok).toBe(false)
  })
})
