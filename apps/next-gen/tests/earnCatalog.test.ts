import assert from 'assert'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { buildEarnCatalog, emptyCatalog, formatReportedApy } from '../lib/earnCatalog'
import { readEarnCatalog } from '../lib/earnCatalogRpc'
import { EarnCatalogView } from '../modules/earn/EarnCatalog'

const NOW = Date.parse('2026-10-14T12:00:00.000Z')
const FRESH = '2026-10-14T11:59:00.000Z'
const STALE = '2026-10-14T11:00:00.000Z'

function vault(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    name: id,
    chain: 'bsc',
    status: 'active',
    platformId: 'pancakeswap',
    assets: ['WBNB', 'USDT'],
    ...overrides,
  }
}

test('a missing or non-numeric APY stays null and is not replaced', () => {
  assert.equal(formatReportedApy(null), null)
  assert.equal(formatReportedApy(0.1), '10.00%')
  const catalog = buildEarnCatalog({
    vaults: [vault('pancake-cow-bsc-wbnb-usdt-vault'), vault('pancake-cow-bsc-eth-wbnb-vault', { assets: ['ETH', 'WBNB'] })],
    apy: { 'pancake-cow-bsc-wbnb-usdt-vault': 0.1, 'pancake-cow-bsc-eth-wbnb-vault': '12%' },
    tvl: { '56': { 'pancake-cow-bsc-wbnb-usdt-vault': 1000 } },
    fetchedAt: FRESH,
    nowMs: NOW,
  })
  assert.equal(catalog.ok, true)
  const first = catalog.opportunities.find((row) => row.id === 'pancake-cow-bsc-wbnb-usdt-vault')
  const second = catalog.opportunities.find((row) => row.id === 'pancake-cow-bsc-eth-wbnb-vault')
  assert.equal(first?.apyDecimal, 0.1)
  assert.equal(first?.tvlUsd, 1000)
  assert.equal(second?.apyDecimal, null)
  assert.equal(second?.tvlUsd, null)
  assert.equal(first?.updatedAt, null)
  assert.equal(first?.withdrawalNote, 'This source did not return withdrawal conditions.')
  assert.equal(first?.feeNote, 'This source did not return a fee.')
  assert.equal(first?.sourceRisk, null)
  assert.equal(first?.href, 'https://app.beefy.com/vault/pancake-cow-bsc-wbnb-usdt-vault')
  assert.equal(first?.deposit, false)
  assert.equal(JSON.stringify(catalog).toLowerCase().includes('guaranteed'), false)
})

test('only true Beefy risk flags are copied', () => {
  const catalog = buildEarnCatalog({
    vaults: [vault('pancake-cow-bsc-cake-wbnb-vault', { assets: ['CAKE', 'WBNB'], risks: { updatedAt: 1765557014, complex: true, notCorrelated: false, notAudited: true }, withdrawalFee: 0.1 })],
    apy: { 'pancake-cow-bsc-cake-wbnb-vault': 0.05 },
    tvl: { '56': {} },
    fetchedAt: FRESH,
    nowMs: NOW,
  })
  const row = catalog.opportunities[0]
  assert.deepEqual(row.sourceRisk?.raised, ['complex', 'notAudited'])
  assert.equal(row.sourceRisk?.updatedAt, '2025-12-12T16:30:14.000Z')
  assert.equal(row.feeNote, 'Beefy withdrawalFee 0.1')
  assert.equal(row.apyDecimal, 0.05)
})

test('retired, non-BNB, and stale rows do not invent a fresh number', () => {
  const catalog = buildEarnCatalog({
    vaults: [
      vault('kept', { assets: ['CAKE'] }),
      vault('retired', { status: 'eol' }),
      vault('other', { chain: 'ethereum' }),
      vault('other-protocol', { platformId: 'venus' }),
    ],
    apy: { kept: 0.2, retired: 9, other: 9 },
    tvl: { '56': { kept: 50, retired: 999999 } },
    fetchedAt: STALE,
    nowMs: NOW,
  })
  assert.deepEqual(catalog.opportunities.map((row) => row.id), ['kept'])
  assert.equal(catalog.opportunities[0].stale, true)
  assert.equal(catalog.opportunities[0].apyDecimal, 0.2)
  assert.equal(catalog.opportunities[0].fetchedAt, STALE)
})

test('a failed catalog read returns no opportunities', async () => {
  const timed = await readEarnCatalog({
    now: () => NOW,
    fetchImpl: async () => {
      const error = new Error('aborted')
      error.name = 'TimeoutError'
      throw error
    },
  })
  assert.equal(timed.ok, false)
  if (!timed.ok) assert.equal(timed.code, 'TIMEOUT')
  assert.equal(timed.opportunities.length, 0)
  assert.equal(timed.deposit, false)

  const bad = await readEarnCatalog({
    now: () => NOW,
    fetchImpl: async () => ({ ok: true, json: async () => ({ nope: true }) }),
  })
  assert.equal(bad.ok, false)
  assert.deepEqual(bad.opportunities, emptyCatalog('UNAVAILABLE', FRESH).opportunities)
})

test('a vault id that is not a Beefy slug never becomes a link', () => {
  const catalog = buildEarnCatalog({
    vaults: [vault('https://evil.example/phish'), vault('Not A Vault'), vault('ok-vault', { assets: ['CAKE'] })],
    apy: {},
    tvl: { '56': {} },
    fetchedAt: FRESH,
    nowMs: NOW,
  })
  assert.deepEqual(catalog.opportunities.map((row) => row.href), ['https://app.beefy.com/vault/ok-vault'])
  assert.equal(catalog.opportunities[0].netYield, null)
  assert.equal(catalog.opportunities[0].receiptAddress, null)
})

test('the wrong chain never calls Beefy, and a missing APY feed stays null', async () => {
  let calls = 0
  const fetchImpl = async (url: string) => {
    calls += 1
    if (url.endsWith('/apy')) return { ok: false, json: async () => ({}) }
    if (url.endsWith('/tvl')) return { ok: true, json: async () => ({ '56': {} }) }
    return {
      ok: true,
      json: async () => [vault('ok-vault', { assets: ['CAKE'], earnedTokenAddress: '0x1111111111111111111111111111111111111111', tokenDecimals: 18 })],
    }
  }
  const wrong = await readEarnCatalog({ chainId: 1, fetchImpl: fetchImpl as never, now: () => NOW })
  assert.equal(wrong.ok, false)
  if (!wrong.ok) assert.equal(wrong.code, 'CHAIN_MISMATCH')
  assert.equal(calls, 0)
  const partial = await readEarnCatalog({ chainId: 56, fetchImpl: fetchImpl as never, now: () => NOW })
  assert.equal(partial.ok, true)
  assert.equal(partial.opportunities[0].apyDecimal, null)
  assert.equal(partial.opportunities[0].receiptAddress, '0x1111111111111111111111111111111111111111')
})

test('the catalog view has no deposit or signature control', () => {
  const html = renderToStaticMarkup(
    React.createElement(EarnCatalogView, {
      asset: '',
      protocol: '',
      catalog: buildEarnCatalog({
        vaults: [vault('pancake-cow-bsc-wbnb-usdt-vault')],
        apy: {},
        tvl: { '56': {} },
        fetchedAt: FRESH,
        nowMs: NOW,
      }),
    }),
  )
  assert.match(html, /APY<\/dt><dd>Unavailable/)
  assert.match(html, /Melega fee: 0/)
  assert.match(html, /Net APY is unknown/)
  assert.match(html, /Manage funds on Beefy/)
  assert.match(html, /Open on Beefy/)
  assert.match(html, /https:\/\/app\.beefy\.com\/vault\/pancake-cow-bsc-wbnb-usdt-vault/)
  assert.equal(html.includes('>Deposit<'), false)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
  assert.equal(html.includes('>Pay<'), false)
})
