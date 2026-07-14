import { describe, expect, it } from 'vitest'
import {
  buildTierPairStatusInput,
  detectTierPairInconsistency,
  detectTierPairRpcFailure,
  resolveTierPairStatus,
} from '../tierPairStatus'
import type { IndexerCheckpoint, IndexerHealthSnapshot } from '../../types'

const baseCheckpoint: IndexerCheckpoint = {
  chainId: 56,
  lastIndexedBlock: 100,
  chainHeadAtSync: 200,
  reorgSafetyBlocks: 12,
  lastSuccessfulSync: '2026-07-14T00:00:00.000Z',
  chunkSize: 25,
  cursorPairIndex: 0,
  forwardCursor: 150,
  gapFillCursor: 150,
  coverageRanges: [{ fromBlock: 50, toBlock: 150 }],
}

const baseHealth: IndexerHealthSnapshot = {
  status: 'ready',
  storageBackend: 'vercel-blob',
  storageConfigured: true,
  lastIndexedBlock: 150,
  chainHead: 200,
  indexingLag: 50,
  lastSuccessfulSync: '2026-07-14T00:00:00.000Z',
  eventCounts: {},
}

describe('resolveTierPairStatus', () => {
  it('returns NOT_STARTED when never touched', () => {
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: false,
        windowComplete: false,
        rpcFailure: false,
      }),
    ).toBe('NOT_STARTED')
  })

  it('returns SYNCING when touched but bootstrap window incomplete', () => {
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: true,
        windowComplete: false,
        health: baseHealth,
        checkpoint: baseCheckpoint,
        rpcFailure: false,
      }),
    ).toBe('SYNCING')
  })

  it('returns EMPTY_VERIFIED when window complete with zero signal', () => {
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: true,
        windowComplete: true,
        health: baseHealth,
        checkpoint: baseCheckpoint,
        rpcFailure: false,
      }),
    ).toBe('EMPTY_VERIFIED')
  })

  it('returns READY when trade or volume signal exists', () => {
    expect(
      resolveTierPairStatus({
        hasSignal: true,
        touched: true,
        windowComplete: false,
        rpcFailure: false,
      }),
    ).toBe('READY')
  })

  it('returns RPC_UNAVAILABLE on rpc failure', () => {
    const health: IndexerHealthSnapshot = {
      ...baseHealth,
      status: 'error',
      lastFailureReason: 'rpc timeout',
    }
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: true,
        windowComplete: true,
        health,
        rpcFailure: true,
      }),
    ).toBe('RPC_UNAVAILABLE')
  })

  it('returns INCONSISTENT on non-rpc error after touch', () => {
    const health: IndexerHealthSnapshot = {
      ...baseHealth,
      status: 'error',
      lastFailureReason: 'checkpoint mismatch',
    }
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: true,
        windowComplete: true,
        health,
        rpcFailure: false,
      }),
    ).toBe('INCONSISTENT')
  })

  it('returns SYNCING when health is syncing even if window complete', () => {
    expect(
      resolveTierPairStatus({
        hasSignal: false,
        touched: true,
        windowComplete: true,
        health: { ...baseHealth, status: 'syncing' },
        checkpoint: baseCheckpoint,
        rpcFailure: false,
      }),
    ).toBe('SYNCING')
  })
})

describe('tier pair status helpers', () => {
  it('detects rpc failures from health snapshot', () => {
    expect(
      detectTierPairRpcFailure({
        ...baseHealth,
        status: 'error',
        lastFailureReason: 'RPC provider unavailable',
      }),
    ).toBe(true)
  })

  it('detects inconsistency after touch without rpc failure', () => {
    expect(
      detectTierPairInconsistency({
        hasSignal: false,
        touched: true,
        windowComplete: true,
        health: { ...baseHealth, status: 'error', lastFailureReason: 'blob write failed' },
        rpcFailure: false,
      }),
    ).toBe(true)
  })

  it('builds input from checkpoint and health', () => {
    const input = buildTierPairStatusInput({
      hasSignal: false,
      checkpoint: baseCheckpoint,
      health: baseHealth,
      windowComplete: false,
    })
    expect(input.touched).toBe(true)
    expect(resolveTierPairStatus(input)).toBe('SYNCING')
  })
})
