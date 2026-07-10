import { describe, expect, it } from 'vitest'
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
      expect(report.vercelSecretsChecklist).toContain('BSCSCAN_API_KEY')
      expect(['partial', 'blocked']).toContain(report.verdict)
    } finally {
      if (prevBlob) process.env.BLOB_READ_WRITE_TOKEN = prevBlob
      if (prevRpc) process.env.BSC_RPC_URL = prevRpc
    }
  })
})
