#!/usr/bin/env node
/**
 * Read-only KERL Smart Router Wrapper V2 compatibility probe.
 * Validates registry + certificate + on-chain bytecode without writes.
 */
import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = resolve(__dirname, '../..')
const LOCAL_REGISTRY = resolve(
  WEB_ROOT,
  'public/public/registry/melega-dex/smart-router-wrapper-v2.json',
)
const LOCAL_CERT = resolve(
  WEB_ROOT,
  'public/public/registry/melega-dex/smart-router-wrapper-v2-certificate.json',
)

const CANONICAL_WRAPPER = '0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db'
const BSC_TESTNET_RPC = 'https://data-seed-prebsc-1-s1.binance.org:8545'
const DEFAULT_REGISTRY_URL =
  process.env.SMART_ROUTER_WRAPPER_V2_REGISTRY_URL ??
  'https://kiri.melega.ai/public/registry/melega-dex/smart-router-wrapper-v2.json'

const REQUIRED_REGISTRY_FIELDS = [
  'schema',
  'registry_version',
  'chain_id',
  'wrapper_v2_contract_address',
  'wrapper_abi_reference',
  'machine_contract_address',
  'certificate_url',
  'supported_routes',
  'treasury_intake_address',
  'marco_testnet_address',
  'wbnb_testnet_address',
  'pair_marco_wbnb_address',
  'deployment_block',
  'verifier_status',
  'truth_status',
]

const EXECUTABLE_ROUTES = ['STANDARD_SWAP', 'BUY_MARCO', 'SELL_MARCO']

function isAddress(value) {
  return typeof value === 'string' && /^0x[a-fA-F0-9]{40}$/.test(value)
}

async function fetchJson(url, label) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15000) })
    return { ok: res.ok, status: res.status, body: res.ok ? await res.json() : null, label, url }
  } catch (error) {
    return { ok: false, status: 0, body: null, label, url, error: String(error) }
  }
}

async function fetchBytecode(address) {
  const res = await fetch(BSC_TESTNET_RPC, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getCode',
      params: [address, 'latest'],
    }),
    signal: AbortSignal.timeout(15000),
  })
  const json = await res.json()
  const code = json.result ?? '0x'
  return { ok: code !== '0x' && code.length > 4, codeLength: code.length, codePrefix: code.slice(0, 10) }
}

function validateRegistry(registry, source) {
  const errors = []
  const warnings = []

  for (const field of REQUIRED_REGISTRY_FIELDS) {
    if (registry[field] === undefined || registry[field] === null || registry[field] === '') {
      errors.push(`missing field: ${field}`)
    }
  }

  if (registry.chain_id !== 97) errors.push(`chain_id must be 97, got ${registry.chain_id}`)
  if (registry.wrapper_v2_contract_address?.toLowerCase() !== CANONICAL_WRAPPER.toLowerCase()) {
    errors.push('wrapper_v2_contract_address mismatch vs canonical deploy')
  }
  if (registry.machine_contract_address?.toLowerCase() !== CANONICAL_WRAPPER.toLowerCase()) {
    errors.push('machine_contract_address must equal wrapper_v2_contract_address on testnet')
  }
  if (registry.narrative_trade_supported === true) {
    errors.push('narrative_trade_supported must not be true')
  }
  if (Array.isArray(registry.supported_routes)) {
    if (registry.supported_routes.includes('NARRATIVE_TRADE')) {
      errors.push('NARRATIVE_TRADE must not appear in supported_routes')
    }
    for (const route of EXECUTABLE_ROUTES) {
      if (!registry.supported_routes.includes(route)) {
        errors.push(`supported_routes missing ${route}`)
      }
    }
  }

  return { source, errors, warnings, registry }
}

function validateCertificate(cert, registry) {
  const errors = []
  if (cert.wrapper_v2_contract_address?.toLowerCase() !== registry.wrapper_v2_contract_address?.toLowerCase()) {
    errors.push('certificate wrapper address mismatch')
  }
  if (cert.verifier_status !== 'passed') errors.push('certificate verifier_status must be passed')
  if (Array.isArray(cert.supported_routes) && cert.supported_routes.includes('NARRATIVE_TRADE')) {
    errors.push('certificate must not list NARRATIVE_TRADE as supported')
  }
  return errors
}

async function main() {
  const results = {
    probe: 'kerl-smart-router-wrapper-v2-compatibility',
    timestamp: new Date().toISOString(),
    registry_url: DEFAULT_REGISTRY_URL,
    canonical_wrapper: CANONICAL_WRAPPER,
    checks: {},
    verdict: 'PASS',
  }

  const remote = await fetchJson(DEFAULT_REGISTRY_URL, 'remote-registry')
  results.checks.remote_registry = {
    url: remote.url,
    http_status: remote.status,
    ok: remote.ok,
    error: remote.error ?? null,
  }

  let registry = remote.body
  let registrySource = 'remote'

  if (!remote.ok) {
    registry = JSON.parse(readFileSync(LOCAL_REGISTRY, 'utf8'))
    registrySource = 'local-fallback'
    results.checks.remote_registry.note =
      'Remote registry unreachable — validated local artifact (deploy required for Labs unblock)'
  }

  const registryValidation = validateRegistry(registry, registrySource)
  results.checks.registry_validation = registryValidation

  let cert
  const certUrl = registry.certificate_url
  const certRemote = certUrl ? await fetchJson(certUrl, 'remote-certificate') : null
  if (certRemote?.ok && certRemote.body) {
    cert = certRemote.body
    results.checks.remote_certificate = { url: certUrl, http_status: certRemote.status, ok: true }
  } else {
    cert = JSON.parse(readFileSync(LOCAL_CERT, 'utf8'))
    results.checks.remote_certificate = {
      url: certUrl,
      http_status: certRemote?.status ?? 0,
      ok: false,
      note: 'Using local certificate artifact',
    }
  }

  const certErrors = validateCertificate(cert, registry)
  results.checks.certificate_validation = { errors: certErrors }

  const bytecode = await fetchBytecode(CANONICAL_WRAPPER)
  results.checks.on_chain_bytecode = bytecode

  const allErrors = [
    ...registryValidation.errors,
    ...certErrors,
    ...(bytecode.ok ? [] : ['no bytecode at wrapper address on BNB Testnet']),
    ...(remote.ok ? [] : ['remote registry not HTTP 200 at kiri canonical URL']),
  ]

  if (allErrors.length) {
    results.verdict = remote.ok ? 'FAIL' : 'BLOCKED_DEPLOY_PENDING'
    results.errors = allErrors
  }

  results.env_secrets = {
    SMART_ROUTER_WRAPPER_V2_REGISTRY_URL: DEFAULT_REGISTRY_URL,
    SMART_ROUTER_WRAPPER_V2_CONTRACT_ADDRESS: CANONICAL_WRAPPER,
  }

  console.log(JSON.stringify(results, null, 2))
  process.exit(results.verdict === 'PASS' ? 0 : results.verdict === 'BLOCKED_DEPLOY_PENDING' ? 3 : 1)
}

main().catch((error) => {
  console.error(JSON.stringify({ verdict: 'ERROR', error: String(error) }, null, 2))
  process.exit(2)
})
