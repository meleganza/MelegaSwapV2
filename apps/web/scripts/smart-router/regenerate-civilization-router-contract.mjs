#!/usr/bin/env node
/** Regenerate civilization-router-contract.json from current registry + TS builder. */
import { spawnSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB = path.resolve(__dirname, '../..')
const generator = path.join(__dirname, 'regenerate-civilization-router-contract.ts')

const result = spawnSync('npx', ['tsx', generator], { cwd: WEB, stdio: 'inherit', encoding: 'utf8' })
process.exit(result.status ?? 1)
