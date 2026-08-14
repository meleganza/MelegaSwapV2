import { describe, expect, it } from 'vitest'
import { Interface } from '@ethersproject/abi'
import type { NextApiRequest, NextApiResponse } from 'next'
import { parseLbLog } from '../parseEvents'
import { createMemoryLbProgramStore, setLbProgramStoreForTests } from '../store'
import { getProgramDetail, listProgramsForOwner } from '../inventory'
import ownerHandler from '../../../pages/api/liquidity-programs/[wallet]'
import detailHandler from '../../../pages/api/liquidity-program/[address]'
import { afterEach } from 'vitest'

const OWNER = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const PROGRAM = '0xA15aDa28A9b7d4d9f6Ac781407bAf1A2CFB802EB'
const TOKEN = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'
const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
const PAIR = '0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E'
const FACTORY = '0xB9f3e3020141157C215902acC1fDF65e49bE4e82'

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

afterEach(() => {
  setLbProgramStoreForTests(null)
})

async function seedStore() {
  const store = createMemoryLbProgramStore()
  const iface = new Interface([
    'event ProgramCreated(bytes32 indexed programId, address indexed owner, address indexed program, address projectToken, address quoteAsset, address pair, uint64 generation, bytes32 factoryVersion)',
  ])
  const encoded = iface.encodeEventLog(iface.getEvent('ProgramCreated'), [
    '0x' + '11'.repeat(32),
    OWNER,
    PROGRAM,
    TOKEN,
    WBNB,
    PAIR,
    1,
    '0x' + '22'.repeat(32),
  ])
  const ev = parseLbLog({
    address: FACTORY,
    topics: encoded.topics,
    data: encoded.data,
    transactionHash: '0xseed',
    logIndex: 0,
    blockNumber: 42,
    blockTimestamp: 1_700_000_000,
  })!
  expect(ev.owner).toBeTruthy()
  await store.ingestEvents([ev])
  setLbProgramStoreForTests(store)
  return store
}

describe('LB owner inventory API model', () => {
  it('lists programs for owner wallet', async () => {
    const store = await seedStore()
    const result = await listProgramsForOwner(store, OWNER)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.programs).toHaveLength(1)
    expect(result.programs[0].programAddress.toLowerCase()).toBe(PROGRAM.toLowerCase())
    expect(result.programs[0].token.toLowerCase()).toBe(TOKEN.toLowerCase())
    expect(result.programs[0].quoteAsset.toLowerCase()).toBe(WBNB.toLowerCase())
    expect(result.programs[0].pair.toLowerCase()).toBe(PAIR.toLowerCase())
    expect(result.programs[0].status).toBe('Created')
    expect(result.programs[0].timestamps.createdAt).toBe(1_700_000_000)
  })

  it('returns program detail by address', async () => {
    const store = await seedStore()
    const result = await getProgramDetail(store, PROGRAM)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.program.owner.toLowerCase()).toBe(OWNER.toLowerCase())
    expect(result.events.length).toBeGreaterThanOrEqual(1)
  })

  it('rejects invalid wallet', async () => {
    const store = createMemoryLbProgramStore()
    const result = await listProgramsForOwner(store, 'not-an-address')
    expect(result.ok).toBe(false)
  })
})

describe('/api/liquidity-programs/:wallet', () => {
  it('returns 400 for invalid wallet', async () => {
    const req = { method: 'GET', query: { wallet: 'nope' } } as unknown as NextApiRequest
    const res = mockRes()
    await ownerHandler(req, res)
    expect(res.statusCode).toBe(400)
    expect(res.body.ok).toBe(false)
  })

  it('returns inventory shape for valid wallet', async () => {
    await seedStore()
    const req = { method: 'GET', query: { wallet: OWNER } } as unknown as NextApiRequest
    const res = mockRes()
    await ownerHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.schema).toBe('melega.dex.v1.lb-owner-programs')
    expect(res.body.wallet.toLowerCase()).toBe(OWNER.toLowerCase())
    expect(res.body.count).toBe(1)
    expect(res.body.programs[0].programAddress.toLowerCase()).toBe(PROGRAM.toLowerCase())
    expect(res.body.programs[0].strategy).toBeTruthy()
    expect(res.body.programs[0]).toHaveProperty('goal')
    expect(res.body.programs[0]).toHaveProperty('timestamps')
  })
})

describe('/api/liquidity-program/:address', () => {
  it('returns 404 when program missing', async () => {
    setLbProgramStoreForTests(createMemoryLbProgramStore())
    const req = { method: 'GET', query: { address: PROGRAM } } as unknown as NextApiRequest
    const res = mockRes()
    await detailHandler(req, res)
    expect(res.statusCode).toBe(404)
    expect(res.body.reason).toBe('PROGRAM_NOT_FOUND')
  })

  it('returns detail + deepLink when indexed', async () => {
    await seedStore()
    const req = { method: 'GET', query: { address: PROGRAM } } as unknown as NextApiRequest
    const res = mockRes()
    await detailHandler(req, res)
    expect(res.statusCode).toBe(200)
    expect(res.body.schema).toBe('melega.dex.v1.lb-program-detail')
    expect(res.body.deepLink).toContain(`program=${PROGRAM.toLowerCase()}`)
    expect(res.body.program.token.toLowerCase()).toBe(TOKEN.toLowerCase())
  })
})
