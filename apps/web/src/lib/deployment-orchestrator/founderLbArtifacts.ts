/**
 * Certified Liquidity Builder artifact loader — fail closed on empty/mismatched bytecode.
 */
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'

// Bundler JSON import (Next/webpack). Fail closed if package absent.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const certified = require('./artifacts/lb-v1-certified.json') as {
  deployOrder: string[]
  artifacts: Record<string, LbArtifactRecord>
}

export type LbArtifactRecord = {
  contractName: string
  creationBytecode: string
  expectedRuntimeBytecodeSha256: string
  observedRuntimeBytecodeSha256: string
  runtimeHashMatchesCertified: boolean
  constructorInputs: Array<{ name: string; type: string; components?: unknown[] }>
  linkReferences: Record<string, Record<string, Array<{ start: number; length: number }>>>
}

export type LbArtifactLoadResult = {
  status: 'ARTIFACTS_LOADING' | 'ARTIFACTS_VALID' | 'ARTIFACTS_INVALID'
  deployOrder: string[]
  artifacts: Record<string, LbArtifactRecord>
  invalidReasons: string[]
  treasury: typeof FOUNDER_TREASURY_DESTINATION
  deployer: typeof AUTHORIZED_MELEGA_DEPLOYER
}

export function loadCertifiedLbArtifacts(): LbArtifactLoadResult {
  const deployOrder = [...certified.deployOrder]
  const raw = certified.artifacts
  const invalidReasons: string[] = []
  const artifacts: Record<string, LbArtifactRecord> = {}

  for (const name of deployOrder) {
    const a = raw[name]
    if (!a) {
      invalidReasons.push(`${name}: missing from certified package`)
      continue
    }
    if (!a.creationBytecode || a.creationBytecode === '0x' || a.creationBytecode.length < 4) {
      invalidReasons.push(`${name}: empty creation bytecode`)
    }
    if (!a.runtimeHashMatchesCertified) {
      invalidReasons.push(
        `${name}: runtime hash mismatch (observed ${a.observedRuntimeBytecodeSha256}, expected ${a.expectedRuntimeBytecodeSha256})`,
      )
    }
    artifacts[name] = a
  }

  return {
    status: invalidReasons.length ? 'ARTIFACTS_INVALID' : 'ARTIFACTS_VALID',
    deployOrder,
    artifacts,
    invalidReasons,
    treasury: FOUNDER_TREASURY_DESTINATION,
    deployer: AUTHORIZED_MELEGA_DEPLOYER,
  }
}

/** Replace solc library placeholders in creation bytecode with a deployed library address. */
export function linkLibraryBytecode(creationBytecode: string, libraryAddress: string): string {
  const addr = libraryAddress.replace(/^0x/, '').toLowerCase()
  if (!/^[a-f0-9]{40}$/.test(addr)) {
    throw new Error('Invalid library address for linking')
  }
  const linked = creationBytecode.replace(/__\$[a-f0-9]{34}\$__/gi, addr)
  if (linked.includes('__$')) {
    throw new Error('Unresolved library placeholders remain after link')
  }
  return linked.startsWith('0x') ? linked : `0x${linked}`
}
