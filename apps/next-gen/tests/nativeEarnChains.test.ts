import assert from 'assert'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { LIVE_WITHDRAWAL_LINKS } from '../lib/portfolioRead'
import {
  LIVE_FARM_EXIT,
  LIVE_LIQUIDITY_EXIT,
  LIVE_POOL_EXIT,
  isNewNativeDepositAllowed,
  nativeEarnChain,
  terminatedNativeChains,
} from '../lib/nativeEarnChains'
import RetiredNativeEarn from '../modules/earn/RetiredNativeEarn'
import EarnPage from '../pages/earn'

test('only BNB native earn stays active and the three retired chains stay closed', () => {
  assert.equal(isNewNativeDepositAllowed(56), true)
  assert.equal(nativeEarnChain(56)?.status, 'active')
  for (const chainId of [137, 8453, 1]) {
    assert.equal(isNewNativeDepositAllowed(chainId), false)
    assert.equal(nativeEarnChain(chainId)?.status, 'terminated')
  }
  assert.equal(isNewNativeDepositAllowed(42161), false)
  assert.equal(nativeEarnChain(42161), null)
  assert.deepEqual(
    terminatedNativeChains().map((chain) => chain.chainId),
    [137, 8453, 1],
  )
})

test('retired exits use the verified live DEX routes and do not invent a chain query', () => {
  assert.deepEqual(
    [LIVE_LIQUIDITY_EXIT, LIVE_FARM_EXIT, LIVE_POOL_EXIT],
    LIVE_WITHDRAWAL_LINKS.map((link) => link.href),
  )
  const html = renderToStaticMarkup(React.createElement(RetiredNativeEarn))
  assert.match(html, /Terminated/)
  assert.match(html, /data-onchain-terminated="false"/)
  assert.match(html, /data-positions="unknown"/)
  assert.match(html, /does not mean your tokens were withdrawn/)
  assert.match(html, /Polygon/)
  assert.match(html, /Base/)
  assert.match(html, /Ethereum/)
  assert.equal(html.includes('chain=137'), false)
  assert.equal(html.includes('chain=8453'), false)
  assert.equal(html.includes('chain=1'), false)
  assert.match(html, /href="\/earn-retired"/)
  assert.equal(html.includes('the read above'), false)
  assert.match(html, /https:\/\/www\.melega\.finance\/farms\?view=my/)
  assert.match(html, /https:\/\/www\.melega\.finance\/pools\?view=positions/)
  assert.match(html, /https:\/\/www\.melega\.finance\/liquidity-studio\?view=remove/)
  assert.match(html, /polygonscan\.com\/address\/0x130d2BD998767B6091352dd71fEABa4460846D94/)
  assert.match(html, /basescan\.org\/address\/0x149EE9245E5eD52a89Ea777d19AD3A5D87873680/)
  assert.match(html, /etherscan\.io\/address\/0x585364c747CaF6cF6441656F803796230fb1d61c/)
  assert.equal(html.includes('>Deposit<'), false)
  assert.equal(html.includes('Create Farm'), false)
  assert.equal(html.includes('Create Pool'), false)
  assert.equal(html.includes('Beefy'), true)
})

test('the BNB earn page still lists the catalog and the retired notice', () => {
  const html = renderToStaticMarkup(React.createElement(EarnPage))
  assert.match(html, /PancakeSwap vaults on BNB/)
  assert.match(html, /Terminated native farms and pools/)
  assert.match(html, /href="\/earn"/)
})
