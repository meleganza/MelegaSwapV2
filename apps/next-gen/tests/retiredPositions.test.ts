import assert from 'assert'
import { readFileSync } from 'fs'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  classifyRetiredFarms,
  encodePending,
  encodeUserInfo,
  mergeRetiredReads,
  retiredLookupStillCurrent,
} from '../lib/retiredPositions'
import { readRetiredPositions } from '../lib/retiredPositionsRpc'
import RetiredPositionLookup, { RetiredPositionResult } from '../modules/earn/RetiredPositionLookup'
import type { RetiredPositionRead } from '../lib/retiredPositions'

const ACCOUNT = '0x0000000000000000000000000000000000000001'

function json(result: string) {
  return { ok: true, json: async () => ({ result }) }
}

test('a non-retired chain or a bad address does not call a farm', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return json('0x')
  }
  const wrong = await readRetiredPositions({ chainId: 56, address: ACCOUNT }, { fetchImpl })
  const bad = await readRetiredPositions({ chainId: 137, address: 'zz' }, { fetchImpl })
  assert.equal(wrong.code, 'CHAIN_MISMATCH')
  assert.equal(wrong.state, 'unknown')
  assert.equal(bad.code, 'ADDRESS_REJECTED')
  assert.equal(calls, 0)
  assert.equal(wrong.deposit, false)
  assert.equal(wrong.withdraw, false)
})

test('a failed pid is unknown, a covered zero is zero, and a stake or pending reward is nonzero', () => {
  const unknown = classifyRetiredFarms({
    poolLength: 2,
    rows: [
      { pid: 0, staked: BigInt(0), pending: BigInt(0) },
      { pid: 1, staked: null, pending: null },
    ],
  })
  assert.equal(unknown.state, 'unknown')
  assert.equal(unknown.rows.length, 0)

  const zero = classifyRetiredFarms({
    poolLength: 1,
    rows: [{ pid: 0, staked: BigInt(0), pending: BigInt(0) }],
  })
  assert.equal(zero.state, 'zero')

  const staked = classifyRetiredFarms({
    poolLength: 1,
    rows: [{ pid: 3, staked: BigInt(5), pending: BigInt(0) }],
  })
  assert.equal(staked.state, 'nonzero')
  assert.equal(staked.rows[0].stakedRaw, '5')

  const pending = classifyRetiredFarms({
    poolLength: 1,
    rows: [{ pid: 1, staked: BigInt(0), pending: BigInt(9) }],
  })
  assert.equal(pending.state, 'nonzero')
  assert.equal(pending.rows[0].pendingRaw, '9')
})

test('an ethereum chef read uses userInfo and does not invent a second charge', async () => {
  const methods: string[] = []
  const fetchImpl = async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { method: string; params?: [{ data?: string }?] }
    methods.push(body.method)
    if (body.method === 'eth_chainId') return json('0x1')
    const data = body.params?.[0]?.data ?? ''
    if (data.startsWith('0x081e3eda')) return json(`0x${(2n).toString(16).padStart(64, '0')}`)
    if (data.startsWith('0x93f1a40b')) return json(`0x${(4n).toString(16).padStart(64, '0')}${'0'.repeat(64)}`)
    if (data.startsWith('0x9700edcc')) return json(`0x${'0'.repeat(64)}`)
    return json('0x')
  }
  const read = await readRetiredPositions({ chainId: 1, address: ACCOUNT }, { fetchImpl })
  assert.equal(read.ok, true)
  assert.equal(read.state, 'nonzero')
  assert.equal(read.poolLength, 2)
  assert.equal(read.rows.length, 2)
  assert.equal(read.complete, true)
  assert.equal(read.nextCursor, null)
  assert.equal(read.deposit, false)
  assert.equal(read.executable, false)
  assert.equal(methods.includes('eth_sendRawTransaction'), false)
  assert.equal(encodeUserInfo(0, ACCOUNT).startsWith('0x93f1a40b'), true)
  assert.equal(encodePending(0, ACCOUNT).startsWith('0x9700edcc'), true)
})

test('the lookup offers no deposit and labels each state', () => {
  const html = renderToStaticMarkup(React.createElement(RetiredPositionLookup))
  assert.match(html, /Read staked farms/)
  assert.match(html, /Polygon/)
  assert.match(html, /Base/)
  assert.match(html, /Ethereum/)
  assert.equal(html.includes('>Deposit<'), false)
  const nonzero: RetiredPositionRead = {
    ok: true,
    chainId: 137,
    state: 'nonzero',
    complete: true,
    cursor: 0,
    nextCursor: null,
    poolLength: 2,
    readPids: 2,
    failedPids: 0,
    rows: [{ pid: 4, stakedRaw: '10', pendingRaw: '0' }],
    deposit: false,
    withdraw: false,
    executable: false,
    rpcCalls: 3,
  }
  const view = renderToStaticMarkup(React.createElement(RetiredPositionResult, { result: nonzero }))
  assert.match(view, /data-state="nonzero"/)
  assert.match(view, /data-complete="true"/)
  assert.match(view, /Pid 4: staked 10/)
  assert.equal(view.includes('withdrawn'), false)
  const partial: RetiredPositionRead = { ...nonzero, ok: false, code: 'PARTIAL', complete: false, state: 'nonzero', failedPids: 2, readPids: 1 }
  const partialView = renderToStaticMarkup(React.createElement(RetiredPositionResult, { result: partial }))
  assert.match(partialView, /data-complete="false"/)
  assert.match(partialView, /Incomplete farm read/)
  assert.equal(partialView.includes('Every farm on this chain returned'), false)
})

function word(value: bigint): string {
  return `0x${value.toString(16).padStart(64, '0')}`
}

function chefFetch(poolLength: bigint, stake = 0n) {
  return async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { method: string; params?: [{ data?: string }?] }
    if (body.method === 'eth_chainId') return json('0x89')
    const data = body.params?.[0]?.data ?? ''
    if (data.startsWith('0x081e3eda')) return json(word(poolLength))
    if (data.startsWith('0x93f1a40b')) return json(`${word(stake)}${'0'.repeat(64)}`)
    if (data.startsWith('0x9700edcc')) return json(word(0n))
    return json('0x')
  }
}

test('a page of zeros is not a complete zero while later farms remain', async () => {
  const page = await readRetiredPositions({ chainId: 137, address: ACCOUNT, cursor: 0 }, { fetchImpl: chefFetch(42n) })
  assert.equal(page.complete, false)
  assert.equal(page.code, 'PARTIAL')
  assert.equal(page.state, 'unknown')
  assert.equal(page.nextCursor, 4)
  assert.equal(page.readPids, 4)
  assert.notEqual(page.state, 'zero')
})

test('the old 8s budget cannot finish 42 farms and must not report zero', async () => {
  let now = 0
  const fetchImpl = async (_url: string, init: { body: string }) => {
    now += 2_000
    return chefFetch(42n)(_url, init)
  }
  const read = await readRetiredPositions(
    { chainId: 137, address: ACCOUNT },
    { fetchImpl, now: () => now, deadlineMs: 8_000, callTimeoutMs: 2_000, pageSize: 42 },
  )
  assert.equal(read.complete, false)
  assert.equal(read.code, 'PARTIAL')
  assert.notEqual(read.state, 'zero')
  assert.ok(read.failedPids > 0)
  assert.ok(read.readPids < 42)
})

test('joined pages are zero only when every farm was read', async () => {
  const fetchImpl = chefFetch(8n)
  const first = await readRetiredPositions({ chainId: 137, address: ACCOUNT, cursor: 0 }, { fetchImpl, pageSize: 4 })
  const second = await readRetiredPositions({ chainId: 137, address: ACCOUNT, cursor: 4 }, { fetchImpl, pageSize: 4 })
  const merged = mergeRetiredReads([first, second])
  assert.equal(merged.complete, true)
  assert.equal(merged.state, 'zero')
  assert.equal(merged.readPids, 8)
  const stopped = mergeRetiredReads([first])
  assert.equal(stopped.complete, false)
  assert.equal(stopped.state, 'unknown')
  assert.notEqual(stopped.state, 'zero')
})

test('a refused call is retried once and a bad cursor never reaches RPC', async () => {
  let userHits = 0
  let calls = 0
  const fetchImpl = async (_url: string, init: { body: string }) => {
    calls += 1
    const body = JSON.parse(init.body) as { method: string; params?: [{ data?: string }?] }
    if (body.method === 'eth_chainId') return json('0x1')
    const data = body.params?.[0]?.data ?? ''
    if (data.startsWith('0x081e3eda')) return json(word(1n))
    if (data.startsWith('0x93f1a40b')) {
      userHits += 1
      if (userHits === 1) return { ok: false, json: async () => ({}) }
      return json(`${word(0n)}${'0'.repeat(64)}`)
    }
    if (data.startsWith('0x9700edcc')) return json(word(0n))
    return json('0x')
  }
  const read = await readRetiredPositions({ chainId: 1, address: ACCOUNT }, { fetchImpl })
  assert.equal(read.complete, true)
  assert.equal(read.state, 'zero')
  assert.ok(userHits >= 2)
  let rejectedCalls = 0
  const rejected = await readRetiredPositions(
    { chainId: 137, address: ACCOUNT, cursor: -1 },
    { fetchImpl: async () => { rejectedCalls += 1; return json('0x') } },
  )
  assert.equal(rejected.code, 'CURSOR_REJECTED')
  assert.equal(rejected.complete, false)
  assert.equal(rejectedCalls, 0)
  assert.ok(calls > 0)
})

test('an address or chain change drops the previous lookup', () => {
  const issued = { id: 4, chainId: 137, address: ACCOUNT }
  assert.equal(retiredLookupStillCurrent(issued, issued), true)
  assert.equal(retiredLookupStillCurrent(issued, { ...issued, id: 5 }), false)
  assert.equal(retiredLookupStillCurrent(issued, { ...issued, chainId: 1 }), false)
  assert.equal(retiredLookupStillCurrent(issued, { ...issued, address: '0x0000000000000000000000000000000000000002' }), false)
  const source = readFileSync(new URL('../modules/earn/RetiredPositionLookup.tsx', import.meta.url), 'utf8')
  assert.match(source, /retiredLookupStillCurrent/)
  assert.match(source, /abort\(\)/)
  assert.match(source, /setResult\(null\)/)
})
