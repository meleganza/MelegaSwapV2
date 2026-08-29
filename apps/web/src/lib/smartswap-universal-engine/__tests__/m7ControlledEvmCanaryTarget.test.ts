import { existsSync, readFileSync } from 'fs'
import path from 'path'
import { describe, expect, it } from 'vitest'
import { FIRST_CANARY_SPEC } from '../canarySpec'
import { PANCAKE_SWAP_VENUE } from '../certifiedVenues'
import { ACTIVE_V2_ROLLOUT, V2_ROLLOUT_STATE } from '../m4OperatingState'
import { FIRST_CANARY_PAIR } from '../m5CanaryPackage'
import { M6_BNB_MAINNET_CANARY_PROOF } from '../m6MainnetCanaryCertification'
import {
  M7_HARD_STOP,
  M7_NEXT_CONTROLLED_EVM_CANARY_TARGET,
  M7_TARGET_STATUS,
  m7MayPrepareOrBroadcast,
  m7TargetIsApprovedAdditionalPancakeBnbPair,
} from '../m7ControlledEvmCanaryTarget'
import { SMARTSWAP_UNIVERSAL_ENGINE_M7_ID, isProductionCutoverAllowed } from '../operatingMode'

const WEB = path.resolve(__dirname, '../../../..')
const TARGET = path.join(WEB, 'docs/runtime/smartswap-universal-engine-m7-controlled-evm-scope/m7-controlled-evm-scope.json')

describe('SmartSwap M7 controlled EVM canary target', () => {
  it('keeps the approved additional Pancake V2 BNB pair and planned notional', () => {
    expect(SMARTSWAP_UNIVERSAL_ENGINE_M7_ID).toBe('SMARTSWAP_UNIVERSAL_ENGINE_M7')
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.status).toBe(
      M7_TARGET_STATUS.UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED,
    )
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.venueId).toBe('pancakeswap')
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.chainId).toBe(56)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.router).toBe(PANCAKE_SWAP_VENUE.routers[56])
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.pair.outputAddress).toBe(FIRST_CANARY_SPEC.pair.outputAddress)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.pair.inputAddress).toBe(FIRST_CANARY_SPEC.pair.inputAddress)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.plannedInputAmountRaw).toBe('10000000000000000')
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.intentNonce).toBe(2)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.pairAddress.toLowerCase()).not.toBe(
      FIRST_CANARY_PAIR.pair.toLowerCase(),
    )
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.sameExecutor).toBe(M6_BNB_MAINNET_CANARY_PROOF.executor)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.prepared).toBe(true)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.signed).toBe(false)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.broadcast).toBe(false)
    expect(M7_NEXT_CONTROLLED_EVM_CANARY_TARGET.founderAuthorizationScope).toBe('PREPARE_UNSIGNED_PACKAGE_ONLY')
    expect(m7TargetIsApprovedAdditionalPancakeBnbPair()).toBe(true)
    expect(m7MayPrepareOrBroadcast()).toBe(false)
    expect(M7_HARD_STOP.broadcast).toBe(false)
    expect(M7_HARD_STOP.reduceAmountToFitBalance).toBe(false)
    expect(ACTIVE_V2_ROLLOUT).toBe(V2_ROLLOUT_STATE.LEGACY_PRODUCTION)
    expect(isProductionCutoverAllowed()).toBe(false)
  })

  it('records the prepared unsigned package in evidence without substituting another venue', () => {
    expect(existsSync(TARGET)).toBe(true)
    const json = JSON.parse(readFileSync(TARGET, 'utf8')) as {
      status: string
      venueId: string
      plannedInputAmountRaw: string
      amountReducedToFitBalance: boolean
      signed: boolean
      broadcast: boolean
      ACTIVE_V2_ROLLOUT: string
      UNAUTHORIZED_UI_CHANGE: number
    }
    expect(json.status).toBe('UNSIGNED_PACKAGE_PREPARED_NOT_SIGNED')
    expect(json.venueId).toBe('pancakeswap')
    expect(json.plannedInputAmountRaw).toBe('10000000000000000')
    expect(json.amountReducedToFitBalance).toBe(false)
    expect(json.signed).toBe(false)
    expect(json.broadcast).toBe(false)
    expect(json.ACTIVE_V2_ROLLOUT).toBe('LEGACY_PRODUCTION')
    expect(json.UNAUTHORIZED_UI_CHANGE).toBe(0)
  })
})
