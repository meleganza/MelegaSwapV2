import { keccak256 } from '@ethersproject/keccak256'
import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { PROTOCOL_FEE_STATE } from '../fee'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { DETERMINISTIC_BYTECODE, m5ArtifactMayBeReusedForM6 } from '../executorDeterministicArtifact'
import {
  FRESH_FOUNDER_REAUTHORIZATION,
  M6_REAUTHORIZED_ACTIVE_VERDICT,
  M6_REAUTHORIZED_BROADCAST,
  M6_REAUTHORIZED_FEE_STATE,
  M6_REAUTHORIZED_VERDICT,
  M6_UNSIGNED_CREATE,
  PRIOR_M6_AUTHORIZATION,
  REQUIRED_REAUTHORIZATION_SCOPE,
  freshFounderReauthorizationPresent,
  m6ReauthorizedLegacyProduction,
} from '../m6ReauthorizedCanary'
import { isProductionCutoverAllowed } from '../operatingMode'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')
const CERT = path.join(
  WEB,
  'docs/runtime/smartswap-universal-engine-m6-deterministic-mainnet-canary/m6-mainnet-certification.json',
)

describe('SmartSwap M6 deterministic canary reauthorization gate', () => {
  it('accepts the fresh Founder grant for this artifact and does not broadcast without the canonical signer', () => {
    expect(PRIOR_M6_AUTHORIZATION.reusable).toBe(false)
    expect(m5ArtifactMayBeReusedForM6()).toBe(false)
    expect(
      freshFounderReauthorizationPresent({
        explicitAuthorize: false,
        namesCreationKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
        namesDeployedKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
      }),
    ).toBe(false)
    expect(
      freshFounderReauthorizationPresent({
        explicitAuthorize: FRESH_FOUNDER_REAUTHORIZATION.explicitAuthorize,
        namesCreationKeccak: FRESH_FOUNDER_REAUTHORIZATION.namesCreationKeccak,
        namesDeployedKeccak: FRESH_FOUNDER_REAUTHORIZATION.namesDeployedKeccak,
      }),
    ).toBe(true)
    expect(M6_REAUTHORIZED_ACTIVE_VERDICT).toBe(M6_REAUTHORIZED_VERDICT.UNSIGNED_DEPLOYMENT_PACKAGE_READY)
    expect(M6_REAUTHORIZED_BROADCAST.deploy).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.swap).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.signMainnet).toBe(false)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.creationKeccak).toBe(DETERMINISTIC_BYTECODE.creationKeccak)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.deployedKeccak).toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.deployer).toBe('0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0')
    expect(M6_REAUTHORIZED_FEE_STATE.after).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(m6ReauthorizedLegacyProduction()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('freezes the unsigned CREATE package for founder signing at nonce 3194', () => {
    const pkgPath = path.join(REPO, M6_UNSIGNED_CREATE.package)
    const dataPath = path.join(REPO, M6_UNSIGNED_CREATE.dataFile)
    expect(existsSync(pkgPath)).toBe(true)
    expect(existsSync(dataPath)).toBe(true)
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      signed: boolean
      broadcast: boolean
      nonce: number
      from: string
      dataKeccak: string
      creationBytecodeKeccak: string
      expectedCreateAddressIfNonce3194: string
      expectedOnChainRuntimeKeccak: string
      runtimeTemplateKeccak: string
    }
    expect(pkg.signed).toBe(false)
    expect(pkg.broadcast).toBe(false)
    expect(pkg.nonce).toBe(M6_UNSIGNED_CREATE.nonce)
    expect(pkg.from).toBe(REQUIRED_REAUTHORIZATION_SCOPE.deployer)
    expect(pkg.dataKeccak).toBe(M6_UNSIGNED_CREATE.dataKeccak)
    expect(pkg.creationBytecodeKeccak).toBe(DETERMINISTIC_BYTECODE.creationKeccak)
    expect(pkg.expectedCreateAddressIfNonce3194).toBe(M6_UNSIGNED_CREATE.expectedAddressIfNonce3194)
    expect(pkg.expectedOnChainRuntimeKeccak).toBe(M6_UNSIGNED_CREATE.expectedOnChainRuntimeKeccak)
    expect(pkg.runtimeTemplateKeccak).toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    expect(pkg.expectedOnChainRuntimeKeccak).not.toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    const dataHex = readFileSync(dataPath, 'utf8').trim()
    expect(keccak256(dataHex).toLowerCase()).toBe(M6_UNSIGNED_CREATE.dataKeccak)
    const cert = JSON.parse(readFileSync(CERT, 'utf8')) as { verdict: string; broadcast: boolean }
    expect(cert.verdict).toBe(M6_REAUTHORIZED_VERDICT.UNSIGNED_DEPLOYMENT_PACKAGE_READY)
    expect(cert.broadcast).toBe(false)
  })

  it('keeps frozen SmartSwap UX at SHA-256 zero diff', () => {
    const manifest = JSON.parse(readFileSync(FREEZE_MANIFEST, 'utf8')) as { files: Record<string, string> }
    const current: Record<string, string> = {}
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
      current[rel] = createHash('sha256').update(readFileSync(abs)).digest('hex')
    }
    expect(current).toEqual(manifest.files)
  })
})
