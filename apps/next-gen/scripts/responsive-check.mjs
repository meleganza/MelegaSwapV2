/**
 * LOCAL guest shell. Fresh temporary profile, no cookies or auth headers.
 * Widths 320, 390, 430, 768, and 1440. Idle window is 3 seconds after load.
 */
import { spawn } from 'node:child_process'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const base = process.env.BETA_BASE_URL || 'http://127.0.0.1:4317'
const chromeBin = process.env.CHROME_PATH
const outDir = process.env.BETA_SCREENSHOT_DIR || ''
const widths = [320, 390, 430, 768, 1440]

if (!chromeBin) {
  console.error('CHROME_PATH is required')
  process.exit(1)
}
if (outDir) mkdirSync(outDir, { recursive: true })

const guestProfile = mkdtempSync(join(tmpdir(), 'ng009-guest-'))
const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    '--remote-allow-origins=*',
    `--user-data-dir=${guestProfile}`,
    'about:blank',
  ],
  { stdio: 'ignore' },
)

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

let version
for (let attempt = 0; attempt < 40; attempt += 1) {
  try {
    const response = await fetch('http://127.0.0.1:9223/json/version')
    if (response.ok) {
      version = await response.json()
      break
    }
  } catch {
    await sleep(100)
  }
}
if (!version?.webSocketDebuggerUrl) {
  chrome.kill()
  console.error('Chrome DevTools did not open')
  process.exit(1)
}

const ws = new WebSocket(version.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  ws.addEventListener('open', resolve)
  ws.addEventListener('error', reject)
})

let nextId = 0
const pending = new Map()
ws.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message)
    pending.delete(message.id)
  }
})

function send(method, params = {}) {
  const id = (nextId += 1)
  return new Promise((resolve, reject) => {
    pending.set(id, (message) => {
      if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`))
      else resolve(message.result)
    })
    ws.send(JSON.stringify({ id, method, params }))
  })
}

const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
const { webSocketDebuggerUrl } = (await (await fetch('http://127.0.0.1:9223/json/list')).json()).find(
  (target) => target.id === targetId,
)
ws.close()

const page = new WebSocket(webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  page.addEventListener('open', resolve)
  page.addEventListener('error', reject)
})
const pagePending = new Map()
const pageEvents = []
const requestUrls = []
const requestNotes = []
page.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pagePending.has(message.id)) {
    pagePending.get(message.id)(message)
    pagePending.delete(message.id)
  } else if (message.method) {
    pageEvents.push(message)
    if (message.method === 'Network.requestWillBeSent' && message.params?.request?.url) {
      const request = message.params.request
      requestUrls.push(request.url)
      requestNotes.push({ url: request.url, method: request.method, postData: request.postData || '' })
    }
  }
})
function call(method, params = {}) {
  const id = (nextId += 1)
  return new Promise((resolve, reject) => {
    pagePending.set(id, (message) => {
      if (message.error) reject(new Error(`${method}: ${JSON.stringify(message.error)}`))
      else resolve(message.result)
    })
    page.send(JSON.stringify({ id, method, params }))
  })
}
function waitForLoad() {
  pageEvents.length = 0
  return new Promise((resolve, reject) => {
    const started = Date.now()
    const timer = setInterval(() => {
      const index = pageEvents.findIndex((event) => event.method === 'Page.loadEventFired')
      if (index >= 0) {
        clearInterval(timer)
        pageEvents.splice(index, 1)
        resolve()
      } else if (Date.now() - started > 15000) {
        clearInterval(timer)
        reject(new Error('timed out waiting for load'))
      }
    }, 30)
  })
}

await call('Page.enable')
await call('Network.enable')
await call('Network.clearBrowserCookies')
await call('Network.clearBrowserCache')

const routes = ['/', '/earn', '/portfolio', '/explore', '/tools']

for (const width of widths) {
  const widthStart = requestUrls.length
  const height = width >= 1440 ? 900 : 844
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 800,
  })
  for (const route of routes) {
    const loaded = waitForLoad()
    await call('Page.navigate', { url: `${base}${route}` })
    await loaded
    await sleep(3000)
    const { result } = await call('Runtime.evaluate', {
      expression: `JSON.stringify({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        text: document.body.innerText,
        readOnly: document.body.innerText.includes('Beta — read-only'),
        operational: document.querySelector('[data-operational="false"]') ? 'false' : 'missing',
        inputs: document.querySelectorAll('input').length,
        h1: document.querySelector('h1') ? document.querySelector('h1').textContent : '',
        actions: ['Trade', 'Earn', 'Portfolio', 'Explore'].every((label) => document.body.innerText.includes(label)),
        cta: (() => {
          const node = document.querySelector('.compact-swap > .primary-action')
          if (!node) return null
          const box = node.getBoundingClientRect()
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
          return { ...box.toJSON(), clear: hit === node || node.contains(hit) }
        })(),
        primaryClear: [...document.querySelectorAll('.mobile-nav a, .desktop-nav a')].filter((node) => {
          const style = getComputedStyle(node)
          const box = node.getBoundingClientRect()
          return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0
        }).every((node) => {
          const box = node.getBoundingClientRect()
          const hit = document.elementFromPoint(box.left + box.width / 2, box.top + box.height / 2)
          return hit === node || node.contains(hit)
        }),
        mobileNav: (() => {
          const node = document.querySelector('.mobile-nav')
          return node && getComputedStyle(node).display !== 'none' ? node.getBoundingClientRect().toJSON() : null
        })(),
        pageHeight: document.documentElement.scrollHeight,
        viewportHeight: document.documentElement.clientHeight,
        nestedScroll: [...document.querySelectorAll('.app-stage, .main, .trade-layout, .trade-surface')].some((node) => {
          const style = getComputedStyle(node)
          return /(auto|scroll)/.test(style.overflowY) && node.scrollHeight > node.clientHeight + 1
        })
      })`,
      returnByValue: true,
    })
    const measured = JSON.parse(result.value)
    if (measured.scroll > measured.client + 1) {
      throw new Error(`${route} at ${width} overflows ${measured.scroll} > ${measured.client}`)
    }
    if (measured.operational !== 'false' || !measured.actions || !measured.readOnly || !measured.primaryClear) {
      throw new Error(`${route} at ${width} failed shell checks ${result.value}`)
    }
    if (route === '/' && width <= 430 && (!measured.cta || !measured.cta.clear || !measured.mobileNav || measured.cta.bottom > measured.mobileNav.top)) {
      throw new Error(`${route} at ${width} does not keep the full Swap CTA above bottom navigation ${result.value}`)
    }
    if (route === '/' && width >= 1440 && measured.pageHeight > measured.viewportHeight + 1) {
      throw new Error(`${route} at ${width} has avoidable desktop scrolling ${result.value}`)
    }
    if (measured.nestedScroll) throw new Error(`${route} at ${width} has nested vertical scrolling ${result.value}`)
    console.log(
      `${width} ${route}: overflow 0, h1 ${measured.h1}, CTA ${measured.cta?.bottom ?? 'n/a'}, nav ${measured.mobileNav?.top ?? 'desktop'}, height ${measured.pageHeight}/${measured.viewportHeight}`,
    )
  }
  if (outDir) {
    const shot = await call('Page.captureScreenshot', { format: 'png' })
    writeFileSync(`${outDir}/shell-${width}.png`, Buffer.from(shot.data, 'base64'))
  }
  const slice = requestUrls.slice(widthStart)
  const widthHosts = [...new Set(slice.map((url) => new URL(url).host))]
  const paths = slice.map((url) => new URL(url).pathname)
  console.log(
    `${width} requests ${slice.length}; hosts ${widthHosts.join(',') || 'none'}; paths ${paths.join(' ')}`,
  )
}

const pageHost = new URL(base).host
const banned = requestNotes.filter((note) => {
  const url = new URL(note.url)
  const api = url.pathname.startsWith('/api/')
  const foreign = url.host !== pageHost
  const rpc = /jsonrpc|eth_call|eth_chainId|eth_send|bsc-dataseed|publicnode|quicknode|nodereal|melega\.finance/i.test(
    `${note.url}\n${note.postData}`,
  )
  return foreign || rpc
})
if (banned.length > 0) {
  throw new Error(`banned network calls: ${banned.map((note) => note.url).join(', ')}`)
}
const hosts = [...new Set(requestUrls.map((url) => new URL(url).host))]
const apiCount = requestUrls.filter((url) => new URL(url).pathname.startsWith('/api/')).length
console.log(`LOCAL requests ${requestUrls.length}; api ${apiCount}; hosts ${hosts.join(', ') || 'none'}`)
if (outDir) {
  writeFileSync(
    `${outDir}/LOCAL-requests.json`,
    JSON.stringify({ label: 'LOCAL', profile: 'fresh-temporary-guest', idleMs: 3000, apiCount, hosts, urls: requestUrls }, null, 2),
  )
}
page.close()
chrome.kill()
console.log('responsive-check passed')
