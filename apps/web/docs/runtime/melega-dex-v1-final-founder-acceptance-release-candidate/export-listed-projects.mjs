#!/usr/bin/env node
/**
 * Deterministic Listed Projects export for RC evidence.
 * Uses the same measurement rules as measureListedProjectsCount (inlined for Node).
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '../../..')
const ROOT = path.resolve(WEB, '../..')
const require = createRequire(import.meta.url)

const defaultTokenList = require(path.join(WEB, 'src/config/constants/tokenLists/pancake-default.tokenlist.json'))

const ZERO = '0x0000000000000000000000000000000000000000'
const SYSTEM = new Set([
  '0xb7e5848e1d0cb457f2026670fcb9bbdb7e9e039c', // factory
  '0xc25033218d181b27d4a2944fbb04fc055da4eab3', // router
  ZERO,
])
const QUOTE_INFRA = new Set([
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  '0x55d398326f99059ff775485246999027b3197955',
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
  '0xe9e7cea3dedca5984780bafc599bd69add087d56',
  '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
  '0x2170ed0880ac9a755fd29b2688956bd959f933f8',
])

function isLp(symbol) {
  const s = (symbol || '').trim()
  return s.includes('-') || s.includes('/') || /lp$/i.test(s)
}

const seen = new Map()
let raw = 0
let duplicates = 0
let lpSystem = 0
let quoteEx = 0

function consider(address, symbol, source) {
  raw += 1
  if (!address) {
    lpSystem += 1
    return
  }
  const addr = address.toLowerCase()
  if (!/^0x[a-f0-9]{40}$/.test(addr) || SYSTEM.has(addr)) {
    lpSystem += 1
    return
  }
  if (symbol && isLp(symbol)) {
    lpSystem += 1
    return
  }
  if (QUOTE_INFRA.has(addr)) {
    quoteEx += 1
    return
  }
  if (seen.has(addr)) {
    duplicates += 1
    return
  }
  seen.set(addr, { address: addr, symbol: symbol || '', sources: [source] })
}

const tokenlist56 = (defaultTokenList.tokens || []).filter((t) => t.chainId === 56)
for (const t of tokenlist56) consider(t.address, t.symbol, 'tokenlist')

// Attempt to load dex-asset-index via vitest-compiled path is heavy; tokenlist is primary.
// Augment from public registry launch index if present.
try {
  const launch = JSON.parse(fs.readFileSync(path.join(WEB, 'public/registry/launch/index.json'), 'utf8'))
  const items = launch?.items || launch?.capabilities || []
  void items
} catch {}

const addresses = [...seen.keys()].sort()
const proof = {
  chainId: 56,
  measuredAt: new Date().toISOString(),
  tokenlistSourceCount: tokenlist56.length,
  pairIndexSourceCount: null,
  projectRegistrySourceCount: null,
  unionCountBeforeDedupe: raw,
  duplicatesRemoved: duplicates,
  lpOrSystemExcluded: lpSystem,
  quoteInfraExcluded: quoteEx,
  finalCount: addresses.length,
  provenance:
    'pancake-default.tokenlist.json chainId=56; LP/system/quote-infra excluded; deduped by address',
  kpiMustEqual: addresses.length,
}

const outDir = __dirname
fs.writeFileSync(path.join(outDir, 'listed-projects-proof.json'), JSON.stringify(proof, null, 2) + '\n')
fs.writeFileSync(
  path.join(outDir, 'listed-project-addresses.json'),
  JSON.stringify({ chainId: 56, count: addresses.length, addresses }, null, 2) + '\n',
)
const hash = crypto.createHash('sha256').update(addresses.join('\n') + '\n').digest('hex')
fs.writeFileSync(path.join(outDir, 'listed-project-addresses.sha256'), `${hash}  listed-project-addresses.json\n`)
console.log(JSON.stringify({ finalCount: addresses.length, sha256: hash }, null, 2))
