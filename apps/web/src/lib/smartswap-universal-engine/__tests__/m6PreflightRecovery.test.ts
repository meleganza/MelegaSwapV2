import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { M5_CERTIFIED_BYTECODE } from '../m6Preflight'
import {
  EXECUTOR_SOURCE_GIT_BLOB,
  EXECUTOR_SOURCE_SHA256,
  M5_CERTIFIED_CREATION_KECCAK,
  M5_CERTIFIED_DEPLOYED_KECCAK,
  M6_RECOVERY_ACTIVE_VERDICT,
  M6_RECOVERY_VERDICT,
  RECOVERY_BROADCAST,
  RECOVERY_MEASURED_HASHES,
  m5BytecodeReproduced,
} from '../m6PreflightRecovery'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { isProductionCutoverAllowed } from '../operatingMode'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')
const EXECUTOR = path.join(REPO, 'contracts/smartswap/SmartSwapExecutorV1.sol')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

describe('SmartSwap M6 preflight recovery', () => {
  it('matches M5 source byte-for-byte and does not reproduce M5 bytecode hashes', () => {
    expect(existsSync(EXECUTOR)).toBe(true)
    expect(createHash('sha256').update(readFileSync(EXECUTOR)).digest('hex')).toBe(EXECUTOR_SOURCE_SHA256)
    expect(EXECUTOR_SOURCE_GIT_BLOB).toBe('7869980ca19ce62bebc99e17670c99cc7e637172')
    expect(M5_CERTIFIED_CREATION_KECCAK).toBe(M5_CERTIFIED_BYTECODE.creationKeccak)
    expect(M5_CERTIFIED_DEPLOYED_KECCAK).toBe(M5_CERTIFIED_BYTECODE.deployedKeccak)
    expect(
      m5BytecodeReproduced(
        RECOVERY_MEASURED_HASHES.m6BlockedSession.creationKeccak,
        RECOVERY_MEASURED_HASHES.m6BlockedSession.deployedKeccak,
      ),
    ).toBe(false)
    expect(
      m5BytecodeReproduced(
        RECOVERY_MEASURED_HASHES.isolatedSkipTestScript.creationKeccak,
        RECOVERY_MEASURED_HASHES.isolatedSkipTestScript.deployedKeccak,
      ),
    ).toBe(false)
    expect(RECOVERY_MEASURED_HASHES.m6BlockedSession.creationKeccak).not.toBe(
      RECOVERY_MEASURED_HASHES.isolatedSkipTestScript.creationKeccak,
    )
    expect(M6_RECOVERY_ACTIVE_VERDICT).toBe(M6_RECOVERY_VERDICT.BLOCKED_BYTECODE_REPRODUCTION)
    expect(RECOVERY_BROADCAST.deploy).toBe(false)
    expect(RECOVERY_BROADCAST.swap).toBe(false)
    expect(RECOVERY_BROADCAST.wrap).toBe(false)
  })

  it('keeps production isolated and frozen UX', () => {
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
    expect(CANONICAL_SMARTSWAP_FEE_BENEFICIARY).toBe('0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b')
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
