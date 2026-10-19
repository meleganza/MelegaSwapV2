import assert from 'assert'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  classifyRetiredFarms,
  encodePending,
  encodeUserInfo,
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
  assert.match(view, /Pid 4: staked 10/)
  assert.equal(view.includes('withdrawn'), false)
})
