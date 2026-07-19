/**
 * LB013-B — deployment input Treasury binding validator tests.
 * Loads validate-lb-v1-inputs.mjs via file URL (no network).
 */
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import path from 'path'

const validatorPath = path.resolve(
  __dirname,
  '../../../../../../deployments/liquidity-building/validate-lb-v1-inputs-core.mjs',
)

async function loadValidator(): Promise<{
  validateDeploymentInputs: (doc: object, opts?: object) => { result: string; reasons: string[] }
}> {
  const href = `file://${validatorPath}`
  return import(/* @vite-ignore */ href)
}

function baseDoc(over: Record<string, unknown> = {}) {
  const prod = JSON.parse(
    readFileSync(
      path.resolve(
        __dirname,
        '../../../../../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
      ),
      'utf8',
    ),
  )
  const overTreasury = (over.treasury as Record<string, unknown>) || {}
  const overAuth = (over.productionAuthority as Record<string, unknown>) || {}
  const overAuthorizer = (over.authorizer as Record<string, unknown>) || {}
  const overIngestion = (over.runtimeIngestion as Record<string, unknown>) || {}
  const overSig = (over.signatureNormalization as Record<string, unknown>) || {}

  return {
    ...prod,
    ...over,
    productionAuthority: {
      address: '0x1111111111111111111111111111111111111111',
      authorityType: 'EOA',
      providerClass: 'AWS_KMS',
      publicKeyFingerprint: 'kms-fingerprint-not-for-production-use',
      nonExportable: true,
      verdict: 'AUTONOMOUS_AUTHORITY_PRODUCTION_READY',
      ...overAuth,
    },
    authorizer: {
      address: '0x2222222222222222222222222222222222222222',
      schemaVersion: 'LIQUIDITY_BUILDING_EXECUTION_INTENT_V1',
      status: 'DEPLOYED',
      ...overAuthorizer,
    },
    treasury: {
      feeSinkAddress: '0x3333333333333333333333333333333333333333',
      receiverAddress: '0x4444444444444444444444444444444444444444',
      receiverBytecodeBytes: 1200,
      feeSinkBoundReceiver: '0x4444444444444444444444444444444444444444',
      receiverVerdict: 'PRODUCTION_BINDING_IDENTIFIED',
      ...overTreasury,
    },
    quotePolicies:
      over.quotePolicies ||
      [
        {
          symbol: 'WBNB',
          address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
          decimals: 18,
          enabled: true,
          minimumGrossQuoteFloor: '41052631578947370',
          minimumQuoteReserve: '10263157894736842500',
          gasConversionMode: 'NativeEquivalent',
          ratificationStatus: 'RATIFIED',
        },
      ],
    unresolvedBlockers: over.unresolvedBlockers ?? [],
    deploymentReadinessState: over.deploymentReadinessState ?? 'VALID',
    runtimeIngestion: {
      status: 'OPERATIONAL',
      ...overIngestion,
    },
    signatureNormalization: {
      status: 'VERIFIED',
      ...overSig,
    },
    activationAuthorized: over.activationAuthorized ?? false,
  }
}

describe('LB013-B deployment input Treasury binding', () => {
  it('valid production-shaped input returns DEPLOYMENT_INPUTS_VALID', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const out = validateDeploymentInputs(baseDoc())
    expect(out.result).toBe('DEPLOYMENT_INPUTS_VALID')
    expect(out.reasons).toEqual([])
  })

  it('missing Treasury receiver blocked', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const out = validateDeploymentInputs(
      baseDoc({
        treasury: {
          feeSinkAddress: '0x3333333333333333333333333333333333333333',
          receiverAddress: null,
          receiverVerdict: 'PRODUCTION_BINDING_NOT_FOUND',
        },
      }),
    )
    expect(out.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(out.reasons.some((r) => r.includes('receiverAddress missing'))).toBe(true)
  })

  it('EOA receiver blocked (zero bytecode)', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const out = validateDeploymentInputs(
      baseDoc({
        treasury: {
          feeSinkAddress: '0x3333333333333333333333333333333333333333',
          receiverAddress: '0xb5a8707FfA045E0FC7db6eFC63161e853C80139a',
          receiverBytecodeBytes: 0,
          receiverVerdict: 'PRODUCTION_BINDING_IDENTIFIED',
          feeSinkBoundReceiver: '0xb5a8707FfA045E0FC7db6eFC63161e853C80139a',
        },
      }),
    )
    expect(out.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(out.reasons.some((r) => /EOA|forbidden|no bytecode/i.test(r))).toBe(true)
  })

  it('invalid Sink / receiver mismatch blocked', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const out = validateDeploymentInputs(
      baseDoc({
        treasury: {
          feeSinkAddress: '0x3333333333333333333333333333333333333333',
          receiverAddress: '0x4444444444444444444444444444444444444444',
          receiverBytecodeBytes: 1200,
          feeSinkBoundReceiver: '0x5555555555555555555555555555555555555555',
          receiverVerdict: 'PRODUCTION_BINDING_IDENTIFIED',
        },
      }),
    )
    expect(out.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(out.reasons.some((r) => r.includes('Fee Sink bound receiver'))).toBe(true)
  })

  it('wrong Factory binding blocked', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const out = validateDeploymentInputs(
      baseDoc({
        liquidityBuildingFactory: {
          melegaFactory: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
          melegaRouter: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
        },
      }),
    )
    expect(out.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(out.reasons.some((r) => r.includes('melegaFactory binding mismatch'))).toBe(true)
  })

  it('production inputs file remains blocked; activation false', async () => {
    const { validateDeploymentInputs } = await loadValidator()
    const prod = JSON.parse(
      readFileSync(
        path.resolve(
          __dirname,
          '../../../../../../deployments/liquidity-building/chain-56/LiquidityBuildingV1.inputs.json',
        ),
        'utf8',
      ),
    )
    const out = validateDeploymentInputs(prod)
    expect(out.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')
    expect(prod.activationAuthorized).toBe(false)
    expect(prod.treasury.receiverAddress).toBeNull()
    expect(prod.treasury.lb013bBindingAttempt.lbReceiverPublished).toBe(false)

    const gates = JSON.parse(
      readFileSync(
        path.resolve(
          __dirname,
          '../../../../../../deployments/liquidity-building/chain-56/activation-gate-final.v1.json',
        ),
        'utf8',
      ),
    )
    expect(gates.activationAuthorized).toBe(false)
    expect(gates.manualOverrideForbidden).toBe(true)
    expect(gates.mission).toBe('LB013-B')
  })
})
