import { describe, expect, it } from 'vitest'
import handler from '../founder'
import type { NextApiRequest, NextApiResponse } from 'next'

function mockRes() {
  const res: Partial<NextApiResponse> & {
    statusCode?: number
    body?: any
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

describe('/api/deployment/founder', () => {
  it('exposes Founder browser session without server env authority', () => {
    const req = { method: 'GET' } as NextApiRequest
    const res = mockRes()
    handler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.body.authorityModel).toBe('FOUNDER_WALLET_SIGNED')
    expect(res.body.kmsRequired).toBe(false)
    expect(res.body.mainnetDeployerEnvRequired).toBe(false)
    expect(res.body.bscscanRequiredToDeploy).toBe(false)
    expect(res.body.serverEnvDoesNotAuthorizeBrowserDeploy).toBe(true)
    expect(res.body.expectedDeployer).toBe('0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0')
    expect(res.body.operationalState).toBe('CONNECT_WALLET')
  })
})
