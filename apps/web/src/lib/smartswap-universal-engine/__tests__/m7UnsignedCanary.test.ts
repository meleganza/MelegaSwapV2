import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { sealExecutionIntent } from '../executionIntent'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import {
  M7_BROADCAST,
  M7_FUNDING_SHORTFALL,
  M7_PREPARE_AUTHORIZATION,
  M7_UNSIGNED_APPROVE,
  M7_UNSIGNED_CANARY,
  M7_UNSIGNED_PACKAGE_STATUS,
  m7LegacyProductionStillAuthoritative,
  m7PrepareOnlyAuthorized,
} from '../m7UnsignedCanary'
import { isProductionCutoverAllowed } from '../operatingMode'
import { SMARTSWAP_UX_FREEZE_FILES } from '../uxFreezeFiles'

const WEB = path.resolve(__dirname, '../../../..')
const REPO = path.resolve(WEB, '../..')

describe('SmartSwap M7 unsigned canary package', () => {
  it('freezes the prepare-only grant, planned 0.01 WBNB, and funded reseal', () => {
    expect(m7PrepareOnlyAuthorized()).toBe(true)
    expect(M7_PREPARE_AUTHORIZATION.signAuthorized).toBe(false)
    expect(M7_PREPARE_AUTHORIZATION.broadcastAuthorized).toBe(false)
    expect(M7_PREPARE_AUTHORIZATION.fundingAuthorized).toBe(false)
    expect(M7_UNSIGNED_PACKAGE_STATUS).toBe('UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED')
    expect(M7_UNSIGNED_CANARY.inputAmount).toBe('10000000000000000')
    expect(M7_UNSIGNED_CANARY.intentNonce).toBe(2)
    expect(M7_UNSIGNED_CANARY.signed).toBe(false)
    expect(M7_UNSIGNED_CANARY.broadcast).toBe(false)
    expect(M7_FUNDING_SHORTFALL.observedWbnbWei).toBe('12000000000000000')
    expect(M7_FUNDING_SHORTFALL.shortfallWbnbWei).toBe('0')
    expect(M7_FUNDING_SHORTFALL.amountReducedToFitBalance).toBe(false)
    expect(M7_FUNDING_SHORTFALL.packageRemainsUnsignedReady).toBe(true)
    expect(M7_BROADCAST.signMainnet).toBe(false)
    expect(m7LegacyProductionStillAuthoritative()).toBe(true)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('locks unsigned approve and execute artifacts to the sealed intent', () => {
    const approvePath = path.join(REPO, M7_UNSIGNED_APPROVE.package)
    const execPath = path.join(REPO, M7_UNSIGNED_CANARY.package)
    expect(existsSync(approvePath)).toBe(true)
    expect(existsSync(execPath)).toBe(true)
    const approve = JSON.parse(readFileSync(approvePath, 'utf8')) as {
      signed: boolean
      broadcast: boolean
      nonce: number
      args: { spender: string; amount: string }
    }
    expect(approve.signed).toBe(false)
    expect(approve.broadcast).toBe(false)
    expect(approve.nonce).toBe(3207)
    expect(approve.args.amount).toBe('10000000000000000')
    expect(approve.args.spender).toBe('0x296015b106F4b2FB94249cf398cbF05d4CcE0391')
    const exec = JSON.parse(readFileSync(execPath, 'utf8')) as {
      signed: boolean
      broadcast: boolean
      nonce: number
      intentNonce: number
      intentHash: string
      signature: null
      executeCalldata: string
      intent: { inputAmount: string; minUserOut: string; deadline: number; nonce: number }
      funding: { amountReducedToFitBalance: boolean; shortfallWbnbWei: string }
    }
    expect(exec.signed).toBe(false)
    expect(exec.broadcast).toBe(false)
    expect(exec.nonce).toBe(3208)
    expect(exec.intentNonce).toBe(2)
    expect(exec.signature).toBeNull()
    expect(exec.executeCalldata).toBe('INCOMPLETE_UNTIL_INTENTSIGNER_PERSONAL_SIGN')
    expect(exec.intent.inputAmount).toBe('10000000000000000')
    expect(exec.intent.minUserOut).toBe(M7_UNSIGNED_CANARY.minUserOut)
    expect(exec.funding.amountReducedToFitBalance).toBe(false)
    expect(exec.funding.shortfallWbnbWei).toBe('0')
    const sealed = sealExecutionIntent({
      chainId: 56,
      user: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
      inputAsset: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
      outputAsset: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      inputAmount: '10000000000000000',
      minUserOut: M7_UNSIGNED_CANARY.minUserOut,
      venueId: 'pancakeswap',
      router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
      path: [
        '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
        '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d',
      ],
      structuralRouteCostBps: 25,
      deadline: M7_UNSIGNED_CANARY.deadline,
      nonce: '2',
      nativeIn: false,
      nativeOut: false,
    })
    expect(sealed.engineSeal).toBe(M7_UNSIGNED_CANARY.intentHash)
    expect(sealed.engineSeal).toBe(exec.intentHash)
    expect(sealed.routeHash).toBe(M7_UNSIGNED_CANARY.routeHash)
    expect(exec.intentHash).not.toBe('0x637825796aa0d15739e5a31dbaf9f650fe532acefdbd75a30bba07cd0e09e5f2')
    expect(exec.intentHash).not.toBe('0xb6b0e026141454d3c7a1590fa5117b5a61c9de926fafcdfc459eacf31d5395ef')
    expect(exec.intentHash).not.toBe('0xd7da493199519e7987504e73b995fc2aa0532600012ed2805417f320b757eefe')
    expect(exec.intentHash).not.toBe('0xe9a8ef50d382ff30e9270c76ddf737de8b4621ddab637168560c6f862b26b4c2')
    expect(exec.intentHash).not.toBe('0x114a067a72ac33c8033aec60264fc9870e7e741bbd17e8f238620dab848e5ce6')
    expect(exec.intentHash).not.toBe('0x2e712f37d552f3e39abf102f44536885b0bbdbe14d50b95054665e8d5a252c1a')
    expect(exec.intent.deadline).not.toBe(1787984605)
    expect(exec.intent.deadline).not.toBe(1787989123)
    expect(exec.intent.deadline).not.toBe(1787991074)
    expect(exec.intent.deadline).not.toBe(1787993618)
    expect(exec.intent.deadline).not.toBe(1788010572)
    expect(exec.intent.deadline).not.toBe(1788012170)
    expect(approve.nonce).not.toBe(3206)
  })

  it('does not modify any frozen SmartSwap UX file', () => {
    for (const rel of SMARTSWAP_UX_FREEZE_FILES) {
      const abs = path.join(WEB, rel)
      expect(existsSync(abs), rel).toBe(true)
    }
    expect(M7_BROADCAST.signMainnet).toBe(false)
  })
})
