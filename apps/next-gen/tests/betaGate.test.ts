import assert from 'assert'
import { test } from 'node:test'
import { publicReadDecision, SECURITY_HEADERS } from '../lib/betaGate'

test('every product path is open and the retired access page goes home', () => {
  assert.equal(publicReadDecision('/'), 'allow')
  assert.equal(publicReadDecision('/earn'), 'allow')
  assert.equal(publicReadDecision('/portfolio'), 'allow')
  assert.equal(publicReadDecision('/api/quote'), 'allow')
  assert.equal(publicReadDecision('/api/portfolio'), 'allow')
  assert.equal(publicReadDecision('/api/earn'), 'allow')
  assert.equal(publicReadDecision('/access'), 'redirect-home')
  assert.equal(publicReadDecision('/access/'), 'redirect-home')
})

test('responses stay noindex and private', () => {
  assert.match(SECURITY_HEADERS['X-Robots-Tag'], /noindex/)
  assert.match(SECURITY_HEADERS['Cache-Control'], /no-store/)
  assert.equal(SECURITY_HEADERS['X-Melega-Surface'], 'next-gen-beta')
})
