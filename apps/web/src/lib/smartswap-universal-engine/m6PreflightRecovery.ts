/**
 * M6 preflight recovery. Broadcast remains forbidden until M5 bytecode is reproduced exactly.
 */

export const M6_RECOVERY_VERDICT = {
  BLOCKED_BYTECODE_REPRODUCTION: 'SMARTSWAP_M6_PREFLIGHT_BLOCKED_BYTECODE_REPRODUCTION',
  BLOCKED_SOURCE_DRIFT: 'SMARTSWAP_M6_PREFLIGHT_BLOCKED_SOURCE_DRIFT',
  BLOCKED_SIGNER: 'SMARTSWAP_M6_PREFLIGHT_BLOCKED_SIGNER',
  AWAITING_FOUNDER_FUNDING: 'SMARTSWAP_M6_PREFLIGHT_AWAITING_FOUNDER_FUNDING',
  RECOVERED: 'MELEGASWAP_V2_SMARTSWAP_M6_PREFLIGHT_RECOVERED',
} as const

export const M5_CERTIFIED_CREATION_KECCAK =
  '0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c' as const
export const M5_CERTIFIED_DEPLOYED_KECCAK =
  '0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3' as const

export const EXECUTOR_SOURCE_GIT_BLOB = '7869980ca19ce62bebc99e17670c99cc7e637172' as const
export const EXECUTOR_SOURCE_SHA256 = '5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee' as const

/** Two local compiles in this recovery produced different IPFS-metadata hashes. */
export const RECOVERY_MEASURED_HASHES = {
  m6BlockedSession: {
    creationKeccak: '0xd0534f444328674466c9bc6c1b72cb2ebd26d870f564c0cb8b85bc8566cb74c9',
    deployedKeccak: '0x49a9a3b7ff50e96b7bdd29687bafd40c05edb9e6b42b145407d025afa020cd5f',
    command: 'forge inspect SmartSwapExecutorV1 bytecode | cast keccak',
  },
  isolatedSkipTestScript: {
    creationKeccak: '0x94a549a0651b0d50d82e591120b62d8fd6a8ac81f624ea649714d09a44d671b8',
    deployedKeccak: '0x5f7229ea1adaf83e73e1f045ec5948a23bff48e3de0202f6a4c5678d50ed817a',
    command: 'forge build --skip test --skip script && forge inspect … | cast keccak',
  },
} as const

export function m5BytecodeReproduced(creationKeccak: string, deployedKeccak: string): boolean {
  return (
    creationKeccak.toLowerCase() === M5_CERTIFIED_CREATION_KECCAK &&
    deployedKeccak.toLowerCase() === M5_CERTIFIED_DEPLOYED_KECCAK
  )
}

export const M6_RECOVERY_ACTIVE_VERDICT = M6_RECOVERY_VERDICT.BLOCKED_BYTECODE_REPRODUCTION

export const RECOVERY_BROADCAST = {
  deploy: false,
  wrap: false,
  approval: false,
  swap: false,
} as const
