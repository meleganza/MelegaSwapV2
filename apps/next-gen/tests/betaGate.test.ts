import assert from 'assert'
import { test } from 'node:test'
import {
  BETA_COOKIE_NAME,
  betaSessionCookie,
  clearBetaSessionCookie,
  configuredBetaToken,
  constantEqual,
  decideBetaRequest,
  digestHex,
  parseBearer,
  presentationMatches,
} from '../lib/betaGate'

const TOKEN = 'ng001-beta-token-ok'

test('short or missing access secrets stay closed', () => {
  assert.equal(configuredBetaToken(''), null)
  assert.equal(configuredBetaToken('too-short'), null)
  assert.equal(configuredBetaToken(`  ${TOKEN}  `), TOKEN)
})

test('hashes compare without accepting a different length early as a match', async () => {
  assert.equal(constantEqual('abcd', 'abce'), false)
  assert.equal(constantEqual('abcd', 'abc'), false)
  assert.equal(constantEqual('abcd', 'abcd'), true)
  const hash = await digestHex(TOKEN)
  assert.equal(hash.length, 64)
  assert.equal(await presentationMatches(TOKEN, `Bearer ${TOKEN}`, null), true)
  assert.equal(await presentationMatches(TOKEN, 'Bearer wrong-token-value', null), false)
  assert.equal(await presentationMatches(TOKEN, null, hash), true)
  assert.equal(await presentationMatches(TOKEN, null, hash.slice(0, -1) + '0'), false)
})

test('bearer parsing ignores empty and spaced values', () => {
  assert.equal(parseBearer(null), null)
  assert.equal(parseBearer('Basic abc'), null)
  assert.equal(parseBearer('Bearer token-value'), 'token-value')
})

test('unconfigured product routes close, and a browser is sent to the access page', () => {
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/', configured: false, authenticated: false, acceptsHtml: true }),
    { type: 'redirect', pathname: '/access' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/', configured: false, authenticated: false, acceptsHtml: false }),
    { type: 'closed' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/', configured: true, authenticated: false, acceptsHtml: true }),
    { type: 'redirect', pathname: '/access' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/', configured: true, authenticated: false, acceptsHtml: false }),
    { type: 'deny' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/bridge', configured: true, authenticated: true, acceptsHtml: true }),
    { type: 'allow' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/access', configured: true, authenticated: true, acceptsHtml: true }),
    { type: 'redirect', pathname: '/' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'GET', pathname: '/robots.txt', configured: false, authenticated: false, acceptsHtml: false }),
    { type: 'allow' },
  )
  assert.deepEqual(
    decideBetaRequest({ method: 'POST', pathname: '/api/access', configured: false, authenticated: false, acceptsHtml: false }),
    { type: 'allow' },
  )
})

test('session cookie is httpOnly and not the raw token', async () => {
  const hash = await digestHex(TOKEN)
  const cookie = betaSessionCookie(hash, true)
  assert.equal(cookie.includes(TOKEN), false)
  assert.match(cookie, new RegExp(`^${BETA_COOKIE_NAME}=${hash};`))
  assert.match(cookie, /HttpOnly/)
  assert.match(cookie, /SameSite=Strict/)
  assert.match(cookie, /Secure/)
  assert.match(clearBetaSessionCookie(false), /Max-Age=0/)
  assert.equal(clearBetaSessionCookie(false).includes('Secure'), false)
})
