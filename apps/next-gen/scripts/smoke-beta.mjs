/**
 * Anonymous read-only beta smoke. No access password and no live chain read.
 */
const base = process.env.BETA_BASE_URL || 'http://127.0.0.1:4317'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

async function request(pathname, options = {}) {
  const response = await fetch(base + pathname, { redirect: 'manual', ...options })
  const body = await response.text()
  return { response, body }
}

const home = await request('/', { headers: { accept: 'text/html', cookie: 'ng_beta=obsolete' } })
assert(home.response.status === 200, `anonymous home status ${home.response.status}`)
assert((home.response.headers.get('x-robots-tag') || '').includes('noindex'), 'missing noindex')
assert((home.response.headers.get('cache-control') || '').includes('no-store'), 'missing no-store')
assert(!(home.response.headers.get('set-cookie') || '').includes('ng_beta='), 'home minted a login cookie')
assert(home.body.includes('Beta — read-only'), 'missing read-only label')
assert(!home.body.includes('Protected Beta'), 'protected label remains')
assert(home.body.includes('>Trade<') && home.body.includes('>Earn<') && home.body.includes('>Portfolio<') && home.body.includes('>Explore<'), 'primary actions missing')
assert(!home.body.includes('Leave beta'), 'leave control remains')
assert(!home.body.includes('Access token'), 'password form remains')
assert(!home.body.includes('type="password"'), 'password field remains')
assert(!/\/api\/quote|\/api\/portfolio|\/api\/earn|\/api\/earn-catalog|\/api\/shadow-readiness|\/api\/trend-boost-active|\/api\/sealed-prepare/.test(home.body), 'home html calls a read api')

const pages = ['/bridge', '/earn', '/portfolio', '/tools']
for (const pathname of pages) {
  const page = await request(pathname, { headers: { accept: 'text/html' } })
  assert(page.response.status === 200, `${pathname} status ${page.response.status}`)
  assert(page.body.includes('Not operational'), `${pathname} must say it is not operational`)
  assert(!(page.response.headers.get('set-cookie') || '').includes('ng_beta='), `${pathname} minted a cookie`)
}

const access = await request('/access', { headers: { accept: 'text/html' } })
assert(access.response.status === 307, `access status ${access.response.status}`)
assert(access.response.headers.get('location')?.endsWith('/'), 'access must return home')
assert(!access.body.includes('<form'), 'access still has a form')

const retired = await request('/api/access', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
assert(retired.response.status === 410, `retired access status ${retired.response.status}`)
const leave = await request('/api/leave', { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
assert(leave.response.status === 410, `retired leave status ${leave.response.status}`)

const quote = await request('/api/quote', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chainId: 1, sell: 'WBNB', buy: 'USDT', amount: '0.01' }),
})
assert(quote.response.status === 422, `bad quote status ${quote.response.status}`)
const quoteBody = JSON.parse(quote.body)
assert(quoteBody.ok === false && quoteBody.code === 'CHAIN_MISMATCH', 'bad quote was not rejected before a read')
assert(quoteBody.executable === false && quoteBody.feeCollected === false, 'quote flags changed')

const portfolio = await request('/api/portfolio', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chainId: 56, address: 'zz' }),
})
assert(portfolio.response.status === 422, `bad portfolio status ${portfolio.response.status}`)
assert(JSON.parse(portfolio.body).code === 'ADDRESS_REJECTED', 'bad address was not rejected')
assert(JSON.parse(portfolio.body).rpcCalls === 0, 'bad address reached RPC')

const earn = await request('/api/earn', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chainId: 137 }),
})
assert(earn.response.status === 422, `bad earn status ${earn.response.status}`)
const earnBody = JSON.parse(earn.body)
assert(earnBody.code === 'CHAIN_MISMATCH' && earnBody.aprPercent === null && earnBody.deposit === false, 'earn flags changed')

const method = await request('/api/quote', { method: 'GET' })
assert(method.response.status === 405, `quote GET status ${method.response.status}`)

const shadow = await request('/api/shadow-readiness', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ chainId: 1, address: '0x0000000000000000000000000000000000000001' }),
})
assert(shadow.response.status === 422, `bad shadow status ${shadow.response.status}`)
const shadowBody = JSON.parse(shadow.body)
assert(shadowBody.code === 'CHAIN_MISMATCH' && shadowBody.rpcCalls === 0, 'wrong chain reached a shadow read')
assert(shadowBody.executable === false && shadowBody.unsignedTx === null && shadowBody.feeCollected === false, 'shadow flags changed')

console.log('smoke-beta: anonymous read-only shell passed')
