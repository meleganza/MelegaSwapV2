import type { NextApiRequest, NextApiResponse } from 'next'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchErc20OnChainIdentity } from 'registry/projects/pending/fetchErc20OnChainIdentity'
import { factoryListsToken, resolveListedTokenFallback } from 'registry/projects/pending/listedTokenIdentityFallback'
import handler from 'pages/api/registry/projects/onboard'

vi.mock('registry/projects/pending/fetchErc20OnChainIdentity', async () => {
  const actual = await vi.importActual<typeof import('registry/projects/pending/fetchErc20OnChainIdentity')>(
    'registry/projects/pending/fetchErc20OnChainIdentity',
  )
  return {
    ...actual,
    fetchErc20OnChainIdentity: vi.fn(),
  }
})

const TRUMPET = '0x5844cbFaD5702fF56A489C99dD791D748dE39E5D'
const UNKNOWN = '0x0000000000000000000000000000000000000001'

function failedChainRead() {
  return {
    name: null,
    symbol: null,
    decimals: null,
    totalSupplyRaw: null,
    totalSupplyFormatted: null,
    verifiedDeployment: false,
    explorerUrl: `https://bscscan.com/token/${TRUMPET}`,
    reasonUnavailable: 'RPC read timed out for chain 56. Retry or verify the contract on the explorer.',
  }
}

async function invoke(body: Record<string, unknown>) {
  const req = { method: 'POST', body } as NextApiRequest
  const res = {
    statusCode: 200,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code
      return this
    },
    json(payload: unknown) {
      this.body = payload
      return this
    },
    setHeader() {
      return this
    },
  }
  await Promise.resolve(handler(req, res as unknown as NextApiResponse))
  return res
}

describe('listed token detection fallback', () => {
  beforeEach(() => {
    vi.mocked(fetchErc20OnChainIdentity).mockReset()
  })

  it('finds TRUMPET in the canonical registry and the Melega factory inventory', () => {
    expect(factoryListsToken(56, TRUMPET)).toBe(true)
    const fallback = resolveListedTokenFallback(56, TRUMPET, {
      listed: true,
      name: 'TRUMPET',
      symbol: 'TRUMPET',
      logo: null,
    })
    expect(fallback).toMatchObject({
      source: 'factory',
      name: 'TRUMPET',
      symbol: 'TRUMPET',
      decimals: 18,
      listed: true,
      factoryListed: true,
    })
  })

  it('does not invent an identity for an unknown contract', () => {
    expect(factoryListsToken(56, UNKNOWN)).toBe(false)
    expect(
      resolveListedTokenFallback(56, UNKNOWN, { listed: false, name: null, symbol: null, logo: null }),
    ).toBeNull()
  })

  it('resolves listed TRUMPET when the chain read fails', async () => {
    vi.mocked(fetchErc20OnChainIdentity).mockResolvedValue(failedChainRead())
    const res = await invoke({ contract: TRUMPET, chainId: 56 })
    const body = res.body as {
      ok: boolean
      identitySource: string
      dex: { listed: boolean; symbol: string; name: string }
      onChain: { name: string; symbol: string; decimals: number; verifiedDeployment: boolean }
    }
    expect(res.statusCode).toBeGreaterThanOrEqual(200)
    expect(res.statusCode).toBeLessThan(300)
    expect(body.ok).toBe(true)
    expect(body.identitySource).toBe('factory')
    expect(body.dex.listed).toBe(true)
    expect(body.dex.symbol).toBe('TRUMPET')
    expect(body.dex.name).toBe('TRUMPET')
    expect(body.onChain.name).toBe('TRUMPET')
    expect(body.onChain.symbol).toBe('TRUMPET')
    expect(body.onChain.decimals).toBe(18)
    expect(body.onChain.verifiedDeployment).toBe(false)
  })

  it('keeps a successful chain read ahead of the registry fallback', async () => {
    vi.mocked(fetchErc20OnChainIdentity).mockResolvedValue({
      ...failedChainRead(),
      name: 'TRUMPET',
      symbol: 'TRUMPET',
      decimals: 18,
      verifiedDeployment: true,
      totalSupplyFormatted: '1000000000.0',
      reasonUnavailable: null,
    })
    const res = await invoke({ contract: TRUMPET, chainId: 56 })
    const body = res.body as { ok: boolean; identitySource: string; onChain: { verifiedDeployment: boolean } }
    expect(body.ok).toBe(true)
    expect(body.identitySource).toBe('onchain')
    expect(body.onChain.verifiedDeployment).toBe(true)
  })

  it('returns an actionable failure when an unknown token cannot be read', async () => {
    vi.mocked(fetchErc20OnChainIdentity).mockResolvedValue({
      ...failedChainRead(),
      explorerUrl: `https://bscscan.com/token/${UNKNOWN}`,
    })
    const res = await invoke({ contract: UNKNOWN, chainId: 56 })
    const body = res.body as { ok: boolean; reason: string }
    expect(res.statusCode).toBe(422)
    expect(body.ok).toBe(false)
    expect(body.reason).toMatch(/timed out|Retry|explorer/i)
  })
})
