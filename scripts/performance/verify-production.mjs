import dns from 'node:dns/promises'
import https from 'node:https'
import { performance } from 'node:perf_hooks'

const hostname = process.env.MELEGA_HOST || 'www.melega.finance'
const paths = ['/', '/swap/', '/liquidity/', '/farms/', '/pools/', '/list/', '/projects/', '/bridge/']
const agent = new https.Agent({ keepAlive: true, maxSockets: 4 })

function probe(pathname) {
  return new Promise((resolve, reject) => {
    const startedAt = performance.now()
    const request = https.get({ hostname, path: pathname, agent, timeout: 8000 }, (response) => {
      const ttfb = performance.now() - startedAt
      response.resume()
      response.on('end', () => {
        resolve({
          path: pathname,
          status: response.statusCode,
          ttfbMs: Math.round(ttfb),
          totalMs: Math.round(performance.now() - startedAt),
          cache: response.headers['x-vercel-cache'] || 'n/a',
        })
      })
    })
    request.on('timeout', () => request.destroy(new Error(`Timeout: ${pathname}`)))
    request.on('error', reject)
  })
}

const [addresses, nameservers] = await Promise.all([dns.resolve4(hostname), dns.resolveNs('melega.finance')])
console.log({ hostname, addresses, nameservers })

const results = []
for (const pathname of paths) results.push(await probe(pathname))
console.table(results)

const failures = results.filter((result) => result.status !== 200 || result.ttfbMs > 1000 || result.totalMs > 2500)
agent.destroy()
if (failures.length) {
  console.error('Production verification failed', failures)
  process.exitCode = 1
}

