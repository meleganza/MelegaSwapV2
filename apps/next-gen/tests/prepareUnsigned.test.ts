import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import { prepareUnsignedFromSealed } from '../lib/prepareUnsigned'
import { MELEGA_BEEFY_HANDOFF_FEE } from '../lib/earnCatalog'

const rawQuote = {
  ok: true,
  chainId: 56,
  amountOutRaw: '7400000000000000000',
  amountInRaw: '10000000000000000',
  venueId: 'pancakeswap',
}

test('a getAmountsOut quote is refused before an unsigned transaction is built', async () => {
  const result = await prepareUnsignedFromSealed(rawQuote, {
    request: rawQuote,
    user: '0x1111111111111111111111111111111111111111',
    deadline: 1_800_000_000,
    nonce: '1',
    nowIso: '2026-10-15T00:00:00.000Z',
    currentChainId: 56,
  })
  assert.equal(result.ok, false)
  assert.equal(result.code, 'RAW_QUOTE_NOT_SEALED_CANDIDATE')
  assert.equal(result.unsignedTx, null)
  assert.equal(result.broadcast, false)
  assert.equal(result.signed, false)
  assert.equal(result.approved, false)
})

test('the wrong chain is refused before the preparer runs', async () => {
  const result = await prepareUnsignedFromSealed(rawQuote, {
    request: rawQuote,
    user: '0x1111111111111111111111111111111111111111',
    deadline: 1_800_000_000,
    nonce: '1',
    nowIso: '2026-10-15T00:00:00.000Z',
    currentChainId: 1,
  })
  assert.equal(result.code, 'CHAIN_MISMATCH')
  assert.equal(result.unsignedTx, null)
})

test('the wallet sends only from a click and the Beefy handoff fee is zero', () => {
  const wallet = readFileSync(path.join(process.cwd(), 'certification/BnbWalletPrepare.tsx'), 'utf8')
  const preview = readFileSync(path.join(process.cwd(), 'modules/trade/BnbQuotePreview.tsx'), 'utf8')
  assert.equal(preview.includes('BnbWalletPrepare'), false)
  assert.equal(preview.includes('Connect BNB wallet'), false)
  assert.equal(wallet.includes('eth_sendRawTransaction'), false)
  assert.equal(wallet.includes('eth_signTransaction'), false)
  assert.equal(/useEffect\s*\(/.test(wallet), false)
  assert.match(wallet, /eth_sendTransaction/)
  assert.equal(MELEGA_BEEFY_HANDOFF_FEE, 0)
  const catalog = readFileSync(path.join(process.cwd(), 'lib/earnCatalog.ts'), 'utf8')
  assert.match(catalog, /https:\/\/app\.beefy\.com\/vault\/\$\{id\}/)
  assert.equal(catalog.includes('ref='), false)
})
