/**
 * SmartSwapExecutorV1 deterministic artifact lock.
 * Replaces the unreproducible M5 bytecode-hash certification. Not deployed. Not FEE_VERIFIED.
 */

export const SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_STATUS =
  'SMARTSWAP_EXECUTOR_V1_DETERMINISTIC_ARTIFACT_CERTIFIED' as const

export const M5_BYTECODE_ARTIFACT_STATUS = 'SUPERSEDED_UNREPRODUCIBLE_ARTIFACT' as const

export const EXECUTOR_SOURCE_GIT_BLOB = '7869980ca19ce62bebc99e17670c99cc7e637172' as const
export const EXECUTOR_SOURCE_SHA256 = '5ecdeb832ad0990a1ed7a6a024b8a60bbf1b683afc2738adceadefa5150b8cee' as const

export const DETERMINISTIC_COMPILER_LOCK = {
  solcVersion: '0.8.20',
  solcLongVersion: '0.8.20+commit.a1b79de6',
  solcCommit: 'a1b79de6',
  forgeVersion: '1.7.1',
  forgeCommit: '4072e48705af9d93e3c0f6e29e93b5e9a40caed8',
  profile: 'smartswap_executor_release',
  optimizer: true,
  optimizerRuns: 200,
  viaIR: true,
  evmVersion: 'shanghai',
  bytecodeHash: 'none',
  appendCBOR: false,
  useLiteralContent: true,
  compilerInputSha256: 'd714e86a97098d0978ee06038bc51c6c47b4a3c9276235e6b3f98cc5453ef003',
} as const

export const DETERMINISTIC_BYTECODE = {
  creationLength: 8584,
  creationKeccak: '0xaa68423fc2a7e4fb80b54516bed42dccda8978ff4a5dd1d24180c5add2ad0791',
  deployedLength: 8062,
  deployedKeccak: '0x22b936d04dda69aa1fc31e031793ce922a18013fa9c2f0587043a627e75da0e1',
  abiSha256: '1a192f2403346dfc89087f55c07290a0e4fae5c968397039b7e8e0c3cfb2e746',
} as const

export const M5_SUPERSEDED_BYTECODE = {
  creationKeccak: '0x044040c2af494c8d1e34f1de7e3dd3071ae9cdf39df0fdfec908b9d4d261510c',
  deployedKeccak: '0x0f0b418f1b3f1a7a0897864c271eacedd6ebeb4bf226fcfc3c23aa2153b74fa3',
  status: M5_BYTECODE_ARTIFACT_STATUS,
} as const

export const DETERMINISTIC_ARTIFACT_PATHS = {
  compilerInput: 'deployments/smartswap-executor-v1/compiler-input.json',
  artifact: 'deployments/smartswap-executor-v1/smart-swap-executor-v1-artifact.json',
  mainnetArtifact: 'deployments/mainnet/smartswap-executor-v1-artifact.json',
} as const

export const EXECUTOR_RECERTIFICATION_BROADCAST = {
  deploy: false,
  wrap: false,
  approval: false,
  swap: false,
  signMainnet: false,
} as const

export function m5ArtifactMayBeReusedForM6(): boolean {
  return false
}
