import { describe, expect, it, vi } from 'vitest'
import { settleIndexerLeaseHeartbeat } from '../indexer/indexerLease'

describe('settleIndexerLeaseHeartbeat', () => {
  it('fulfills when the heartbeat write rejects so the interval cannot crash the run', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const heartbeat = vi.fn().mockRejectedValue(new Error('blob write failed'))
    await expect(settleIndexerLeaseHeartbeat('owner-1', heartbeat)).resolves.toBeUndefined()
    expect(heartbeat).toHaveBeenCalledWith('owner-1')
    expect(error).toHaveBeenCalledWith('[indexer-lease] heartbeat failed', 'blob write failed')
    error.mockRestore()
  })
})
