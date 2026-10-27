import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { encodeBalanceOf } from '../lib/portfolioRead'
import { readPortfolio } from '../lib/portfolioRpc'
import { readGenerationCurrent } from '../lib/readGeneration'
import PortfolioLookup, { PortfolioResult } from '../modules/portfolio/PortfolioLookup'

const ACCOUNT = '0x0000000000000000000000000000000000000001'
const ZERO = '0x0000000000000000000000000000000000000000000000000000000000000000'
const ONE = '0x0000000000000000000000000000000000000000000000000de0b6b3a7640000'

test('balanceOf encoding is the ERC-20 selector and a padded account', () => {
  assert.equal(encodeBalanceOf(ACCOUNT), `0x70a08231${ACCOUNT.slice(2).padStart(64, '0')}`)
})

test('an invalid address or the wrong chain does not read balances', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return { ok: true, json: async () => ({ result: '0x38' }) }
  }
  const invalid = await readPortfolio({ chainId: 56, address: 'not-an-address' }, { fetchImpl })
  const wrongChain = await readPortfolio({ chainId: 137, address: ACCOUNT }, { fetchImpl })
  assert.equal(invalid.ok, false)
  if (!invalid.ok) assert.equal(invalid.code, 'ADDRESS_REJECTED')
  assert.equal(wrongChain.code, 'CHAIN_MISMATCH')
  assert.equal(calls, 0)
  assert.equal(invalid.assets.length, 0)
})

test('zero balances stay zero, a failed token stays unavailable, and USD is not invented', async () => {
  const methods: string[] = []
  const fetchImpl = async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { method: string; params: [{ to?: string }?] }
    methods.push(body.method)
    if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
    if (body.method === 'eth_getBalance') return { ok: true, json: async () => ({ result: '0x0' }) }
    const to = body.params[0]?.to?.toLowerCase()
    if (to === '0x963556de0eb8138e97a85f0a86ee0acd159d210b') {
      const error = new Error('aborted')
      error.name = 'TimeoutError'
      throw error
    }
    return { ok: true, json: async () => ({ result: ZERO }) }
  }
  const read = await readPortfolio(
    { chainId: 56, address: ACCOUNT },
    { fetchImpl, rpcUrl: 'https://bsc-dataseed.bnbchain.org' },
  )
  assert.equal(read.chainId, 56)
  assert.equal(read.executable, false)
  assert.equal(read.custody, false)
  assert.equal(read.walletConnected, false)
  assert.equal(read.lpPositionsSupported, false)
  assert.equal(read.farmPositionsSupported, false)
  const marco = read.assets.find((asset) => asset.symbol === 'MARCO')
  const wbnb = read.assets.find((asset) => asset.symbol === 'WBNB')
  assert.equal(marco?.status, 'unavailable')
  assert.equal(marco?.raw, null)
  assert.equal(wbnb?.status, 'ok')
  assert.equal(wbnb?.raw, '0')
  assert.equal(wbnb?.usd, null)
  assert.equal(wbnb?.usdtQuoteRaw, '0')
  assert.equal(methods.includes('eth_getLogs'), false)
  assert.equal(methods.filter((method) => method === 'eth_call').length, 4)

  const html = renderToStaticMarkup(React.createElement(PortfolioResult, { result: read }))
  assert.match(html, /<strong>WBNB<\/strong><span>0<\/span>/)
  assert.match(html, /<strong>MARCO<\/strong><span>—<\/span>/)
  assert.match(html, /USD valuation and unscanned positions are omitted/)
  assert.match(html, /www\.melega\.finance\/farms\?view=my/)
  assert.equal(html.includes('>Withdraw<'), false)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
})

test('a nonzero balance can show a router USDT quote and the form has no signing controls', async () => {
  const fetchImpl = async (_url: string, init: { body: string }) => {
    const body = JSON.parse(init.body) as { method: string; params: [{ to?: string; data?: string }?] }
    if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: '0x38' }) }
    if (body.method === 'eth_getBalance') return { ok: true, json: async () => ({ result: ONE }) }
    const to = body.params[0]?.to?.toLowerCase() ?? ''
    if (to.startsWith('0xc250') || to.startsWith('0x10ed')) {
      return {
        ok: true,
        json: async () => ({
          result:
            '0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000075bcd15',
        }),
      }
    }
    if (to === '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c') {
      return { ok: true, json: async () => ({ result: ONE }) }
    }
    return { ok: true, json: async () => ({ result: ZERO }) }
  }
  const read = await readPortfolio(
    { chainId: 56, address: ACCOUNT },
    { fetchImpl, rpcUrl: 'https://bsc-dataseed.bnbchain.org' },
  )
  const bnb = read.assets.find((asset) => asset.symbol === 'BNB')
  assert.equal(bnb?.raw, '1000000000000000000')
  assert.equal(bnb?.usd, null)
  assert.equal(bnb?.usdtQuoteRaw, '123456789')
  const form = renderToStaticMarkup(React.createElement(PortfolioLookup))
  assert.match(form, /View portfolio/)
  assert.match(form, /Public address/)
  assert.equal(form.includes('>Withdraw<'), false)
  assert.equal(form.includes('window.ethereum'), false)
  const source = readFileSync(path.join(process.cwd(), 'modules/portfolio/PortfolioLookup.tsx'), 'utf8')
  assert.equal(readGenerationCurrent(1, 1), true)
  assert.equal(readGenerationCurrent(1, 2), false)
  assert.match(source, /readGenerationCurrent/)
  assert.match(source, /setResult\(null\)/)
  assert.match(source, /abort\(\)/)
})
