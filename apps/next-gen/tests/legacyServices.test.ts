import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductPage } from '../components/ProductPage'
import { ExternalService } from '../modules/tools/ExternalService'
import PortfolioLookup from '../modules/portfolio/PortfolioLookup'
import PortfolioGate from '../modules/portfolio/PortfolioGate'
import CreateToken from '../modules/tools/CreateToken'
import FeaturedProject from '../modules/tools/FeaturedProject'
import PremiumProject from '../modules/tools/PremiumProject'
import TrendBoost from '../modules/tools/TrendBoost'
import {
  LIVE_DEX_LINKS,
  isLiveDexHref,
  isPublicMarcoPair,
  marcoPublicPairs,
  parseTrendBoostActive,
} from '../lib/legacyServices'
import { COMMERCIAL_TOOLS } from '../lib/tools'
import { sectionById } from '../lib/sections'
import { uxSectionById } from '../lib/uxSections'

const ADDRESS = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

test('public MARCO pairs are the live activation set and do not invent Base', () => {
  const pairs = marcoPublicPairs()
  assert.deepEqual(
    pairs.map((pair) => `${pair.fromId}:${pair.toId}`),
    ['bnb:polygon', 'polygon:bnb', 'bnb:robinhood', 'robinhood:bnb', 'bnb:solana', 'solana:bnb', 'bnb:arc', 'arc:bnb'],
  )
  assert.equal(isPublicMarcoPair('bnb', 'base'), false)
  assert.equal(isPublicMarcoPair('base', 'bnb'), false)
  assert.equal(pairs.some((pair) => pair.fromId === 'base' || pair.toId === 'base'), false)
  assert.equal(isLiveDexHref(LIVE_DEX_LINKS.bridge), true)
})

test('live handoff links stay on the canonical host', () => {
  Object.values(LIVE_DEX_LINKS).forEach((href) => {
    assert.equal(isLiveDexHref(href), true, href)
    assert.equal(href.startsWith('https://www.melega.finance/'), true)
  })
  assert.equal(isLiveDexHref('javascript:alert(1)'), false)
  assert.equal(isLiveDexHref('https://evil.example/bridge'), false)
  assert.equal(isLiveDexHref('/bridge'), false)
  assert.equal(isLiveDexHref('#'), false)
  assert.equal(isLiveDexHref('https://user:pass@www.melega.finance/bridge'), false)
})

test('Boost rows require the canonical schema and a safe project identity', () => {
  assert.deepEqual(parseTrendBoostActive(null), { ok: false, placements: [] })
  assert.deepEqual(parseTrendBoostActive({ schema: 'other', placements: [{ orderId: '1', projectSlug: 'marco', chainId: 56 }] }), {
    ok: false,
    placements: [],
  })
  const empty = parseTrendBoostActive({ schema: 'melega.trend-boost-active.v1', placements: [] })
  assert.equal(empty.ok, true)
  assert.deepEqual(empty.placements, [])
  const mixed = parseTrendBoostActive({
    schema: 'melega.trend-boost-active.v1',
    placements: [
      { orderId: 'ok', projectSlug: 'marco', chainId: 56, projectContract: ADDRESS, startsAt: '2026-10-01T00:00:00.000Z', endsAt: '2026-10-02T00:00:00.000Z' },
      { orderId: 'bad slug', projectSlug: 'Not A Slug', chainId: 56 },
      { projectSlug: 'marco', chainId: 56 },
      { orderId: 'unknown-chain', projectSlug: 'marco', chainId: 999, projectContract: ADDRESS },
      { orderId: 'bad-contract', projectSlug: 'marco', chainId: 56, projectContract: '0x123' },
    ],
  })
  assert.equal(mixed.ok, true)
  if (!mixed.ok) return
  assert.equal(mixed.placements.length, 3)
  assert.equal(mixed.placements[0].projectHref, 'https://www.melega.finance/@marco/')
  assert.equal(mixed.placements[0].tokenHref, `https://www.melega.finance/token/bsc/${ADDRESS}`)
  assert.equal(mixed.placements[1].tokenHref, null)
  assert.equal(mixed.placements[2].tokenHref, null)
})

test('bridge and explore render verified links and do not execute', () => {
  const bridge = renderToStaticMarkup(React.createElement(ProductPage, { section: sectionById('bridge') }))
  assert.match(bridge, /https:\/\/www\.melega\.finance\/bridge/)
  assert.match(bridge, /Polygon \(137\)/)
  assert.match(bridge, /Solana/)
  assert.equal(bridge.includes('Base'), false)
  assert.match(bridge, /Bridge execution is disabled/)
  assert.equal(bridge.includes('Choose origin'), false)
  assert.match(bridge, /Not operational/)

  const explore = renderToStaticMarkup(React.createElement(ProductPage, { section: uxSectionById('explore') }))
  assert.match(explore, /https:\/\/www\.melega\.finance\/projects"/)
  assert.match(explore, /https:\/\/www\.melega\.finance\/projects\?sort=trending/)
  assert.match(explore, /https:\/\/www\.melega\.finance\/info\/bsc/)
  assert.match(explore, /Directories open on the live DEX/)
  assert.equal(explore.includes('/api/trend-boost-active'), false)
  assert.equal(explore.includes('No discovery feed connected'), false)

  const home = renderToStaticMarkup(React.createElement(ProductPage, { section: sectionById('swap') }))
  assert.equal(home.includes('/api/trend-boost-active'), false)
  assert.match(home, /Projects, tokens, and paid Boost/)
})

test('tools hand off only when the href is a verified live DEX url', () => {
  COMMERCIAL_TOOLS.forEach((tool) => assert.equal(isLiveDexHref(tool.href), true, tool.id))
  const pages = [CreateToken, TrendBoost, FeaturedProject, PremiumProject].map((Component) =>
    renderToStaticMarkup(React.createElement(Component)),
  )
  const joined = pages.join('\n')
  assert.match(joined, /list\?intent=create-token/)
  assert.match(joined, /list\?intent=create-project#featured/)
  assert.match(joined, /list\?intent=create-project#trend-boost/)
  assert.match(joined, /list\?intent=create-project/)
  assert.match(joined, /Leaves this beta/)
  assert.equal(joined.includes('Get Featured'), false)
  assert.equal(joined.includes('checkout button'), false)
  assert.equal(joined.includes('javascript:'), false)

  const blocked = renderToStaticMarkup(
    React.createElement(ExternalService, { title: 'Missing', detail: 'Not verified.', href: 'https://evil.example/pay' }),
  )
  assert.match(blocked, /Unavailable/)
  assert.equal(blocked.includes('Continue on the live DEX'), false)
  assert.equal(blocked.includes('evil.example'), false)
})

test('portfolio keeps live withdrawal links before a balance read', () => {
  const gate = renderToStaticMarkup(React.createElement(PortfolioGate))
  assert.match(gate, /liquidity-studio\?view=remove/)
  assert.match(gate, /farms\?view=my/)
  assert.match(gate, /pools\?view=positions/)
  const shell = readFileSync(path.join(process.cwd(), 'components/BetaShell.tsx'), 'utf8')
  assert.equal(shell.includes('/api/trend-boost-active'), false)
})
