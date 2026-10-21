import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { readEarnPositions } from '../lib/earnPositionsRpc'
import { EarnPositionView } from '../modules/earn/EarnPositions'

const ADDRESS = '0x1111111111111111111111111111111111111111'
const RECEIPT = '0x2222222222222222222222222222222222222222'
const NOW = Date.parse('2026-10-14T12:00:00.000Z')

function vaultPayload() {
  return [
    {
      id: 'ok-vault',
      name: 'CAKE-WBNB',
      chain: 'bsc',
      status: 'active',
      platformId: 'pancakeswap',
      assets: ['CAKE', 'WBNB'],
      earnedTokenAddress: RECEIPT,
      tokenDecimals: 18,
    },
    {
      id: 'no-receipt',
      name: 'USDT',
      chain: 'bsc',
      status: 'active',
      platformId: 'pancakeswap',
      assets: ['USDT'],
    },
  ]
}

function beefyThen(balance: string | null, chain = '0x38') {
  return async (url: string, init: { body?: string }) => {
    if (url.includes('api.beefy.finance/vaults')) return { ok: true, json: async () => vaultPayload() }
    if (url.includes('api.beefy.finance/apy')) return { ok: true, json: async () => ({}) }
    if (url.includes('api.beefy.finance/tvl')) return { ok: true, json: async () => ({ '56': {} }) }
    const body = JSON.parse(init.body || '{}') as { method: string }
    if (body.method === 'eth_chainId') return { ok: true, json: async () => ({ result: chain }) }
    if (balance === null) return { ok: false, json: async () => ({}) }
    return { ok: true, json: async () => ({ result: balance }) }
  }
}

test('an invalid address or the wrong chain does not read receipts', async () => {
  let calls = 0
  const fetchImpl = async () => {
    calls += 1
    return { ok: true, json: async () => ({ result: '0x38' }) }
  }
  const wrong = await readEarnPositions({ chainId: 137, address: ADDRESS }, { fetchImpl: fetchImpl as never, now: () => NOW })
  assert.equal(wrong.ok, false)
  if (!wrong.ok) assert.equal(wrong.code, 'CHAIN_MISMATCH')
  const bad = await readEarnPositions({ chainId: 56, address: 'zz' }, { fetchImpl: fetchImpl as never, now: () => NOW })
  assert.equal(bad.ok, false)
  if (!bad.ok) assert.equal(bad.code, 'ADDRESS_REJECTED')
  assert.equal(calls, 0)
  assert.equal(wrong.rows.length, 0)
})

test('a zero receipt is factual and a failed token stays unavailable', async () => {
  const zero = await readEarnPositions(
    { chainId: 56, address: ADDRESS },
    { fetchImpl: beefyThen('0x0') as never, now: () => NOW, rpcUrl: 'https://bsc-dataseed.bnbchain.org' },
  )
  assert.equal(zero.ok, true)
  const held = zero.rows.find((row) => row.id === 'ok-vault')
  const missing = zero.rows.find((row) => row.id === 'no-receipt')
  assert.equal(held?.status, 'balance')
  assert.equal(held?.raw, '0')
  assert.equal(held?.display, '0')
  assert.equal(missing?.status, 'unsupported')
  assert.equal(missing?.raw, null)

  const failed = await readEarnPositions(
    { chainId: 56, address: ADDRESS },
    { fetchImpl: beefyThen(null) as never, now: () => NOW, rpcUrl: 'https://bsc-dataseed.bnbchain.org' },
  )
  assert.equal(failed.rows.find((row) => row.id === 'ok-vault')?.status, 'unavailable')
  assert.equal(failed.rows.find((row) => row.id === 'ok-vault')?.display, null)
})

test('the position view has no transaction control', () => {
  const html = renderToStaticMarkup(
    React.createElement(EarnPositionView, {
      result: {
        ok: true,
        chainId: 56,
        address: ADDRESS,
        executable: false,
        deposit: false,
        withdraw: false,
        rpcCalls: 2,
        rows: [
          {
            id: 'ok-vault',
            assets: ['CAKE', 'WBNB'],
            href: 'https://app.beefy.com/vault/ok-vault',
            status: 'balance',
            raw: '0',
            display: '0',
          },
        ],
      },
    }),
  )
  assert.match(html, /Manage on Beefy/)
  assert.match(html, /not a USD position/)
  assert.equal(html.includes('>Deposit<'), false)
  assert.equal(html.includes('>Approve<'), false)
  assert.equal(html.includes('>Sign<'), false)
  assert.equal(html.includes('>Withdraw<'), false)
  const source = readFileSync(path.join(process.cwd(), 'modules/earn/EarnPositions.tsx'), 'utf8')
  assert.match(source, /readGenerationCurrent/)
  assert.match(source, /setResult\(null\)/)
  assert.match(source, /abort\(\)/)
})
