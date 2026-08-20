import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { computeStructuralRouteCost } from '../costTaxonomy'
import { authorizedSmartSwapFeeBps } from '../executionIntent'
import {
  DETERMINISTIC_ARTIFACT_PATHS,
  DETERMINISTIC_BYTECODE,
  DETERMINISTIC_COMPILER_LOCK,
  EXECUTOR_RECERTIFICATION_BROADCAST,
  EXECUTOR_SOURCE_GIT_BLOB,
  EXECUTOR_SOURCE_SHA256,
  M5_BYTECODE_ARTIFACT_STATUS,
  M5_SUPERSEDED_BYTECODE,
  SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS,
  m5ArtifactMayBeReusedForM6,
} from '../executorDeterministicArtifact'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { PROTOCOL_FEE_STATE } from '../fee'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { M5_CERTIFIED_BYTECODE } from '../m6Preflight'
import {
  SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_RECERTIFICATION_ID,
  isProductionCutoverAllowed,
} from '../operatingMode'
import { SMARTSWAP_REVENUE_POLICY_V1 } from '../revenuePolicy'
import { PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { evaluateRevenuePolicy } from '../evaluateRevenuePolicy'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const EXECUTOR = path.join(REPO, 'contracts/smartswap/SmartSwapExecutorV1.sol')
const FOUNDRY = path.join(REPO, 'foundry.toml')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

function readRepo(rel: string) {
  return readFileSync(path.join(REPO, rel))
}

describe('SmartSwapExecutorV1 deterministic artifact recertification', () => {
  it('locks source, compiler input, and stored bytecode', () => {
    expect(existsSync(EXECUTOR)).toBe(true)
    expect(createHash('sha256').update(readFileSync(EXECUTOR)).digest('hex')).toBe(EXECUTOR_SOURCE_SHA256)
    expect(EXECUTOR_SOURCE_GIT_BLOB).toBe('7869980ca19ce62bebc99e17670c99cc7e637172')
    const input = readRepo(DETERMINISTIC_ARTIFACT_PATHS.compilerInput)
    expect(createHash('sha256').update(input).digest('hex')).toBe(DETERMINISTIC_COMPILER_LOCK.compilerInputSha256)
    const artifact = JSON.parse(readRepo(DETERMINISTIC_ARTIFACT_PATHS.artifact).toString('utf8')) as {
      status: string
      sourceGitBlob: string
      sourceSha256: string
      compilerInputSha256: string
      creationBytecodeKeccak: string
      deployedBytecodeKeccak: string
      creationBytecodeLength: number
      deployedBytecodeLength: number
      abiSha256: string
      metadataMode: { bytecodeHash: string; appendCBOR: boolean }
      optimizerRuns: number
      viaIR: boolean
      evmVersion: string
      solcVersion: string
      solcCommit: string
      compilerProfile: string
      broadcast: boolean
      deployed: boolean
      feeState: string
      m5Artifact: { status: string }
      creationBytecode: string
      deployedBytecode: string
    }
    expect(artifact.status).toBe(SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS)
    expect(artifact.sourceGitBlob).toBe(EXECUTOR_SOURCE_GIT_BLOB)
    expect(artifact.sourceSha256).toBe(EXECUTOR_SOURCE_SHA256)
    expect(artifact.compilerInputSha256).toBe(DETERMINISTIC_COMPILER_LOCK.compilerInputSha256)
    expect(artifact.creationBytecodeKeccak).toBe(DETERMINISTIC_BYTECODE.creationKeccak)
    expect(artifact.deployedBytecodeKeccak).toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    expect(artifact.creationBytecodeLength).toBe(DETERMINISTIC_BYTECODE.creationLength)
    expect(artifact.deployedBytecodeLength).toBe(DETERMINISTIC_BYTECODE.deployedLength)
    expect(artifact.abiSha256).toBe(DETERMINISTIC_BYTECODE.abiSha256)
    expect(artifact.metadataMode.bytecodeHash).toBe('none')
    expect(artifact.metadataMode.appendCBOR).toBe(false)
    expect(artifact.optimizerRuns).toBe(200)
    expect(artifact.viaIR).toBe(true)
    expect(artifact.evmVersion).toBe('shanghai')
    expect(artifact.solcVersion).toBe('0.8.20')
    expect(artifact.solcCommit).toBe('a1b79de6')
    expect(artifact.compilerProfile).toBe('smartswap_executor_release')
    expect(artifact.broadcast).toBe(false)
    expect(artifact.deployed).toBe(false)
    expect(artifact.feeState).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(artifact.m5Artifact.status).toBe(M5_BYTECODE_ARTIFACT_STATUS)
    expect(artifact.creationBytecodeKeccak).not.toBe(M5_SUPERSEDED_BYTECODE.creationKeccak)
    expect(artifact.deployedBytecodeKeccak).not.toBe(M5_SUPERSEDED_BYTECODE.deployedKeccak)
    expect(M5_CERTIFIED_BYTECODE.creationKeccak).toBe(M5_SUPERSEDED_BYTECODE.creationKeccak)
    expect(createHash('sha256').update(readRepo(DETERMINISTIC_ARTIFACT_PATHS.mainnetArtifact)).digest('hex')).toBe(
      createHash('sha256').update(readRepo(DETERMINISTIC_ARTIFACT_PATHS.artifact)).digest('hex'),
    )
  })

  it('fails closed if Foundry release profile or executor source lock drifts', () => {
    const toml = readFileSync(FOUNDRY, 'utf8')
    expect(toml).toContain('[profile.smartswap_executor_release]')
    expect(toml).toContain('bytecode_hash = "none"')
    expect(toml).toContain('cbor_metadata = false')
    expect(toml).toContain('solc_version = "0.8.20"')
    expect(toml).toContain('via_ir = true')
    expect(toml).toContain('optimizer_runs = 200')
    expect(toml).toContain('evm_version = "shanghai"')
    expect(toml).toContain('src = "contracts/smartswap"')
    const defaultSection = toml.split('[profile.smartswap_executor_release]')[0]
    expect(defaultSection).not.toContain('bytecode_hash = "none"')
    const compilerInput = JSON.parse(readRepo(DETERMINISTIC_ARTIFACT_PATHS.compilerInput).toString('utf8')) as {
      settings: { metadata: { bytecodeHash: string; appendCBOR: boolean }; evmVersion: string; viaIR: boolean }
    }
    expect(compilerInput.settings.metadata.bytecodeHash).toBe('none')
    expect(compilerInput.settings.metadata.appendCBOR).toBe(false)
    expect(compilerInput.settings.evmVersion).toBe('shanghai')
    expect(compilerInput.settings.viaIR).toBe(true)
  })

  it('derives the current canary fee from policy instead of hardcoding 20 bps', () => {
    const structural = computeStructuralRouteCost({
      venueFeesBps: PANCAKE_SWAP_VENUE.v2LpFeeBps,
      bridgeCostsBps: 0,
      gasCostBps: null,
      venueFeesEmbeddedInGross: true,
      bridgeCostsEmbeddedInGross: false,
    })
    expect(structural.structuralRouteCostBps).toBe(25)
    expect(authorizedSmartSwapFeeBps(structural.structuralRouteCostBps!)).toBe(20)
    const assessment = evaluateRevenuePolicy({
      structuralRouteCostBps: structural.structuralRouteCostBps,
      swapValueNormalized: 1,
      inputAmountRaw: '10000000000000000',
      feeEnforcementState: PROTOCOL_FEE_STATE.FEE_ENFORCEABLE,
      policy: SMARTSWAP_REVENUE_POLICY_V1,
    })
    expect(assessment.feeBps).toBe(20)
    expect(assessment.feeBand).toBe('BAND_11_25')
    expect(CANONICAL_SMARTSWAP_FEE_BENEFICIARY).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
  })

  it('does not reuse the M5 bytecode artifact and does not authorize M6', () => {
    expect(m5ArtifactMayBeReusedForM6()).toBe(false)
    expect(EXECUTOR_RECERTIFICATION_BROADCAST.deploy).toBe(false)
    expect(EXECUTOR_RECERTIFICATION_BROADCAST.swap).toBe(false)
    expect(EXECUTOR_RECERTIFICATION_BROADCAST.signMainnet).toBe(false)
    expect(SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_RECERTIFICATION_ID).toBe(
      'SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_RECERTIFICATION',
    )
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
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
