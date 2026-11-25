import assert from 'assert'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { decodePoolInfo, encodePoolInfo } from '../lib/earnRead'
import { readEarn } from '../lib/earnRpc'
import { EarnResult } from '../modules/earn/EarnRead'

const MATCH =
  '0x000000000000000000000000963556de0eb8138e97a85f0a86ee0acd159d210b00000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002'
const OTHER =
  '0x000000000000000000000000000000000000000000000000000000000000000100000000000000000000000000000000000000000000000000000000000003e800000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000002'

test('poolInfo(0) encoding matches the farm pid selector', () => {
  assert.equal(encodePoolInfo(0), `0x1526fe27${'0'.repeat(64)}`)
  assert.deepEqual(decodePoolInfo(MATCH), {
    lpToken: '0x963556de0eb8138e97a85f0a86ee0acd159d210b',
    allocPoint: '1000',
  })
})

test('a non-BNB request does not call RPC', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return { ok: true, json: async () => ({ result: '0x38' }) }
  }
  const read = await readEarn({ chainId: 1 }, { fetchImpl })
  assert.equal(read.ok, false)
  assert.equal(read.code, 'CHAIN_MISMATCH')
  assert.equal(read.aprPercent, null)
  assert.equal(read.tvlUsd, null)
  assert.equal(calls, 0)
})

test('a matching pid 0 row has no APY, and a timeout invents nothing', async () => {
  const methods: string[] = []
  const matched = await readEarn(
    { chainId: 56 },
    {
      rpcUrl: 'https://bsc-dataseed.bnbchain.org',
      fetchImpl: async (_url: string, init: { body: string }) => {
        const body = JSON.parse(init.body) as { method: string }
        methods.push(body.method)
        if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
        return { ok: true, json: async () => ({ result: MATCH }) }
      },
    },
  )
  assert.equal(matched.ok, true)
  assert.equal(matched.chainId, 56)
  assert.equal(matched.label, 'MARCO')
  assert.equal(matched.allocPoint, '1000')
  assert.equal(matched.aprPercent, null)
  assert.equal(matched.tvlUsd, null)
  assert.equal(matched.deposit, false)
  assert.equal(matched.withdraw, false)
  assert.deepEqual(methods, ['eth_chainId', 'eth_call'])
  const html = renderToStaticMarkup(React.createElement(EarnResult, { result: matched }))
  assert.match(html, /APY and TVL are not returned/)
  assert.match(html, /0x41D5487836452d23f2c467070244E5842B412794/)
  assert.match(html, /https:\/\/www\.melega\.finance\/farms\?view=my/)
  assert.match(html, /https:\/\/www\.melega\.finance\/pools\?view=positions/)
  assert.match(html, /https:\/\/www\.melega\.finance\/liquidity-studio\?view=remove/)
  assert.equal(/\d+\.\d+%/.test(html), false)
  assert.equal(html.includes('>Deposit<'), false)
  assert.equal(html.includes('>Withdraw<'), false)

  const timed = await readEarn(
    { chainId: 56 },
    {
      rpcUrl: 'https://bsc-dataseed.bnbchain.org',
      fetchImpl: async () => {
        const error = new Error('aborted')
        error.name = 'TimeoutError'
        throw error
      },
    },
  )
  assert.equal(timed.ok, false)
  assert.equal(timed.code, 'QUOTE_TIMEOUT')
  assert.equal(timed.aprPercent, null)
  const timeoutHtml = renderToStaticMarkup(React.createElement(EarnResult, { result: timed }))
  assert.match(timeoutHtml, /APY and TVL are unavailable/)
  assert.equal(/\d+\.\d+%/.test(timeoutHtml), false)
})

test('a pool whose token does not match MARCO stays unavailable', async () => {
  const read = await readEarn(
    { chainId: 56 },
    {
      rpcUrl: 'https://bsc-dataseed.bnbchain.org',
      fetchImpl: async (_url: string, init: { body: string }) => {
        const body = JSON.parse(init.body) as { method: string }
        if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
        return { ok: true, json: async () => ({ result: OTHER }) }
      },
    },
  )
  assert.equal(read.ok, false)
  assert.equal(read.label, null)
  assert.equal(read.aprPercent, null)
  assert.equal(read.tvlUsd, null)
})
