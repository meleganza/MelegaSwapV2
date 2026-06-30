/**
 * Renders the Melega design system catalogue to static HTML for preview screenshots.
 * Usage: npx tsx apps/web/scripts/render-design-system-catalogue.ts
 */
import fs from 'fs'
import path from 'path'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { MelegaDesignSystemCatalogue } from '../src/design-system/melega/catalogue/MelegaDesignSystemCatalogue'

const outDir = path.resolve(__dirname, '../../../docs/screenshots/design-system')
const outHtml = path.join(outDir, 'catalogue.html')

fs.mkdirSync(outDir, { recursive: true })

const sheet = new ServerStyleSheet()
const body = ReactDOMServer.renderToStaticMarkup(sheet.collectStyles(<MelegaDesignSystemCatalogue />))
const styles = sheet.getStyleTags()
sheet.seal()

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
  ${styles}
  <style>body { margin: 0; }</style>
</head>
<body>${body}</body>
</html>`

fs.writeFileSync(outHtml, html)
console.log(`Wrote ${outHtml}`)
