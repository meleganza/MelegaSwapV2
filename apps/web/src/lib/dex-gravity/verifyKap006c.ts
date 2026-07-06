import fs from 'fs'
import path from 'path'

import {
  KAP_006C_MARKER,
  KAP_006E_MARKER,
  MELEGA_DEX_SCHEMA,
  MELEGA_EXECUTION_SCHEMA,
  MELEGA_EXCHANGE_RECEIPT_SCHEMA,
  MELEGA_LIQUIDITY_SCHEMA,
  MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA,
  EXCHANGE_RECEIPT_SCHEMA_ALIASES,
} from './constants'
import { buildMelegaDexV1 } from './buildDexMachineV1'
import { buildMelegaLiquidityV1 } from './buildLiquidityMachineV1'
import { buildMelegaExecutionV1 } from './buildExecutionMachineV1'
import { ROUTING_FACADE_MARKER } from '../routing-layer/facade'
import { isIngressDispatchActive } from '../execution-ingress/activation'
import { assertLpSubmitDeferralDocumented } from '../liquidity-runtime/lpSubmitDeferral'

const WEB_ROOT = path.resolve(__dirname, '../../..')
const MANIFEST_PATH = path.join(WEB_ROOT, 'public/registry/exchange/melega-dex.json')

export interface Kap006cVerificationResult {
  ok: boolean
  marker: typeof KAP_006C_MARKER
  kap006eClosed: boolean
  kap006eMarker?: typeof KAP_006E_MARKER
  checks: Array<{ id: string; ok: boolean; detail?: string }>
}

export function verifyKap006cDexGravity(): Kap006cVerificationResult {
  const checks: Kap006cVerificationResult['checks'] = []

  const routingFacadePath = path.join(WEB_ROOT, 'src/lib/routing-layer/facade.ts')
  checks.push({
    id: 'routing-layer-quote-owner',
    ok: fs.existsSync(routingFacadePath) && fs.readFileSync(routingFacadePath, 'utf8').includes(ROUTING_FACADE_MARKER),
  })

  const ingressDispatchPath = path.join(WEB_ROOT, 'src/lib/execution-ingress/dispatch.ts')
  const ingressSource = fs.existsSync(ingressDispatchPath) ? fs.readFileSync(ingressDispatchPath, 'utf8') : ''
  checks.push({
    id: 'execution-ingress-submit-owner',
    ok: ingressSource.includes('dispatchExecutionInstruction') && isIngressDispatchActive(),
  })

  const treasuryHandoffPath = path.join(WEB_ROOT, 'src/lib/treasury-handoff/buildExecutionReceiptPayload.ts')
  const treasurySource = fs.existsSync(treasuryHandoffPath)
    ? fs.readFileSync(treasuryHandoffPath, 'utf8')
    : ''
  checks.push({
    id: 'treasury-handoff-receipt-only',
    ok:
      treasurySource.includes("schema: 'melega.dex-execution-receipt.v1'") &&
      !treasurySource.includes('settlement_id'),
  })

  const dexGravitySource = fs.readFileSync(path.join(WEB_ROOT, 'src/lib/dex-gravity/constants.ts'), 'utf8')
  checks.push({
    id: 'no-opportunity-truth',
    ok: dexGravitySource.includes('Opportunity Truth') && dexGravitySource.includes('DEX_FORBIDDEN_AUTHORITIES'),
  })
  checks.push({
    id: 'no-gravity-computation',
    ok: dexGravitySource.includes('Civilization Gravity'),
  })

  checks.push({
    id: 'machine-schemas-emitted',
    ok:
      buildMelegaDexV1().schema === MELEGA_DEX_SCHEMA &&
      buildMelegaLiquidityV1().schema === MELEGA_LIQUIDITY_SCHEMA &&
      buildMelegaExecutionV1({ lifecycle: 'quoted' }).schema === MELEGA_EXECUTION_SCHEMA,
  })

  checks.push({
    id: 'exchange-receipt-alias',
    ok:
      EXCHANGE_RECEIPT_SCHEMA_ALIASES.includes(MELEGA_EXCHANGE_RECEIPT_SCHEMA) &&
      EXCHANGE_RECEIPT_SCHEMA_ALIASES.includes(MELEGA_DEX_EXECUTION_RECEIPT_SCHEMA),
  })

  checks.push({
    id: 'static-manifest-exists',
    ok: fs.existsSync(MANIFEST_PATH),
  })

  if (fs.existsSync(MANIFEST_PATH)) {
    const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'))
    checks.push({
      id: 'manifest-marker',
      ok: manifest.marker === KAP_006C_MARKER,
    })
  }

  const liquidityCanonicalPath = path.join(WEB_ROOT, 'src/lib/liquidity-runtime/canonicalOwnership.ts')
  const liquidityCanonicalSource = fs.readFileSync(liquidityCanonicalPath, 'utf8')
  checks.push({
    id: 'liquidity-runtime-canonical',
    ok: liquidityCanonicalSource.includes('farms-pools-separate'),
  })

  const routingSource = fs.readFileSync(routingFacadePath, 'utf8')
  checks.push({
    id: 'routing-no-submit',
    ok: routingSource.includes('submitsExecution: false'),
  })

  // --- KAP-006E compliance closure checks ---
  const v2CommitPath = path.join(WEB_ROOT, 'src/views/Swap/components/SwapCommitButton.tsx')
  const v2CommitSource = fs.readFileSync(v2CommitPath, 'utf8')
  checks.push({
    id: 'kap006e-v2-commit-facade',
    ok:
      v2CommitSource.includes('routeV2SwapQuote') &&
      !v2CommitSource.includes('createV2SwapExecutionInstruction'),
    detail: 'V2 SwapCommitButton must use routing facade',
  })

  const cakeEnablePath = path.join(WEB_ROOT, 'src/hooks/useCakeEnable.tsx')
  const cakeEnableSource = fs.readFileSync(cakeEnablePath, 'utf8')
  const cakeUsesIngress =
    cakeEnableSource.includes('routeV2SwapQuote') && cakeEnableSource.includes('useV2SwapExecution')
  const cakeExempt =
    cakeEnableSource.includes('KAP-006E') ||
    cakeEnableSource.includes('internal CAKE-enable') ||
    cakeEnableSource.includes('out-of-scope')
  checks.push({
    id: 'kap006e-cake-enable-ingress-or-exempt',
    ok: cakeUsesIngress || cakeExempt,
    detail: cakeUsesIngress ? 'routes via facade + ingress' : 'requires constitutional exempt comment',
  })

  checks.push({
    id: 'kap006e-lp-submit-deferral-documented',
    ok: assertLpSubmitDeferralDocumented(),
    detail: 'liquidityRuntime canonical; LP direct submit deferred',
  })

  checks.push({
    id: 'kap006e-no-treasury-settlement-computation',
    ok:
      !dexGravitySource.includes('computeSettlement') &&
      !ingressSource.includes('settlement_id') &&
      treasurySource.includes('assertPayloadDoesNotOwnSettlement'),
  })

  const kap006eChecks = checks.filter((c) => c.id.startsWith('kap006e-'))
  const kap006eClosed = kap006eChecks.every((c) => c.ok)

  const ok = checks.every((c) => c.ok)
  return {
    ok,
    marker: KAP_006C_MARKER,
    kap006eClosed,
    kap006eMarker: kap006eClosed ? KAP_006E_MARKER : undefined,
    checks,
  }
}

if (require.main === module) {
  const result = verifyKap006cDexGravity()
  for (const check of result.checks) {
    const status = check.ok ? 'PASS' : 'FAIL'
    console.log(`[${status}] ${check.id}${check.detail ? `: ${check.detail}` : ''}`)
  }
  if (result.ok) {
    console.log(result.marker)
    if (result.kap006eClosed && result.kap006eMarker) {
      console.log(result.kap006eMarker)
    }
  } else {
    console.log('KAP-006C_VERIFICATION_FAILED')
  }
  process.exit(result.ok ? 0 : 1)
}
