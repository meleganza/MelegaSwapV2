import { readFileSync, writeFileSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
export const WEB_ROOT = path.resolve(__dirname, '../..')
export const REPO_ROOT = path.resolve(WEB_ROOT, '../..')

export const PATHS = {
  registryIndex: path.join(WEB_ROOT, 'public/registry/smart-router/index.json'),
  civilizationContract: path.join(WEB_ROOT, 'public/registry/smart-router/civilization-router-contract.json'),
  abiDraft: path.join(WEB_ROOT, 'src/lib/melega-smart-router/wrapper/MelegaSmartRouterWrapper.abi.json'),
  forgeArtifact: path.join(REPO_ROOT, 'out/MelegaSmartRouterWrapper.sol/MelegaSmartRouterWrapper.json'),
}

export function loadJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

export function writeJson(filePath, data) {
  writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`)
}

export function requireEnv(name) {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`Missing required env: ${name}`)
  return value
}

export function optionalEnv(name) {
  const value = process.env[name]?.trim()
  return value && value.length > 0 ? value : null
}

export function requireAddress(name) {
  const value = requireEnv(name)
  if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
    throw new Error(`${name} must be a 0x-prefixed 20-byte address`)
  }
  return value
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function assertForgeArtifactExists() {
  if (!existsSync(PATHS.forgeArtifact)) {
    throw new Error(`Forge artifact missing at ${PATHS.forgeArtifact} — run: forge build`)
  }
}
