import { describe, expect, it } from 'vitest'
import {
  BRIDGE_COMPLETE_COPY,
  BRIDGE_COMPLETE_HEADLINE,
  BRIDGE_IN_PROGRESS_COPY,
  BRIDGE_IN_PROGRESS_HEADLINE,
  FETCHING_LIVE_QUOTE_CTA,
  LIVE_QUOTE_CTA,
  MARCO_BRIDGE_PROGRESS,
  REFRESH_LIVE_QUOTE_CTA,
  bridgeProgressRank,
  bridgeRecoveryMessage,
  bridgeUxHeadline,
  deliveryStepPhases,
  isTrackedBridgeTransfer,
  mergeBridgeTracking,
  monotonicBridgeProgress,
  resolveLiveQuoteCtaLabel,
  showConfirmBridgeControls,
} from '../lifecycle'
import { trackingFromLayerZeroMessages } from '../tracking'
import type { MarcoBridgeProgress, MarcoBridgeTracking } from '../types'

const phases = (status: MarcoBridgeProgress) => deliveryStepPhases(status).map((step) => step.phase)

describe('MARCO bridge quote CTA state', () => {
  it('keeps GET LIVE QUOTE before a valid live quote exists', () => {
    expect(resolveLiveQuoteCtaLabel(false, false)).toBe(LIVE_QUOTE_CTA)
    expect(resolveLiveQuoteCtaLabel(false, false)).toBe('GET LIVE QUOTE')
  })

  it('uses REFRESH LIVE QUOTE once a valid live quote is the current reviewed quote', () => {
    expect(resolveLiveQuoteCtaLabel(true, false)).toBe(REFRESH_LIVE_QUOTE_CTA)
    expect(resolveLiveQuoteCtaLabel(true, false)).toBe('REFRESH LIVE QUOTE')
  })

  it('keeps FETCHING LIVE QUOTE while the existing quote action is in flight', () => {
    expect(resolveLiveQuoteCtaLabel(false, true)).toBe(FETCHING_LIVE_QUOTE_CTA)
    expect(resolveLiveQuoteCtaLabel(true, true)).toBe(FETCHING_LIVE_QUOTE_CTA)
  })
})

describe('MARCO bridge submit lock', () => {
  it('hides CONFIRM BRIDGE after a source tx hash is known', () => {
    const submitted: MarcoBridgeTracking = {
      status: 'submitted',
      sourceTx: '0xabc',
    }
    expect(isTrackedBridgeTransfer(submitted)).toBe(true)
    expect(showConfirmBridgeControls(true, submitted)).toBe(false)
    expect(bridgeUxHeadline(submitted)).toBe(BRIDGE_IN_PROGRESS_HEADLINE)
    expect(bridgeRecoveryMessage(submitted)).toBe(BRIDGE_IN_PROGRESS_COPY)
  })

  it('keeps CONFIRM BRIDGE available only while reviewing an unsubmitted quote', () => {
    expect(showConfirmBridgeControls(true, { status: 'review' })).toBe(true)
    expect(showConfirmBridgeControls(false, { status: 'review' })).toBe(false)
    expect(showConfirmBridgeControls(true, { status: 'idle' })).toBe(true)
    expect(isTrackedBridgeTransfer({ status: 'review' })).toBe(false)
  })

  it('keeps CONFIRM BRIDGE locked after delivery so the same transfer cannot be resent', () => {
    const delivered: MarcoBridgeTracking = { status: 'delivered', sourceTx: '0xabc', destinationTx: '0xdef' }
    expect(isTrackedBridgeTransfer(delivered)).toBe(true)
    expect(showConfirmBridgeControls(true, delivered)).toBe(false)
    expect(bridgeUxHeadline(delivered)).toBe(BRIDGE_COMPLETE_HEADLINE)
    expect(bridgeRecoveryMessage(delivered)).toBe(BRIDGE_COMPLETE_COPY)
  })
})

describe('MARCO bridge delivery step mapping', () => {
  it('keeps the certified five-step order', () => {
    expect(MARCO_BRIDGE_PROGRESS.map((step) => step.status)).toEqual([
      'submitted',
      'source-confirmed',
      'verifying',
      'destination-executing',
      'delivered',
    ])
  })

  it('leaves idle and unknown review states visually pending', () => {
    expect(phases('idle')).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
    expect(phases('review')).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
    expect(phases('action-required')).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
    expect(phases('source-failed')).toEqual(['pending', 'pending', 'pending', 'pending', 'pending'])
  })

  it('highlights completed and current steps from factual tracker stages', () => {
    expect(phases('submitted')).toEqual(['complete', 'current', 'pending', 'pending', 'pending'])
    expect(phases('source-confirmed')).toEqual(['complete', 'complete', 'current', 'pending', 'pending'])
    expect(phases('verifying')).toEqual(['complete', 'complete', 'current', 'pending', 'pending'])
    expect(phases('destination-executing')).toEqual(['complete', 'complete', 'complete', 'current', 'pending'])
  })

  it('marks every step complete only when destination delivery is proven', () => {
    const delivered = deliveryStepPhases('delivered')
    expect(delivered.every((step) => step.phase === 'complete')).toBe(true)
    expect(delivered).toHaveLength(5)
    expect(bridgeUxHeadline({ status: 'delivered', destinationTx: '0xdef' })).toBe('BRIDGE COMPLETE')
    expect(bridgeRecoveryMessage({ status: 'delivered', destinationTx: '0xdef' })).toBe(
      'MARCO was delivered successfully to the destination wallet.',
    )
  })
})

describe('MARCO bridge monotonic tracking', () => {
  it('never visually regresses a completed stage from stale poll data', () => {
    expect(monotonicBridgeProgress('verifying', 'source-confirmed')).toBe('verifying')
    expect(monotonicBridgeProgress('destination-executing', 'submitted')).toBe('destination-executing')
    expect(monotonicBridgeProgress('delivered', 'verifying')).toBe('delivered')
    expect(monotonicBridgeProgress('verifying', 'idle')).toBe('verifying')
    expect(monotonicBridgeProgress('source-confirmed', 'review')).toBe('source-confirmed')

    const merged = mergeBridgeTracking(
      { status: 'verifying', sourceTx: '0xabc', guid: 'guid-1' },
      { status: 'source-confirmed', sourceTx: '0xabc' },
    )
    expect(merged.status).toBe('verifying')
    expect(merged.guid).toBe('guid-1')
    expect(bridgeProgressRank(merged.status)).toBeGreaterThan(bridgeProgressRank('source-confirmed'))
  })

  it('still applies factual failure and factual delivery', () => {
    expect(monotonicBridgeProgress('verifying', 'source-failed')).toBe('source-failed')
    expect(monotonicBridgeProgress('source-confirmed', 'delivered')).toBe('delivered')
    expect(monotonicBridgeProgress('idle', 'submitted')).toBe('submitted')
  })
})

describe('MARCO bridge fail-closed delivery claims', () => {
  it('never reports delivered for pending or unknown LayerZero states', () => {
    expect(trackingFromLayerZeroMessages('0xabc', []).status).toBe('source-confirmed')
    expect(trackingFromLayerZeroMessages('0xabc', []).status).not.toBe('delivered')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'PENDING' } }]).status).toBe('verifying')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'INFLIGHT' } }]).status).toBe('verifying')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'CONFIRMING' } }]).status).toBe(
      'source-confirmed',
    )
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'UNKNOWN' } }]).status).toBe('verifying')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'FAILED' } }]).status).toBe('source-failed')
    expect(trackingFromLayerZeroMessages('0xabc', [{ status: { name: 'PAYLOAD_STORED' } }]).status).toBe(
      'destination-executing',
    )
    expect(
      trackingFromLayerZeroMessages('0xabc', [
        { status: { name: 'DELIVERED' }, destination: { tx: { txHash: '0xdef' } } },
      ]).status,
    ).toBe('delivered')
    expect(bridgeUxHeadline({ status: 'idle' })).toBeNull()
    expect(bridgeUxHeadline({ status: 'verifying', sourceTx: '0xabc' })).not.toBe(BRIDGE_COMPLETE_HEADLINE)
    expect(bridgeRecoveryMessage({ status: 'verifying', sourceTx: '0xabc' })).not.toContain(
      'delivered successfully',
    )
  })
})

describe('MARCO bridge UX patch scope', () => {
  it('does not treat quote or submit helpers as a new execution path', () => {
    expect(resolveLiveQuoteCtaLabel(true, false)).toBe('REFRESH LIVE QUOTE')
    expect(showConfirmBridgeControls(true, { status: 'submitted', sourceTx: '0xabc' })).toBe(false)
    expect(mergeBridgeTracking({ status: 'review' }, { status: 'submitted', sourceTx: '0xabc' }).status).toBe(
      'submitted',
    )
  })
})
