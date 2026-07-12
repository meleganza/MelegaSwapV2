#!/usr/bin/env node
/**
 * R789 — 88-route production matrix (copies r788 with r789 output paths).
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const src = path.join(__dirname, 'r788-capture-matrix.mjs')
let code = readFileSync(src, 'utf8')
code = code.replace(/R788/g, 'R789').replace(/r788-screenshots/g, 'r789-screenshots')
const tmp = path.join(__dirname, '_r789-capture-matrix-run.mjs')
writeFileSync(tmp, code)
execSync(`node "${tmp}"`, { stdio: 'inherit', env: { ...process.env, R789_BASE: process.env.R789_BASE || 'https://www.melega.finance' } })
