import assert from 'assert'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { STALE_QUOTE_MS } from '../lib/bscQuote'
import { encodeAllowance, SHADOW_ADAPTER, SHADOW_EXECUTOR_ADDRESS } from '../lib/shadowReadiness'
import { readShadowReadiness } from '../lib/shadowReadinessRpc'
import { ShadowResult } from '../modules/trade/ShadowReadiness'

const ADDRESS = '0x1111111111111111111111111111111111111111'
const NOW = Date.parse('2026-10-13T20:00:00.000Z')
const WORD = (value: bigint) => `0x${value.toString(16).padStart(64, '0')}`

function quote(overrides: Record<string, unknown> = {}) {
  return {
    quotedAt: '2026-10-13T19:59:50.000Z',
    staleAfterMs: STALE_QUOTE_MS,
    sell: 'WBNB',
    buy: 'USDT',
    amount: '0.01',
    amountInRaw: '10000000000000000',
    amountOutRaw: '7400000000000000000',
    router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
    venueId: 'pancakeswap',
    path: ['0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', '0x55d398326f99059fF775485246999027B3197955'],
    ...overrides,
  }
}

function rpc(balance: bigint, allowance: bigint) {
  return async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { method: string; params?: [{ data?: string }] }
    if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
    const data = body.params?.[0]?.data ?? ''
    if (data.startsWith('0x70a08231')) return { ok: true, json: async () => ({ result: WORD(balance) }) }
    if (data.startsWith('0xdd62ed3e')) return { ok: true, json: async () => ({ result: WORD(allowance) }) }
    throw new Error(`unexpected ${body.method}`)
  }
}

test('allowance calldata is the ERC-20 selector and two padded addresses', () => {
  assert.equal(
    encodeAllowance(ADDRESS, SHADOW_EXECUTOR_ADDRESS),
    `0xdd62ed3e${ADDRESS.slice(2).toLowerCase().padStart(64, '0')}${SHADOW_EXECUTOR_ADDRESS.slice(2).padStart(64, '0')}`,
  )
  assert.equal(SHADOW_ADAPTER.reused, false)
})

test('a wrong chain or a stale quote never reaches RPC', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return { ok: true, json: async () => ({ result: '0x38' }) }
  }
  const wrong = await readShadowReadiness(
    { chainId: 1, address: ADDRESS, quote: quote() },
    { fetchImpl: fetchImpl as never, now: () => NOW },
  )
  assert.equal(wrong.ok, false)
  if (!wrong.ok) assert.equal(wrong.code, 'CHAIN_MISMATCH')
  assert.equal(wrong.rpcCalls, 0)
  assert.equal(wrong.unsignedTx, null)
  assert.equal(wrong.executable, false)

  const stale = await readShadowReadiness(
    { chainId: 56, address: ADDRESS, quote: quote({ quotedAt: '2026-10-13T19:59:00.000Z' }) },
    { fetchImpl: fetchImpl as never, now: () => NOW },
  )
  assert.equal(stale.ok, false)
  if (!stale.ok) assert.equal(stale.code, 'QUOTE_STALE')
  assert.equal(stale.rpcCalls, 0)
  assert.equal(calls, 0)
})

test('insufficient balance is factual and a failed read invents nothing', async () => {
  const short = await readShadowReadiness(
    { chainId: 56, address: ADDRESS, quote: quote() },
    { fetchImpl: rpc(BigInt(0), BigInt(1)) as never, now: () => NOW, rpcUrl: 'https://bsc-dataseed.bnbchain.org' },
  )
  assert.equal(short.ok, true)
  assert.equal(short.balance.status, 'insufficient')
  assert.equal(short.balance.raw, '0')
  assert.equal(short.allowance.executor.status, 'short')
  assert.equal(short.feeAmount, null)
  assert.equal(short.gasUnits, null)
  assert.equal(short.unsignedTx, null)
  assert.equal(short.executable, false)
  assert.equal(short.blockers.includes('INSUFFICIENT_BALANCE'), true)
  assert.equal(short.blockers.includes('UNSIGNED_TX_BLOCKED'), true)

  const failed = await readShadowReadiness(
    { chainId: 56, address: ADDRESS, quote: quote() },
    {
      rpcUrl: 'https://bsc-dataseed.bnbchain.org',
      now: () => NOW,
      fetchImpl: async () => {
        const error = new Error('aborted')
        error.name = 'TimeoutError'
        throw error
      },
    },
  )
  assert.equal(failed.ok, false)
  if (!failed.ok) assert.equal(failed.code, 'QUOTE_TIMEOUT')
  assert.equal(failed.balance.raw, null)
  assert.equal(failed.allowance.executor.raw, null)
  assert.equal(failed.unsignedTx, null)
})

test('a covered read still exposes no transaction', async () => {
  const covered = await readShadowReadiness(
    { chainId: 56, address: ADDRESS, quote: quote() },
    {
      fetchImpl: rpc(BigInt('10000000000000000'), BigInt('10000000000000000')) as never,
      now: () => NOW,
      rpcUrl: 'https://bsc-dataseed.bnbchain.org',
    },
  )
  assert.equal(covered.ok, true)
  assert.equal(covered.balance.status, 'sufficient')
  assert.equal(covered.allowance.executor.status, 'covers')
  assert.equal(covered.allowance.router.status, 'covers')
  assert.equal(covered.executable, false)
  assert.equal(covered.broadcast, false)
  assert.equal(covered.signed, false)
  assert.equal(covered.feeCollected, false)
  assert.equal(covered.walletConnected, false)
  assert.equal(covered.unsignedTx, null)
})

test('the diagnostic view has no transaction controls', () => {
  const html = renderToStaticMarkup(
    React.createElement(ShadowResult, {
      result: {
        ok: true,
        schema: 'melega.next-gen.shadow-readiness.v1',
        chainId: 56,
        address: ADDRESS,
        executable: false,
        broadcast: false,
        signed: false,
        feeCollected: false,
        feeAmount: null,
        gasUnits: null,
        unsignedTx: null,
        walletConnected: false,
        adapter: SHADOW_ADAPTER,
        rpcCalls: 4,
        durationMs: 1,
        quote: { status: 'fresh', venueLabel: 'PancakeSwap', amountOutRaw: '1' },
        balance: { status: 'insufficient', raw: '0' },
        allowance: {
          executor: { spender: SHADOW_EXECUTOR_ADDRESS, status: 'short', raw: '0' },
          router: { spender: '0x10ED43C718714eb63d5aA57B78B54704E256024E', status: 'short', raw: '0' },
        },
        blockers: ['UNSIGNED_TX_BLOCKED'],
      },
    }),
  )
  assert.match(html, /Not executable/)
  assert.match(html, /No fee amount is shown/)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
  assert.equal(html.includes('>Swap<'), false)
  assert.equal(html.includes('>Pay<'), false)
  assert.equal(html.includes('unsignedTx'), false)
})
