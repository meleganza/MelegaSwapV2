import assert from 'assert'
import { readFileSync } from 'fs'
import { test } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ProductPage } from '../components/ProductPage'
import { palette } from '../lib/palette'
import { sectionById } from '../lib/sections'

function channel(hex: string, offset: number): number {
  const value = parseInt(hex.slice(offset, offset + 2), 16) / 255
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
}

function contrast(left: string, right: string): number {
  const lum = (hex: string) => {
    const normalized = hex.replace('#', '')
    return 0.2126 * channel(normalized, 0) + 0.7152 * channel(normalized, 2) + 0.0722 * channel(normalized, 4)
  }
  const [hi, lo] = [lum(left), lum(right)].sort((a, b) => b - a)
  return (hi + 0.05) / (lo + 0.05)
}

test('shell exposes one heading, a skip link, and named navigation', () => {
  const html = renderToStaticMarkup(React.createElement(ProductPage, { section: sectionById('swap') }))
  assert.equal(html.match(/<h1/g)?.length, 1)
  assert.match(html, /href="#content"/)
  assert.match(html, /Skip to content/)
  assert.match(html, /aria-label="Primary"/)
  assert.match(html, /aria-label="Secondary"/)
  assert.match(html, /role="status"/)
  assert.match(html, /aria-current="page"/)
})

test('pearl and graphite pairs clear WCAG AA body text and the selected tab', () => {
  assert.ok(contrast(palette.ink, palette.sheet) >= 7)
  assert.ok(contrast(palette.muted, palette.sheet) >= 4.5)
  assert.ok(contrast(palette.inverse, palette.graphite) >= 7)
  const css = readFileSync('styles/globals.css', 'utf8')
  Object.values(palette).forEach((hex) => assert.match(css, new RegExp(hex, 'i')))
  assert.match(css, /:focus-visible/)
  assert.match(css, /min-height:\s*48px/)
  assert.match(css, /grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/)
  assert.match(css, /overflow-x:\s*clip/)
  assert.match(readFileSync('pages/_document.tsx', 'utf8'), /<Html lang="en">/)
})
