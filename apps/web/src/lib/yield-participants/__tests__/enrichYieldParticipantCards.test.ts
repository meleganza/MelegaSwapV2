import { describe, expect, it } from 'vitest'
import type { FarmPreviewCard } from 'views/FarmsStudio/farmsStudioData'
import type { PoolPreviewCard } from 'views/PoolsStudio/poolsStudioData'
import { enrichFarmParticipantCounts, enrichPoolParticipantCounts } from '../enrichYieldParticipantCards'
import type { YieldParticipantSnapshot } from '../types'

const CHEF = '0x1111111111111111111111111111111111111111'
const SMART_CHEF = '0x2222222222222222222222222222222222222222'

function snapshot(status: YieldParticipantSnapshot['status'] = 'ready'): YieldParticipantSnapshot {
  return {
    schema: 'melega.yield-participants.v1',
    status,
    updatedAt: '2026-08-12T00:00:00.000Z',
    source: 'masterchef-smartchef-event-index',
    farms: {},
    pools: {},
  }
}

describe('yield participant enrichment', () => {
  it('maps a certified per-PID farm count, including a real zero', () => {
    const source = snapshot()
    source.farms[`56:${CHEF}:7`] = {
      participants: 0,
      lastIndexedBlock: 10,
      chainHead: 10,
      updatedAt: source.updatedAt!,
    }
    const card = { id: 'farm-7', pid: 7 } as FarmPreviewCard
    const [result] = enrichFarmParticipantCounts([card], source, 56, CHEF)
    expect(result.participants).toBe('0')
    expect(result.participantsSource).toBe('masterchef_event_index')
  })

  it('maps a certified SmartChef count by chain and contract', () => {
    const source = snapshot()
    source.pools[`56:${SMART_CHEF}`] = {
      participants: 1245,
      lastIndexedBlock: 10,
      chainHead: 10,
      updatedAt: source.updatedAt!,
    }
    const card = { id: 'pool-1', chainId: 56, contractAddress: SMART_CHEF } as PoolPreviewCard
    const [result] = enrichPoolParticipantCounts([card], source, 56)
    expect(result.participants).toBe('1,245')
    expect(result.participantsSource).toBe('smartchef_event_index')
  })

  it('uses an explicit indexing state while the historical backfill is pending', () => {
    const pending = snapshot('indexing')
    const farm = { id: 'farm-8', pid: 8 } as FarmPreviewCard
    const pool = { id: 'pool-2', chainId: 56, contractAddress: SMART_CHEF } as PoolPreviewCard
    expect(enrichFarmParticipantCounts([farm], pending, 56, CHEF)[0].participants).toBe('Indexing…')
    expect(enrichPoolParticipantCounts([pool], pending, 56)[0].participants).toBe('Indexing…')
  })

  it('keeps a missing entity explicit even after the rest of the snapshot is ready', () => {
    const ready = snapshot('ready')
    const farm = { id: 'farm-9', pid: 9 } as FarmPreviewCard
    const pool = { id: 'pool-3', chainId: 56, contractAddress: SMART_CHEF } as PoolPreviewCard
    expect(enrichFarmParticipantCounts([farm], ready, 56, CHEF)[0].participants).toBe('Indexing…')
    expect(enrichPoolParticipantCounts([pool], ready, 56)[0].participants).toBe('Indexing…')
  })
})
