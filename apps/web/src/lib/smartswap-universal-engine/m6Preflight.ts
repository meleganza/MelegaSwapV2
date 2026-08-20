/**
 * M6 preflight against the M5-certified canary package.
 * Any material drift forbids broadcast. No automatic repair.
 */

import { FIRST_CANARY_PAIR, CANARY_INPUT_AMOUNT } from './m5CanaryPackage'
import { CANONICAL_SMARTSWAP_FEE_BENEFICIARY } from './feeEnforcement'
import { PANCAKE_SWAP_VENUE } from './certifiedVenues'
import { M6_VERDICT } from './m6OperatingState'

export const M5_CERTIFIED_BYTECODE = {
  creationKeccak: '0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c',
  deployedKeccak: '0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3',
} as const

/** Measured locally during M6 preflight. Source unchanged; artifact keccak differs. */
export const M6_MEASURED_BYTECODE = {
  creationKeccak: '0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9',
  deployedKeccak: '0x49a9a3b7ff50e96b7bdd29687bafd40c05edb9e6b42b145407d025afa020cd5f',
  method: 'forge inspect SmartSwapExecutorV1 bytecode | cast keccak',
  sourceDiffVsM5: false,
} as const

export const M6_PREFLIGHT_MEASURED = {
  chainId: 56,
  rpc: 'https://bsc.publicnode.com',
  blockNumber: 117019908,
  treasury: CANONICAL_SMARTSWAP_FEE_BENEFICIARY,
  pancakeRouter: PANCAKE_SWAP_VENUE.routers[56]!,
  melegaRouter: '0xc25033218D181b27D4a2944Fbb04FC055da4EAB3',
  wbnb: FIRST_CANARY_PAIR.input,
  usdt: FIRST_CANARY_PAIR.output,
  pair: FIRST_CANARY_PAIR.pair,
  pairMatchesFactory: true,
  decimalsWbnb: 18,
  decimalsUsdt: 18,
  reserveUsdt: '43478525214577459828159701',
  reserveWbnb: '67562087337669994610597',
  grossQuoteRaw: '6418978776039224787',
  netQuoteRaw: '6406199617004210689',
  structuralRouteCostBps: 25,
  policyFeeBps: 20,
  inputAmount: CANARY_INPUT_AMOUNT,
  knownDeployer: '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0',
  knownDeployerBnbWei: '13465384635635472',
  knownDeployerWbnbWei: '0',
  mainnetDeployerEnv: false,
  foundryKeystoreUnlocked: false,
  bytecodeMatchesM5: false,
} as const

export function m6BytecodeMatchesM5(): boolean {
  return (
    M6_MEASURED_BYTECODE.creationKeccak.toLowerCase() === M5_CERTIFIED_BYTECODE.creationKeccak.toLowerCase() &&
    M6_MEASURED_BYTECODE.deployedKeccak.toLowerCase() === M5_CERTIFIED_BYTECODE.deployedKeccak.toLowerCase()
  )
}

export function m6MayBroadcast(input: {
  founderAuthorized: boolean
  bytecodeMatchesM5: boolean
  signerAvailable: boolean
  wbnbBalanceWei: string
}): boolean {
  if (!input.founderAuthorized) return false
  if (!input.bytecodeMatchesM5) return false
  if (!input.signerAvailable) return false
  if (BigInt(input.wbnbBalanceWei) < BigInt(CANARY_INPUT_AMOUNT)) return false
  return true
}

export function m6PreflightVerdict(): typeof M6_VERDICT.BLOCKED_PREFLIGHT_DRIFT {
  return M6_VERDICT.BLOCKED_PREFLIGHT_DRIFT
}

export const M6_BROADCAST = {
  deploy: false,
  approval: false,
  swap: false,
} as const
