/**
 * Gate and shell smoke against a running next-gen server.
 * BETA_ACCESS_TOKEN must match the server. No wallet and no RPC.
 */
const base = process.env.BETA_BASE_URL || 'http://127.0.0.1:4317'
const token = process.env.BETA_ACCESS_TOKEN || ''

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(pathname, options = {}) {
  const response = await fetch(base + pathname, { redirect: 'manual', ...options })
  const body = await response.text()
  return { response, body }
}

const closed = await request('/', { headers: { accept: 'text/html' } })
assert(closed.response.status === 307, `expected anonymous HTML to redirect, got ${closed.response.status}`)
assert(closed.response.headers.get('location')?.endsWith('/access'), 'redirect target must be /access')
assert((closed.response.headers.get('x-robots-tag') || '').includes('noindex'), 'missing noindex')

const robots = await request('/robots.txt')
assert(robots.response.status === 200, 'robots.txt must stay public')
assert(robots.body.includes('Disallow: /'), 'robots.txt must disallow the host')

const access = await request('/access', { headers: { accept: 'text/html' } })
assert(access.response.status === 200, 'access page must render')
assert(access.body.includes('Access token'), 'access page must ask for the token')
assert(!access.body.includes('Not operational'), 'access page must not render the product shell')
assert(!access.body.includes('<nav'), 'access page must not render product navigation')

const denied = await request('/api/access', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: 'wrong-token-value' }),
})
assert(denied.response.status === 401, 'wrong token must be rejected')

const signed = await request('/api/access', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ password: token }),
})
assert(signed.response.status === 200, `correct token must open the gate, got ${signed.response.status}`)
const setCookie = signed.response.headers.get('set-cookie') || ''
assert(setCookie.startsWith('ng_beta='), 'session cookie missing')
assert(!setCookie.includes(token), 'cookie must not echo the raw token')
const cookie = setCookie.split(';')[0]

const pages = ['/', '/bridge', '/earn', '/portfolio', '/tools', '/tools/premium-project']
for (const pathname of pages) {
  const page = await request(pathname, { headers: { accept: 'text/html', cookie } })
  assert(page.response.status === 200, `${pathname} status ${page.response.status}`)
  assert(page.body.includes('Not operational'), `${pathname} must say it is not operational`)
  assert(page.body.includes('data-operational="false"'), `${pathname} missing operational flag`)
  assert(!page.body.includes('<input'), `${pathname} must not render an input`)
  assert(!/publicnode|quicknode|nodereal|\/api\/indexer|window\.ethereum/i.test(page.body), `${pathname} leaked a live client`)
}

const hidden = await request('/tools/create-farm', { headers: { accept: 'text/html', cookie } })
assert(hidden.response.status === 404, 'create farm must not be a route')
const hiddenPool = await request('/tools/create-pool', { headers: { accept: 'text/html', cookie } })
assert(hiddenPool.response.status === 404, 'create pool must not be a route')

const home = await request('/', { headers: { accept: 'text/html', cookie } })
assert(home.body.includes('>Swap<'), 'swap action missing')
assert(home.body.includes('>MARCO Bridge<'), 'bridge action missing')
assert(home.body.includes('>Earn<'), 'earn action missing')
assert(!/Top Farms|Top Pools|Latest listings|followers|APY/.test(home.body), 'home rendered a banned ranking')

console.log('smoke-beta: gate, shell, and non-operational routes passed')
