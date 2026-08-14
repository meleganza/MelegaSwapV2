import { readFileSync, existsSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import {
  LB_DEPLOYED_ADDRESSES,
  ZERO_ADDRESS,
  isDeployedAddress,
  resolveProductionBinding,
} from '../addresses'
import { canSubmitMutatingAction, BLOCKED_ACTIVATION_GATES } from '../programStatus'

const ROOT = path.resolve(__dirname, '../../../../../../../')
const CHAIN56 = path.join(ROOT, 'deployments/liquidity-building/chain-56')
const VALIDATOR = path.join(ROOT, 'deployments/liquidity-building/validate-lb-v1-inputs-core.mjs')

describe('LB018 contract deployment binding', () => {
  it('frontend binding is mainnet-bound — no placeholders / null core addresses', () => {
    expect(LB_DEPLOYED_ADDRESSES.lbFactory).toBe('0xB9f3e3020141157C215902acC1fDF65e49bE4e82')
    expect(LB_DEPLOYED_ADDRESSES.lbAuthorizer).toBe('0xA0c48D603BD07A012666b003Bd8089aA3dD49471')
    expect(LB_DEPLOYED_ADDRESSES.lbFeeSink).toBe('0xF984e1b1e9C35BF6E0cA801cd9dcea59faaA10AF')
    expect(LB_DEPLOYED_ADDRESSES.programAddress).toBeNull()
    expect(isDeployedAddress(ZERO_ADDRESS)).toBe(false)
  })

  it('resolveProductionBinding rejects blocked / incomplete candidates', () => {
    expect(
      resolveProductionBinding({
        chainId: 56,
        deploymentReadinessState: 'BLOCKED',
        activationAuthorized: false,
        lbFactory: null,
        lbAuthorizer: null,
        lbFeeSink: null,
      }).ok,
    ).toBe(false)

    expect(
      resolveProductionBinding({
        chainId: 56,
        deploymentReadinessState: 'VALID',
        activationAuthorized: true,
        lbFactory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
        lbAuthorizer: null,
        lbFeeSink: '0x1111111111111111111111111111111111111111',
      }).reason,
    ).toBe('LB_AUTHORIZER_MISSING')

    expect(
      resolveProductionBinding({
        chainId: 1,
        deploymentReadinessState: 'DEPLOYED',
        activationAuthorized: true,
        lbFactory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
        lbAuthorizer: '0x2222222222222222222222222222222222222222',
        lbFeeSink: '0x3333333333333333333333333333333333333333',
      }).reason,
    ).toBe('WRONG_CHAIN')
  })

  it('resolveProductionBinding accepts only full verified chain-56 set', () => {
    const ok = resolveProductionBinding({
      chainId: 56,
      deploymentReadinessState: 'DEPLOYED',
      activationAuthorized: true,
      lbFactory: '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C',
      lbAuthorizer: '0x2222222222222222222222222222222222222222',
      lbFeeSink: '0x3333333333333333333333333333333333333333',
      programAddress: null,
    })
    expect(ok.ok).toBe(true)
    if (ok.ok) {
      expect(ok.addresses.lbFactory).toBeTruthy()
      expect(ok.addresses.programAddress).toBeNull()
    }
  })

  it('contracts DEPLOYED; activation gates remain fail-closed (no mutating bypass)', async () => {
    const inputs = JSON.parse(readFileSync(path.join(CHAIN56, 'LiquidityBuildingV1.inputs.json'), 'utf8'))
    expect(inputs.deploymentReadinessState).toBe('DEPLOYED')
    expect(inputs.activationAuthorized).toBe(false)
    expect(inputs.factory?.address).toBe('0xB9f3e3020141157C215902acC1fDF65e49bE4e82')
    expect(inputs.authorizer?.address).toBe('0xA0c48D603BD07A012666b003Bd8089aA3dD49471')
    expect(inputs.treasury?.receiverAddress).toBe('0x5f3b45ab1b4d149761f3749a3d7954a37a6a1ff5')
    expect(inputs.quotePolicies).toEqual([])

    const { validateDeploymentInputs } = await import(/* @vite-ignore */ `file://${VALIDATOR}`)
    const result = validateDeploymentInputs(inputs)
    expect(result.result).toBe('DEPLOYMENT_INPUTS_BLOCKED')

    expect(
      canSubmitMutatingAction({
        walletConnected: true,
        correctChain: true,
        gates: BLOCKED_ACTIVATION_GATES,
      }).ok,
    ).toBe(false)
  })

  it('LB018 artifact documents exact blocker posture', () => {
    const artifactPath = path.join(CHAIN56, 'lb018-deployment-binding.v1.json')
    expect(existsSync(artifactPath)).toBe(true)
    const doc = JSON.parse(readFileSync(artifactPath, 'utf8'))
    expect(doc.verdict).toBe('LB018_IMPLEMENTED_WITH_BLOCKERS')
    expect(doc.mainnetDeployExecuted).toBe(false)
    expect(doc.manualOverrideForbidden).toBe(true)
    expect(doc.contracts.LiquidityBuildingFactoryV1.address).toBeNull()
    expect(doc.frontendBinding.LB_DEPLOYED_ADDRESSES.lbFactory).toBeNull()
  })

  it('readiness and binding docs exist', () => {
    expect(existsSync(path.join(ROOT, 'docs/LB018_CONTRACT_DEPLOYMENT_READINESS.md'))).toBe(true)
    expect(existsSync(path.join(ROOT, 'docs/LB018_CONTRACT_DEPLOYMENT_BINDING.md'))).toBe(true)
  })
})
