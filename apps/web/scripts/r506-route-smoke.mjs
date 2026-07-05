/** R506 route smoke — no UI assertions, HTTP + shell markers only */
const BASE = process.env.SMOKE_BASE_URL || 'http://localhost:3000'
const ROUTES = ['/', '/trade', '/build-studio', '/collectibles', '/command-center', '/projects', '/radar', '/farms', '/pools']

async function main() {
  const results = []
  for (const route of ROUTES) {
    const url = `${BASE}${route}`
    try {
      const res = await fetch(url, { redirect: 'follow' })
      const html = await res.text()
      const ok = res.ok && !html.includes('Application error') && !html.includes('Internal Server Error')
      results.push({ route, status: res.status, ok })
    } catch (e) {
      results.push({ route, status: 0, ok: false, error: String(e) })
    }
  }
  const pass = results.every((r) => r.ok)
  console.log(JSON.stringify({ pass, results }, null, 2))
  process.exit(pass ? 0 : 1)
}

main()
