import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import {
  assertReadonlyRpc,
  decodeGetAmountsOut,
  encodeGetAmountsOut,
  formatUnits,
  quoteIsStale,
} from '../lib/bscQuote'
import { previewBnbQuote } from '../lib/bscQuoteRpc'
import BnbQuotePreview, { QuoteResultView } from '../modules/trade/BnbQuotePreview'

const CALLDATA =
  '0xd06ca61f000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000002000000000000000000000000bb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c00000000000000000000000055d398326f99059ff775485246999027b3197955'
const AMOUNTS =
  '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000075bcd15'
const SMALL =
  '0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000001'

test('getAmountsOut transport matches the certified router encoding', () => {
  assert.equal(
    encodeGetAmountsOut('10000000000000000', [
      '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      '0x55d398326f99059fF775485246999027B3197955',
    ]),
    CALLDATA,
  )
  assert.equal(decodeGetAmountsOut(AMOUNTS), '123456789')
  assert.equal(formatUnits('123456789', 18), '0.000000000123456789')
})

test('a stale or wrong pair never reaches RPC', async () => {
  assert.equal(quoteIsStale('2020-01-01T00:00:00.000Z', Date.parse('2020-01-01T00:00:20.000Z')), true)
  assert.equal(quoteIsStale('2020-01-01T00:00:00.000Z', Date.parse('2020-01-01T00:00:10.000Z')), false)
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return { ok: true, json: async () => ({ result: '0x38' }) }
  }
  const wrongChain = await previewBnbQuote(
    { chainId: 1, sell: 'WBNB', buy: 'USDT', amount: '0.01' },
    { fetchImpl },
  )
  const wrongToken = await previewBnbQuote({ chainId: 56, sell: 'FOO', buy: 'USDT', amount: '0.01' }, { fetchImpl })
  assert.equal(wrongChain.ok, false)
  if (!wrongChain.ok) assert.equal(wrongChain.code, 'CHAIN_MISMATCH')
  assert.equal(wrongToken.ok, false)
  if (!wrongToken.ok) assert.equal(wrongToken.code, 'PAIR_REJECTED')
  assert.equal(calls, 0)
  assert.throws(() => assertReadonlyRpc('http://bsc-dataseed.bnbchain.org'))
  assert.throws(() => assertReadonlyRpc('https://example.invalid/rpc?key=secret'))
})

test('the higher factual router output wins and a timeout invents nothing', async () => {
  const methods: string[] = []
  const fetchImpl = async (_url: string, init: { body: string; signal: AbortSignal }) => {
    const body = JSON.parse(init.body) as { method: string; params: [{ to?: string }] }
    methods.push(body.method)
    if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
    const to = body.params[0].to?.toLowerCase() ?? ''
    const result = to.startsWith('0xc250') ? AMOUNTS : SMALL
    return { ok: true, json: async () => ({ result }) }
  }
  const quote = await previewBnbQuote(
    { chainId: 56, sell: 'WBNB', buy: 'USDT', amount: '0.01' },
    { fetchImpl, rpcUrl: 'https://bsc-dataseed.bnbchain.org', now: () => Date.parse('2026-10-13T00:00:00.000Z') },
  )
  assert.equal(quote.ok, true)
  if (quote.ok) {
    assert.equal(quote.venueId, 'melega-dex')
    assert.equal(quote.amountOutRaw, '123456789')
    assert.equal(quote.executable, false)
    assert.equal(quote.feeCollected, false)
    assert.equal(quote.priceImpactPercent, null)
    assert.equal(quote.gasUnits, null)
    assert.equal(quote.chainId, 56)
  }
  assert.deepEqual(methods, ['eth_chainId', 'eth_call', 'eth_call'])
  const html = renderToStaticMarkup(
    React.createElement(QuoteResultView, { result: quote, nowMs: Date.parse('2026-10-13T00:00:20.000Z') }),
  )
  assert.match(html, /Stale preview/)
  assert.equal(html.includes('>Swap<'), false)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
  assert.equal(html.includes('>Pay<'), false)

  const timed = await previewBnbQuote(
    { chainId: 56, sell: 'WBNB', buy: 'USDT', amount: '0.01' },
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
  if (!timed.ok) assert.equal(timed.code, 'QUOTE_TIMEOUT')
  assert.equal(timed.gasUnits, null)
})

test('the quote form has no transaction controls', () => {
  const html = renderToStaticMarkup(React.createElement(BnbQuotePreview))
  assert.match(html, /Preview quote/)
  assert.equal(html.includes('>Swap<'), false)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
  assert.equal(html.includes('>Pay<'), false)
  assert.match(html, /data-executable|Not executable|Preview quote/)
  const source = readFileSync(path.join(process.cwd(), 'modules/trade/BnbQuotePreview.tsx'), 'utf8')
  assert.match(source, /readGenerationCurrent/)
  assert.match(source, /setResult\(null\)/)
  assert.match(source, /abort\(\)/)
})
