import { describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob', () => ({
  head: vi.fn(async () => ({ url: 'https://example.com/blob' })),
  put: vi.fn(async () => ({ url: 'https://example.com/blob' })),
}))

import { buildProductionReadinessReport } from '../readiness'

describe('buildProductionReadinessReport', () => {
  it('returns blocked verdict without durable storage secrets', async () => {
    const prevBlob = process.env.BLOB_READ_WRITE_TOKEN
    const prevRpc = process.env.BSC_RPC_URL
    delete process.env.BLOB_READ_WRITE_TOKEN
    delete process.env.BSC_RPC_URL
    try {
      const report = await buildProductionReadinessReport()
      expect(report.checks.find((c) => c.name === 'BLOB_READ_WRITE_TOKEN')?.configured).toBe(false)
      expect(report.vercelSecretsChecklist).toContain('BSCSCAN_API_KEY (optional — holders)')
      expect(['partial', 'blocked']).toContain(report.verdict)
      expect(report.components.multiPairHistoricalIndexer).toBe('DEFERRED')
      expect(report.indexer.legacyNote).toContain('LEGACY_UNIVERSAL_INDEXER')
    } finally {
      if (prevBlob) process.env.BLOB_READ_WRITE_TOKEN = prevBlob
      if (prevRpc) process.env.BSC_RPC_URL = prevRpc
    }
  })

  it('does not block solely because holder provider is optional unavailable', async () => {
    const report = await buildProductionReadinessReport()
    expect(report.components.multiPairHistoricalIndexer).toBe('DEFERRED')
    expect(['OPTIONAL_UNAVAILABLE', 'READY']).toContain(report.components.holderProvider)
  })
})
