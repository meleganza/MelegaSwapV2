#!/usr/bin/env node
/**
 * D87 DEX Pricing Constitution alignment validator.
 * Authority: KIRI Codex — D87_DEX_PRICING_RATIFIED
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const WEB_ROOT = path.resolve(__dirname, '..')
const SRC = path.join(WEB_ROOT, 'src')

const checks = []

function pass(id, detail) {
  checks.push({ id, ok: true, detail })
}

function fail(id, detail) {
  checks.push({ id, ok: false, detail })
}

function read(rel) {
  return fs.readFileSync(path.join(SRC, rel), 'utf8')
}

function mustInclude(rel, needles, id) {
  const content = read(rel)
  for (const needle of needles) {
    if (!content.includes(needle)) {
      fail(id, `Missing "${needle}" in ${rel}`)
      return
    }
  }
  pass(id, `${rel} contains D87 wiring`)
}

function mustExclude(rel, needles, id) {
  const content = read(rel)
  for (const needle of needles) {
    if (content.includes(needle)) {
      fail(id, `Forbidden "${needle}" still present in ${rel}`)
      return
    }
  }
  pass(id, `${rel} excludes deprecated local fee split`)
}

// Codex artifacts
for (const file of [
  'lib/d87-pricing/codex/ratified.ts',
  'lib/d87-pricing/d87PricingCodex.ts',
  'lib/d87-pricing/swapProtocolFee.ts',
  'lib/d87-pricing/servicePricingDisplay.ts',
]) {
  if (fs.existsSync(path.join(SRC, file))) pass(`codex-${file}`, file)
  else fail(`codex-${file}`, `Missing ${file}`)
}

// Swap UI — protocol fee + MARCO incentive
mustInclude('views/Swap/components/SwapModalFooter.tsx', ['lib/d87-pricing', 'MarcoBuyFeeIncentive', 'Protocol Fee'], 'swap-footer-d87')
mustInclude('views/Swap/SmartSwap/components/SwapModalFooter.tsx', ['lib/d87-pricing', 'MarcoBuyFeeIncentive', 'Protocol Fee'], 'smartswap-footer-d87')
mustInclude('views/Swap/components/AdvancedSwapDetails.tsx', ['resolveSwapProtocolFeeContextFromFields', 'MarcoBuyFeeIncentive', 'FSC_01_POLICY_REF'], 'advanced-swap-d87')

mustExclude('views/Swap/components/SwapModalFooter.tsx', ['TREASURY_FEE', 'BUYBACK_FEE'], 'swap-footer-no-local-split')
mustExclude('views/Swap/SmartSwap/components/SwapModalFooter.tsx', ['TREASURY_FEE', 'BUYBACK_FEE'], 'smartswap-footer-no-local-split')
mustExclude('views/Swap/components/AdvancedSwapDetails.tsx', ['TREASURY_FEE', 'BUYBACK_FEE'], 'advanced-swap-no-local-split')

// Treasury handoff — forward only, FSC-01 metadata
mustInclude('lib/treasury-handoff/buildSwapHandoffContext.ts', ['resolveSwapProtocolFeeContext', 'feeSplitPolicyRef', 'pricingCodexId'], 'handoff-d87')
mustInclude('lib/treasury-handoff/buildExecutionReceiptPayload.ts', ['pricingCodexId', 'feeSplitPolicyRef'], 'receipt-d87')
mustInclude('lib/treasury-handoff/normalizeTreasuryIntakePayload.ts', ['pricingCodexId', 'feeSplitPolicyRef', 'buyMarcoIncentiveApplied'], 'intake-d87-metadata')

// Build Studio pricing display
mustInclude('views/BuildStudio/components/CreateTokenPanel.tsx', ['getServicePriceLabel', 'data-d87-token-creation-pricing'], 'build-token-pricing')
mustInclude('views/BuildStudio/components/SecondRowCards.tsx', ['data-d87-farm-pricing', 'data-d87-staking-pool-pricing'], 'build-farm-staking-pricing')
mustInclude('views/BuildStudio/buildRuntime/buildBuilderTemplates.ts', ['D87_PRICING_CODEX_ID', 'getServicePricing'], 'build-templates-pricing')

// MARCO buy rule in codex
const codex = read('lib/d87-pricing/codex/ratified.ts')
if (codex.includes('protocolFeeStandardBps: 30') && codex.includes('protocolFeeBuyMarcoBps: 20')) {
  pass('codex-swap-fees', 'Standard 0.30% / buy MARCO 0.20% bps')
} else {
  fail('codex-swap-fees', 'Swap fee bps mismatch')
}

if (codex.includes("buyMarcoRule: 'output_token_is_marco'")) {
  pass('codex-buy-marco-rule', 'Buy MARCO = output token is MARCO')
} else {
  fail('codex-buy-marco-rule', 'Missing buyMarcoRule')
}

const failed = checks.filter((c) => !c.ok)
const report = {
  marker: 'DEX_D87_PRICING_VALIDATION',
  ok: failed.length === 0,
  passed: checks.filter((c) => c.ok).length,
  failed: failed.length,
  checks,
}

console.log(JSON.stringify(report, null, 2))
process.exit(failed.length === 0 ? 0 : 1)
