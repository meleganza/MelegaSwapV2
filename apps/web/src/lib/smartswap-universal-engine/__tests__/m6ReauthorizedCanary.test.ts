import { createHash } from 'crypto'
import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from '../feeEnforcement'
import { PROTOCOL_FEE_STATE } from '../fee'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { DETERMINISTIC_BYTECODE, m5ArtifactMayBeReusedForM6 } from '../executorDeterministicArtifact'
import {
  M6_REAUTHORIZED_ACTIVE_VERDICT,
  M6_REAUTHORIZED_BROADCAST,
  M6_REAUTHORIZED_FEE_STATE,
  M6_REAUTHORIZED_VERDICT,
  PRIOR_M6_AUTHORIZATION,
  REQUIRED_REAUTHORIZATION_SCOPE,
  freshFounderReauthorizationPresent,
  m6ReauthorizedLegacyProduction,
} from '../m6ReauthorizedCanary'
import { isProductionCutoverAllowed } from '../operatingMode'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const FREEZE_MANIFEST = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m1/ux-freeze.manifest.json')

describe('SmartSwap M6 deterministic canary reauthorization gate', () => {
  it('does not reuse the prior M6 grant and awaits a fresh explicit Founder grant', () => {
    expect(PRIOR_M6_AUTHORIZATION.reusable).toBe(false)
    expect(m5ArtifactMayBeReusedForM6()).toBe(false)
    expect(
      freshFounderReauthorizationPresent({
        explicitAuthorize: false,
        namesCreationKeccak: DETERMINISTIC_BYTECODE.creationKeccak,
        namesDeployedKeccak: DETERMINISTIC_BYTECODE.deployedKeccak,
      }),
    ).toBe(false)
    expect(M6_REAUTHORIZED_ACTIVE_VERDICT).toBe(M6_REAUTHORIZED_VERDICT.AWAITING_FOUNDER_REAUTHORIZATION)
    expect(M6_REAUTHORIZED_BROADCAST.deploy).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.swap).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.signMainnet).toBe(false)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.creationKeccak).toBe(DETERMINISTIC_BYTECODE.creationKeccak)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.deployedKeccak).toBe(DETERMINISTIC_BYTECODE.deployedKeccak)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(M6_REAUTHORIZED_FEE_STATE.after).toBe(PROTOCOL_FEE_STATE.FEE_ENFORCEABLE)
    expect(m6ReauthorizedLegacyProduction()).toBe(true)
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
