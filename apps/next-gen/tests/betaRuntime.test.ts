import assert from 'assert'
import { test } from 'node:test'
import { assertBetaDark, BETA_RUNTIME } from '../lib/betaRuntime'
import { isCommercialTool } from '../lib/tools'

test('beta runtime permits identity and on-demand reads but keeps execution off', () => {
  assertBetaDark()
  assert.equal(BETA_RUNTIME.surface, 'next-gen-beta')
  assert.equal(BETA_RUNTIME.schedulers, 'disabled')
  assert.equal(BETA_RUNTIME.backgroundPolling, 'disabled')
  assert.equal(BETA_RUNTIME.canonicalReads, 'read-only-on-request')
  assert.equal(BETA_RUNTIME.rpc, 'read-only-on-request')
  assert.equal(BETA_RUNTIME.wallet, 'identity-read-only')
  assert.equal(BETA_RUNTIME.quotes, 'read-only-on-request')
  assert.equal(BETA_RUNTIME.transactions, 'disabled')
  assert.equal(BETA_RUNTIME.feeCollection, 'disabled')
})

test('public farm and pool creation are not commercial tools', () => {
  assert.equal(isCommercialTool('create-token'), true)
  assert.equal(isCommercialTool('trend-boost'), true)
  assert.equal(isCommercialTool('featured-project'), true)
  assert.equal(isCommercialTool('premium-project'), true)
  assert.equal(isCommercialTool('create-farm'), false)
  assert.equal(isCommercialTool('create-pool'), false)
})
