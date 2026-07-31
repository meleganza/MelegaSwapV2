import { describe, expect, it } from 'vitest'
import handler from '../status'
import type { NextApiRequest, NextApiResponse } from 'next'

function mockRes() {
  const res: Partial<NextApiResponse> & {
    statusCode?: number
    body?: unknown
    headers: Record<string, string>
  } = {
    headers: {},
    setHeader(key: string, value: string) {
      this.headers[key] = value
      return this as NextApiResponse
    },
    status(code: number) {
      this.statusCode = code
      return this as NextApiResponse
    },
    json(payload: unknown) {
      this.body = payload
      return this as NextApiResponse
    },
  }
  return res as NextApiResponse & { statusCode?: number; body?: any; headers: Record<string, string> }
}

describe('/api/deployment/status', () => {
  it('returns orchestrator status payload', () => {
    const req = { method: 'GET' } as NextApiRequest
    const res = mockRes()
    handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.headers['Cache-Control']).toBe('no-store')
    expect(res.body.schema).toBe('melega.dex.v1.deployment-orchestrator.status')
    expect(res.body.globalState).toBe('BLOCKED')
    expect(res.body.order).toEqual([
      'liquidity_builder',
      'create_token',
      'public_farm_factory',
    ])
    expect(res.body.subsystems).toHaveLength(3)
    expect(res.body.updatedAt).toBeTruthy()
  })

  it('rejects non-GET', () => {
    const req = { method: 'POST' } as NextApiRequest
    const res = mockRes()
    handler(req, res)
    expect(res.statusCode).toBe(405)
  })
})
