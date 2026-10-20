import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import { computeFeeAmountRaw } from '@melega/smartswap-v2-prepare/src/evaluateRevenuePolicy'
import { evmNetwork } from '@melega/smartswap-v2-prepare/src/domain'
import { CANONICAL_EXAMPLE_ASSETS } from '@melega/smartswap-v2-prepare/src/assetIdentity'
import type { SmartSwapRequest } from '@melega/smartswap-v2-prepare/src/quote'
import { createPancakeSwapVenueAdapter } from '../../web/src/lib/smartswap-universal-engine/pancakeSwapAdapter'
import { runEvmShadowCompetition } from '../../web/src/lib/smartswap-universal-engine/shadowCompetition'
import { createSyntheticQuoteSource } from '../../web/src/lib/smartswap-universal-engine/shadowQuoteSource'
import { acceptSealedWinner, prepareSealedBnbSwap } from '../lib/sealedPrepare'
import { reviewPreviewBlocksExecution } from '../lib/previewIsolation'
import sealedPrepareHandler from '../pages/api/sealed-prepare'

const NOW = '2026-08-20T00:00:05.000Z'
const USER = '0x1111111111111111111111111111111111111111'
const WBNB = '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
const USDC = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'

async function sealedWinner() {
  const request: SmartSwapRequest = {
    requestId: 'sealed-parity',
    network: evmNetwork(56),
    inputAsset: CANONICAL_EXAMPLE_ASSETS.wbnb,
    outputAsset: CANONICAL_EXAMPLE_ASSETS.usdcBnb,
    inputAmountRaw: '1000000',
    exactOut: false,
    slippageBps: 50,
  }
  const result = await runEvmShadowCompetition({
    request,
    productionQuote: null,
    adapters: [createPancakeSwapVenueAdapter(createSyntheticQuoteSource({ [`56:${WBNB}>${USDC}`]: { amountOutRaw: '500000', gasUnits: '180000' } }))],
    nowIso: NOW,
  })
  return result.shadowWinner
}

test('the wrong chain and an unsealed winner never prepare a transaction', async () => {
  let calls = 0
  const wrong = await prepareSealedBnbSwap(
    { chainId: 1, sell: 'WBNB', buy: 'USDC', amount: '0.01', user: USER, slippageBps: 50 },
    { compete: async () => { calls += 1; return { shadowWinner: null } } },
  )
  assert.equal(wrong.code, 'CHAIN_MISMATCH')
  assert.equal(wrong.unsignedTx, null)
  assert.equal(calls, 0)

  const raw = acceptSealedWinner({ ok: true, amountOutRaw: '1', status: 'ok' }, NOW)
  assert.equal(raw.ok, false)
  if (!raw.ok) assert.equal(raw.code, 'RAW_QUOTE_NOT_SEALED_CANDIDATE')
})

test('a stale sealed quote is not prepared', () => {
  const stale = acceptSealedWinner({ status: 'stale', sealedFee: { feeAmountRaw: '1' } }, NOW)
  assert.equal(stale.ok, false)
  if (!stale.ok) assert.equal(stale.code, 'QUOTE_STALE')
})

test('a canonical sealed candidate keeps the policy fee and does not broadcast', async () => {
  const winner = await sealedWinner()
  assert.equal(winner?.sealedFee?.feeAmountRaw, computeFeeAmountRaw(winner?.originalInputAmountRaw ?? '', winner?.smartSwapFeeBps ?? 0))
  const prepared = await prepareSealedBnbSwap(
    { chainId: 56, sell: 'WBNB', buy: 'USDC', amount: '0.000000000001', user: USER, slippageBps: 50 },
    {
      now: () => new Date(NOW),
      compete: async () => ({ shadowWinner: winner }),
      allowanceRaw: winner?.originalInputAmountRaw ?? '0',
    },
  )
  assert.equal(prepared.ok, true)
  assert.equal(prepared.broadcast, false)
  assert.equal(prepared.signed, false)
  assert.equal(prepared.approved, false)
  assert.equal(prepared.feeAmountRaw, winner?.sealedFee?.feeAmountRaw)
  assert.equal(prepared.feeBps, winner?.smartSwapFeeBps)
  assert.equal(prepared.gasUnits, '180000')
  assert.equal(prepared.unsignedTx?.value, '0x0')
  assert.equal(prepared.slippageBps, 50)
  assert.equal(typeof prepared.unsignedTx?.data, 'string')
  const feeWord = BigInt(prepared.feeAmountRaw ?? '0').toString(16).padStart(64, '0')
  const swapData = prepared.unsignedTx?.data.toLowerCase() ?? ''
  assert.equal(swapData.split(feeWord).length - 1, 1, 'sealed fee appears once')
  assert.ok(swapData.includes('b6436ef4c7f76be0f26c0c5c9db72f2689abf65b'), 'treasury beneficiary missing')

  const noGasWinner = JSON.parse(JSON.stringify(winner)) as typeof winner
  if (noGasWinner?.quote) noGasWinner.quote.estimatedGasUnits = null
  const missingGas = await prepareSealedBnbSwap(
    { chainId: 56, sell: 'WBNB', buy: 'USDC', amount: '0.000000000001', user: USER, slippageBps: 50 },
    { now: () => new Date(NOW), compete: async () => ({ shadowWinner: noGasWinner }), allowanceRaw: noGasWinner?.originalInputAmountRaw ?? '0' },
  )
  assert.equal(missingGas.ok, true)
  assert.equal(missingGas.gasUnits, null)
  assert.equal(missingGas.unsignedTx?.to.toLowerCase(), prepared.unsignedTx?.to.toLowerCase())
  assert.equal(missingGas.broadcast, false)

  const short = await prepareSealedBnbSwap(
    { chainId: 56, sell: 'WBNB', buy: 'USDC', amount: '0.000000000001', user: USER, slippageBps: 50 },
    { now: () => new Date(NOW), compete: async () => ({ shadowWinner: winner }), allowanceRaw: '0' },
  )
  assert.equal(short.code, 'ALLOWANCE_SHORT')
  assert.equal(short.unsignedTx, null)
  assert.equal(short.approved, false)
  assert.match(short.approvalTx?.data ?? '', /^0x095ea7b3/i)
  assert.ok(short.approvalTx?.data.toLowerCase().includes('7c07082839edd5797737640bba6af47992b9861e'))
  assert.equal(short.approvalTx?.data.toLowerCase().includes('f'.repeat(64)), false)
  assert.equal(short.broadcast, false)
  assert.equal(short.signed, false)
})

test('the review preview refuses an executable swap plan', async () => {
  for (const env of [{}, { BETA_REVIEW_EXECUTION: '' }, { BETA_REVIEW_EXECUTION: 'certify' }, { BETA_REVIEW_EXECUTION: 'allow' }]) {
    assert.equal(reviewPreviewBlocksExecution(env), true)
  }
  const routeSource = readFileSync(path.join(process.cwd(), 'pages/api/sealed-prepare.ts'), 'utf8')
  assert.equal(routeSource.includes('prepareSealedBnbSwap'), false)
  assert.equal(routeSource.includes('BETA_REVIEW_EXECUTION'), false)
  const previous = process.env.BETA_REVIEW_EXECUTION
  const originalFetch = globalThis.fetch
  let fetchCalls = 0
  globalThis.fetch = (async () => {
    fetchCalls += 1
    throw new Error('preparer must not run')
  }) as typeof fetch
  try {
    for (const value of [undefined, '', 'certify', 'other']) {
      if (value === undefined) delete process.env.BETA_REVIEW_EXECUTION
      else process.env.BETA_REVIEW_EXECUTION = value
      const seen: { status: number | null; headers: Record<string, string>; body: Record<string, unknown> | null } = {
        status: null,
        headers: {},
        body: null,
      }
      const res = {
        setHeader(key: string, header: string) {
          seen.headers[key] = header
        },
        status(code: number) {
          seen.status = code
          return this
        },
        json(body: Record<string, unknown>) {
          seen.body = body
        },
      }
      await sealedPrepareHandler({
        method: 'POST',
        query: { BETA_REVIEW_EXECUTION: 'certify' },
        headers: { 'x-beta-review-execution': 'certify', cookie: 'BETA_REVIEW_EXECUTION=certify' },
        body: {
          chainId: 56,
          sell: 'WBNB',
          buy: 'USDT',
          amount: '0.01',
          user: '0x1111111111111111111111111111111111111111',
          BETA_REVIEW_EXECUTION: 'certify',
          certify: true,
        },
      } as never, res as never)
      assert.equal(seen.status, 403)
      assert.equal(seen.headers['X-Melega-Surface'], 'next-gen-beta')
      assert.equal(seen.body?.code, 'PREVIEW_READ_ONLY')
      assert.equal(seen.body?.unsignedTx, null)
      assert.equal(seen.body?.approvalTx, null)
      assert.equal(seen.body?.broadcast, false)
      assert.equal(seen.body?.signed, false)
      assert.equal(seen.body?.executable, false)
    }
  } finally {
    globalThis.fetch = originalFetch
    if (previous === undefined) delete process.env.BETA_REVIEW_EXECUTION
    else process.env.BETA_REVIEW_EXECUTION = previous
  }
  assert.equal(fetchCalls, 0)
})

test('the adapter source does not sign or recompute a fee schedule', () => {
  const source = readFileSync(path.join(process.cwd(), 'lib/sealedPrepare.ts'), 'utf8')
  assert.match(source, /runAuthorizedEvmShadowCompetition/)
  assert.equal(source.includes('eth_sendRawTransaction'), false)
  assert.equal(source.includes('eth_sendTransaction'), false)
  assert.equal(source.includes('eth_sign'), false)
  assert.equal(source.includes('feeBps ='), false)
  assert.match(source, /buildV2UserExecutionPlan/)
})
