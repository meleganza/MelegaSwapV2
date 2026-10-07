import http from 'http'
import { AddressInfo } from 'net'
import { ethers } from 'ethers'
import { afterEach, describe, expect, it } from 'vitest'
import { fetchErc20OnChainIdentity } from '../fetchErc20OnChainIdentity'

const TRUMPET = '0x5844cbFaD5702fF56A489C99dD791D748dE39E5D'
const IFACE = new ethers.utils.Interface([
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function totalSupply() view returns (uint256)',
])

function listen(server: http.Server): Promise<number> {
  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => resolve((server.address() as AddressInfo).port))
  })
}

function close(server: http.Server, sockets: Set<import('net').Socket>): Promise<void> {
  sockets.forEach((socket) => socket.destroy())
  return new Promise((resolve) => server.close(() => resolve()))
}

describe('ERC-20 identity RPC budget', () => {
  const servers: Array<{ server: http.Server; sockets: Set<import('net').Socket> }> = []

  afterEach(async () => {
    await Promise.all(servers.splice(0).map(({ server, sockets }) => close(server, sockets)))
  })

  async function start(handler: http.RequestListener) {
    const sockets = new Set<import('net').Socket>()
    const server = http.createServer(handler)
    server.on('connection', (socket) => {
      sockets.add(socket)
      socket.on('close', () => sockets.delete(socket))
    })
    const port = await listen(server)
    servers.push({ server, sockets })
    return `http://127.0.0.1:${port}`
  }

  it('retries a stalled endpoint and reads TRUMPET from the next one', async () => {
    const calls = { hang: 0, ok: 0 }
    const hang = await start((_req, _res) => {
      calls.hang += 1
    })
    const ok = await start((req, res) => {
      calls.ok += 1
      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString() || '{}') as { id?: number; method?: string; params?: unknown[] }
        let result = '0x'
        if (body.method === 'eth_chainId') result = '0x38'
        if (body.method === 'eth_getCode') result = '0x60016000'
        if (body.method === 'eth_call') {
          const data = String((body.params?.[0] as { data?: string } | undefined)?.data ?? '')
          if (data.startsWith(IFACE.getSighash('name'))) result = IFACE.encodeFunctionResult('name', ['TRUMPET'])
          if (data.startsWith(IFACE.getSighash('symbol'))) result = IFACE.encodeFunctionResult('symbol', ['TRUMPET'])
          if (data.startsWith(IFACE.getSighash('decimals'))) result = IFACE.encodeFunctionResult('decimals', [18])
          if (data.startsWith(IFACE.getSighash('totalSupply'))) {
            result = IFACE.encodeFunctionResult('totalSupply', [ethers.utils.parseUnits('1000000000', 18)])
          }
        }
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id ?? 1, result }))
      })
    })

    const started = Date.now()
    const identity = await fetchErc20OnChainIdentity(56, TRUMPET, {
      urls: [hang, ok],
      attemptMs: 250,
      budgetMs: 2_000,
    })
    expect(Date.now() - started).toBeLessThan(1_800)
    expect(calls.hang).toBeGreaterThan(0)
    expect(calls.ok).toBeGreaterThan(0)
    expect(identity.verifiedDeployment).toBe(true)
    expect(identity.name).toBe('TRUMPET')
    expect(identity.symbol).toBe('TRUMPET')
    expect(identity.decimals).toBe(18)
  })

  it('finishes with an actionable timeout when every endpoint stalls', async () => {
    const hang = await start(() => undefined)
    const started = Date.now()
    const identity = await fetchErc20OnChainIdentity(56, TRUMPET, {
      urls: [hang, hang],
      attemptMs: 200,
      budgetMs: 450,
    })
    expect(Date.now() - started).toBeLessThan(1_200)
    expect(identity.verifiedDeployment).toBe(false)
    expect(identity.name).toBeNull()
    expect(identity.reasonUnavailable).toMatch(/timed out/i)
  })

  it('tries the next endpoint after a failed response', async () => {
    const fail = await start((_req, res) => {
      res.writeHead(500)
      res.end('no')
    })
    const ok = await start((req, res) => {
      const chunks: Buffer[] = []
      req.on('data', (chunk) => chunks.push(chunk))
      req.on('end', () => {
        const body = JSON.parse(Buffer.concat(chunks).toString() || '{}') as { id?: number; method?: string; params?: unknown[] }
        let result = '0x'
        if (body.method === 'eth_getCode') result = '0x60016000'
        if (body.method === 'eth_call') {
          const data = String((body.params?.[0] as { data?: string } | undefined)?.data ?? '')
          if (data.startsWith(IFACE.getSighash('name'))) result = IFACE.encodeFunctionResult('name', ['TRUMPET'])
          if (data.startsWith(IFACE.getSighash('symbol'))) result = IFACE.encodeFunctionResult('symbol', ['TRUMPET'])
          if (data.startsWith(IFACE.getSighash('decimals'))) result = IFACE.encodeFunctionResult('decimals', [18])
          if (data.startsWith(IFACE.getSighash('totalSupply'))) {
            result = IFACE.encodeFunctionResult('totalSupply', [ethers.utils.parseUnits('1', 18)])
          }
        }
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ jsonrpc: '2.0', id: body.id ?? 1, result }))
      })
    })
    const identity = await fetchErc20OnChainIdentity(56, TRUMPET, {
      urls: [fail, ok],
      attemptMs: 800,
      budgetMs: 2_000,
    })
    expect(identity.name).toBe('TRUMPET')
    expect(identity.symbol).toBe('TRUMPET')
    expect(identity.verifiedDeployment).toBe(true)
  })
})
