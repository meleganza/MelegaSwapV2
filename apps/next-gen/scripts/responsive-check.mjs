/**
 * Opens the authed shell in headless Chrome at 320, 390, 430, and 1440.
 * Checks overflow, the non-operational flag, and the three primary actions.
 */
import { spawn } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const base = process.env.BETA_BASE_URL || 'http://127.0.0.1:4317'
const chromeBin = process.env.CHROME_PATH
const outDir = process.env.BETA_SCREENSHOT_DIR || ''
const widths = [320, 390, 430, 768, 1440]

if (!chromeBin) {
  console.error('CHROME_PATH is required')
  process.exit(1)
}
if (outDir) mkdirSync(outDir, { recursive: true })

const chrome = spawn(
  chromeBin,
  [
    '--headless=new',
    '--disable-gpu',
    '--no-sandbox',
    '--remote-debugging-port=9223',
    '--remote-allow-origins=*',
    `--user-data-dir=${process.env.BETA_CHROME_PROFILE || '/tmp/ng001-chrome-profile'}`,
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
page.addEventListener('message', (event) => {
  const message = JSON.parse(event.data)
  if (message.id && pagePending.has(message.id)) {
    pagePending.get(message.id)(message)
    pagePending.delete(message.id)
  } else if (message.method) {
    pageEvents.push(message)
    if (message.method === 'Network.requestWillBeSent' && message.params?.request?.url) {
      requestUrls.push(message.params.request.url)
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

const routes = ['/']

for (const width of widths) {
  const widthStart = requestUrls.length
  const height = width >= 1440 ? 900 : 844
  await call('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width < 800,
  })
  for (const route of width === 390 ? routes : ['/']) {
    const loaded = waitForLoad()
    await call('Page.navigate', { url: `${base}${route}` })
    await loaded
    await sleep(150)
    const { result } = await call('Runtime.evaluate', {
      expression: `JSON.stringify({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
        text: document.body.innerText,
        operational: document.querySelector('[data-operational="false"]') ? 'false' : 'missing',
        inputs: document.querySelectorAll('input').length,
        h1: document.querySelector('h1') ? document.querySelector('h1').textContent : '',
        actions: ['Trade', 'Earn', 'Portfolio', 'Explore'].every((label) => document.body.innerText.includes(label)),
        cta: (() => {
          const node = document.querySelector('.quote-slot > button')
          return node ? node.getBoundingClientRect().toJSON() : null
        })(),
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
    if (measured.operational !== 'false' || measured.inputs !== 0 || !measured.actions) {
      throw new Error(`${route} at ${width} failed shell checks ${result.value}`)
    }
    if (width <= 430 && (!measured.cta || !measured.mobileNav || measured.cta.bottom > measured.mobileNav.top)) {
      throw new Error(`${route} at ${width} does not keep the full Swap CTA above bottom navigation ${result.value}`)
    }
    if (width >= 1440 && measured.pageHeight > measured.viewportHeight + 1) {
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

const banned = requestUrls.filter((url) =>
  /publicnode|quicknode|nodereal|bsc-dataseed|\/api\/indexer|\/api\/quote|\/api\/portfolio|\/api\/earn/i.test(url),
)
if (banned.length > 0) {
  throw new Error(`banned network calls: ${banned.join(', ')}`)
}
const hosts = [...new Set(requestUrls.map((url) => new URL(url).host))]
console.log(`requests ${requestUrls.length}; hosts ${hosts.join(', ') || 'none'}`)
page.close()
chrome.kill()
console.log('responsive-check passed')
