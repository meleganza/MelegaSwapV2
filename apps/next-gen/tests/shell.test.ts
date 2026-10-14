import assert from 'assert'
import { readFileSync } from 'fs'
import path from 'path'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductPage } from '../components/ProductPage'
import ToolsPage from '../pages/tools/index'
import { SECTIONS } from '../lib/sections'

const BANNED = ['Top Farms', 'Top Pools', 'Latest listings', 'followers', 'KPI']

test('primary screens are non-operational and do not pretend to swap', () => {
  SECTIONS.filter((section) => section.id !== 'tools').forEach((section) => {
    const html = renderToStaticMarkup(React.createElement(ProductPage, { section }))
    assert.match(html, new RegExp(`<h1[^>]*>${section.title}</h1>`))
    assert.match(html, /Not operational/)
    assert.match(html, /data-operational="false"/)
    assert.equal(html.includes('<input'), false)
    assert.equal(html.includes('Confirm swap'), false)
    assert.match(html, /aria-label="Primary"/)
    assert.match(html, />Trade</)
    assert.match(html, />Earn</)
    assert.match(html, />Portfolio</)
    assert.match(html, />Explore</)
    assert.match(html, /Beta — read-only/)
    assert.equal(html.includes('Protected Beta'), false)
    assert.equal(html.includes('Leave beta'), false)
    assert.equal(html.includes('Access token'), false)
    assert.doesNotMatch(html, /\d+(?:\.\d+)?%\s*APY/i)
    BANNED.forEach((phrase) => assert.equal(html.includes(phrase), false, phrase))
  })
})

test('earn keeps withdrawal on the live DEX and does not offer create actions', () => {
  const earn = SECTIONS.find((section) => section.id === 'earn')
  const html = renderToStaticMarkup(React.createElement(ProductPage, { section: earn! }))
  assert.match(html, /Wallet withdrawal remains on the live DEX/)
  assert.match(html, /Public Create Farm and Create Pool are not offered/)
  assert.equal(html.includes('href="/farms'), false)
  assert.equal(html.includes('href="/pools'), false)
})

test('tools index lists commercial placeholders and no farm or pool factory', () => {
  const html = renderToStaticMarkup(React.createElement(ToolsPage))
  assert.match(html, /href="\/tools\/create-token"/)
  assert.match(html, /href="\/tools\/trend-boost"/)
  assert.match(html, /href="\/tools\/featured-project"/)
  assert.match(html, /href="\/tools\/premium-project"/)
  assert.equal(html.includes('create-farm'), false)
  assert.equal(html.includes('create-pool'), false)
  assert.match(html, /Not operational/)
})

test('the shell does not mint a login or a leave control', () => {
  const html = renderToStaticMarkup(React.createElement(ProductPage, { section: SECTIONS[0] }))
  assert.equal(html.includes('/api/access'), false)
  assert.equal(html.includes('/api/leave'), false)
  assert.equal(html.includes('type="password"'), false)
})

test('idle home does not mount the trend boost feed', () => {
  const shell = readFileSync(path.join(process.cwd(), 'components/BetaShell.tsx'), 'utf8')
  assert.equal(shell.includes('TrendBoostStrip'), false)
  assert.equal(shell.includes('/api/trend-boost-active'), false)
  assert.equal(/useEffect\s*\(/.test(shell), false)
})

test('the visible shell states read-only beta without a password', () => {
  const html = renderToStaticMarkup(React.createElement(ProductPage, { section: SECTIONS[0] }))
  assert.match(html, /Beta — read-only/)
  assert.equal(html.includes('Protected Beta'), false)
  assert.equal(html.includes('type="password"'), false)
  assert.equal(html.includes('Access token'), false)
})

test('the shell carries MelegaDex Evo branding, Tools, and canonical resource links', () => {
  const html = renderToStaticMarkup(React.createElement(ProductPage, { section: SECTIONS[0] }))
  assert.match(html, /MelegaDex/)
  assert.match(html, />Evo</)
  assert.match(html, /melega-badge-flat\.png/)
  assert.match(html, />Tools</)
  assert.equal(html.includes('Advanced Console'), false)
  assert.equal(html.includes('Next Gen'), false)
  assert.match(html, /https:\/\/docs\.melega\.finance\//)
  assert.match(html, /https:\/\/x\.com\/meleganews/)
  assert.match(html, /https:\/\/t\.me\/melegacommunity/)
})
