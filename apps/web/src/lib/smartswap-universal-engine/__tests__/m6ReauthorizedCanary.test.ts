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
  M6_MINED_APPROVAL,
  M6_MINED_CANARY,
  M6_REAUTHORIZED_ACTIVE_VERDICT,
  M6_REAUTHORIZED_BROADCAST,
  M6_REAUTHORIZED_FEE_STATE,
  M6_REAUTHORIZED_VERDICT,
  M6_UNSIGNED_CREATE,
  M6_UNSIGNED_SET_ROUTER,
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

describe('SmartSwap M6 deterministic canary post-CREATE gate', () => {
  it('records the mined M6 sequence as CERTIFIED without enabling agent broadcast', () => {
    expect(PRIOR_M6_AUTHORIZATION.reusable).toBe(false)
    expect(m5ArtifactMayBeReusedForM6()).toBe(false)
    expect(
      freshFounderReauthorizationPresent({
        explicitAuthorize: FRESH_FOUNDER_REAUTHORIZATION.explicitAuthorize,
        namesCreationKeccak: FRESH_FOUNDER_REAUTHORIZATION.namesCreationKeccak,
        namesDeployedKeccak: FRESH_FOUNDER_REAUTHORIZATION.namesDeployedKeccak,
      }),
    ).toBe(true)
    expect(M6_REAUTHORIZED_ACTIVE_VERDICT).toBe(M6_REAUTHORIZED_VERDICT.CERTIFIED)
    expect(M6_REAUTHORIZED_BROADCAST.setRouter).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.approval).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.swap).toBe(false)
    expect(M6_REAUTHORIZED_BROADCAST.signMainnet).toBe(false)
    expect(REQUIRED_REAUTHORIZATION_SCOPE.treasury).toBe(CANONICAL_SMARTSWAP_FEE_BENEFICIARY)
    expect(M6_REAUTHORIZED_FEE_STATE.after).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(M6_UNSIGNED_SET_ROUTER.minedTx).toBe(
      '0xbc9b4f30c7aca55679a6002d2c4ac3b56a969d498cd0e97ab37dc917e4fcdbbc',
    )
    expect(M6_MINED_APPROVAL.tx).toBe('0x25b28862e960a0e1606c97279c797ba34af0c4cd7301cf677b319b0a763f41e1')
    expect(M6_MINED_CANARY.tx).toBe('0x5c0ded0d0381529d8c4d6edcde2e34f0360d4f8b1a60969e92ab7ae09fb9a4fd')
    expect(M6_MINED_CANARY.feeAmountWbnb).toBe('20000000000000')
    expect(M6_MINED_CANARY.venueInputWbnb).toBe('9980000000000000')
    expect(M6_MINED_CANARY.userOutUsdt).toBe('6946714420281522671')
    expect(m6ReauthorizedLegacyProduction()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('locks the mined CREATE evidence and the unsigned setRouter package at the current live nonce', () => {
    const createPath = path.join(REPO, M6_UNSIGNED_CREATE.package)
    const setPath = path.join(REPO, M6_UNSIGNED_SET_ROUTER.package)
    const dataPath = path.join(REPO, M6_UNSIGNED_CREATE.dataFile)
    expect(existsSync(createPath)).toBe(true)
    expect(existsSync(setPath)).toBe(true)
    expect(existsSync(dataPath)).toBe(true)
    const created = JSON.parse(readFileSync(createPath, 'utf8')) as {
      signed: boolean
      broadcast: boolean
      mined: boolean
      deploymentTx: string
      actualExecutorAddress: string
      runtimeByteForByte: boolean
      onChainRuntimeKeccak: string
    }
    expect(created.signed).toBe(true)
    expect(created.broadcast).toBe(true)
    expect(created.mined).toBe(true)
    expect(created.deploymentTx).toBe(M6_UNSIGNED_CREATE.minedTx)
    expect(created.actualExecutorAddress).toBe(M6_UNSIGNED_CREATE.actualAddress)
    expect(created.runtimeByteForByte).toBe(true)
    expect(created.onChainRuntimeKeccak).toBe(M6_UNSIGNED_CREATE.expectedOnChainRuntimeKeccak)
    const dataHex = readFileSync(dataPath, 'utf8').trim()
    expect(keccak256(dataHex).toLowerCase()).toBe(M6_UNSIGNED_CREATE.dataKeccak)
    const setRouter = JSON.parse(readFileSync(setPath, 'utf8')) as {
      signed: boolean
      broadcast: boolean
      nonce: number
      from: string
      to: string
      value: string
      chainId: number
      data: string
      args: { router: string; allowed: boolean }
    }
    expect(setRouter.signed).toBe(false)
    expect(setRouter.broadcast).toBe(false)
    expect(setRouter.nonce).toBe(M6_UNSIGNED_SET_ROUTER.nonce)
    expect(setRouter.from).toBe(REQUIRED_REAUTHORIZATION_SCOPE.deployer)
    expect(setRouter.to).toBe(M6_UNSIGNED_SET_ROUTER.to)
    expect(setRouter.value).toBe('0')
    expect(setRouter.chainId).toBe(56)
    expect(setRouter.data).toBe(
      '0x1bdbc79b00000000000000000000000010ed43c718714eb63d5aa57b78b54704e256024ed7e0d5c07ddc27357df5c45737f3b7506ed8b6a6631c211732cdda1dfcf56ba30000000000000000000000000000000000000000000000000000000000000001',
    )
    expect(setRouter.args.router).toBe(M6_UNSIGNED_SET_ROUTER.router)
    expect(setRouter.args.allowed).toBe(true)
    const cert = JSON.parse(readFileSync(CERT, 'utf8')) as {
      verdict: string
      classification: string
      feeStateAfter: string
      setRouterBroadcast: boolean
      approvalTx: string | null
      canaryTx: string | null
      actualFee: string
      venueInput: string
      userOutput: string
      ACTIVE_V2_ROLLOUT: string
      UNAUTHORIZED_UI_CHANGE: number
    }
    expect(cert.verdict).toBe(M6_REAUTHORIZED_VERDICT.CERTIFIED)
    expect(cert.classification).toBe('M6_BNB_MAINNET_CANARY_CERTIFIED')
    expect(cert.feeStateAfter).toBe(PROTOCOL_FEE_STATE.FEE_VERIFIED)
    expect(cert.setRouterBroadcast).toBe(true)
    expect(cert.approvalTx).toBe(M6_MINED_APPROVAL.tx)
    expect(cert.canaryTx).toBe(M6_MINED_CANARY.tx)
    expect(cert.actualFee).toBe('20000000000000')
    expect(cert.venueInput).toBe('9980000000000000')
    expect(cert.userOutput).toBe('6946714420281522671')
    expect(cert.ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(cert.UNAUTHORIZED_UI_CHANGE).toBe(0)
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
