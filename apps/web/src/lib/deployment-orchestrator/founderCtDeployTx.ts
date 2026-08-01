/**
 * Create Token Factory Founder deploy transaction builder — certified bytecode + constructor encoding.
 * No KMS. No server signer. No automatic broadcast.
 */
import { Interface } from '@ethersproject/abi'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { sha256 } from '@ethersproject/sha2'
import {
  CREATE_TOKEN_CREATION_FEE_BNB,
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FEE_RECIPIENT,
} from 'config/constants/createTokenFactoryDeployment'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import {
  assessCtArtifactIntegrity,
  CT_FACTORY_ALIAS,
  CT_FACTORY_CONTRACT,
  keccakCtCreationBytecode,
  loadCertifiedCtArtifacts,
} from './founderCtArtifacts'
import { buildCreateTokenTransactionReview } from './founderArtifacts'

export type CtHumanField = { label: string; value: string }

export type CtDeployStep = {
  index: number
  total: number
  stepId: string
  contractName: string
  artifactAlias: string
  purpose: string
  humanFields: CtHumanField[]
  constructorArgs: Array<{ name: string; type: string; value: string }>
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  expectedRuntimeHash: string
  artifactVerified: boolean
  deploymentData: string | null
  blockedReason: string | null
}

const TREASURY = FOUNDER_TREASURY_DESTINATION
const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER
const FEE_WEI = CREATE_TOKEN_CREATION_FEE_WEI

export function encodeCtConstructor(constructorInputs: unknown[], values: unknown[]): string {
  const iface = new Interface([{ type: 'constructor', inputs: constructorInputs as any }])
  return iface.encodeDeploy(values)
}

export function buildCtEconomicReviewFields(): CtHumanField[] {
  return [
    { label: 'Contract', value: `${CT_FACTORY_ALIAS} · ${CT_FACTORY_CONTRACT}` },
    { label: 'Creation fee', value: `${CREATE_TOKEN_CREATION_FEE_BNB} BNB` },
    { label: 'Creation fee (wei)', value: FEE_WEI },
    { label: 'Fee recipient', value: 'MELEGA TREASURY WALLET' },
    { label: 'Treasury address', value: TREASURY },
    { label: 'Deployment signer', value: `MELEGA DEPLOYER · ${DEPLOYER}` },
    { label: 'Network', value: 'BNB Smart Chain · Chain 56' },
    { label: 'Authority', value: 'Founder browser wallet only · no KMS · no server signer' },
  ]
}

export function buildCreateTokenDeployStep(): {
  artifactStatus: ReturnType<typeof loadCertifiedCtArtifacts>['status']
  invalidReasons: string[]
  step: CtDeployStep | null
  steps: CtDeployStep[]
  economicReview: CtHumanField[]
  review: ReturnType<typeof buildCreateTokenTransactionReview>
} {
  const loaded = loadCertifiedCtArtifacts()
  const economicReview = buildCtEconomicReviewFields()
  const art = loaded.artifacts[CT_FACTORY_CONTRACT]
  const gate = assessCtArtifactIntegrity(art, CT_FACTORY_CONTRACT)
  const constructorValid =
    CREATE_TOKEN_FEE_RECIPIENT.toLowerCase() === TREASURY.toLowerCase() && FEE_WEI === '100000000000000000'

  let deploymentData: string | null = null
  let blockedReason: string | null = null
  if (!gate.ok || !art) {
    blockedReason = gate.mismatches[0] || 'Create Token certified artifact invalid'
  } else if (!constructorValid) {
    blockedReason = 'Constructor fee / treasury validation failed'
  } else {
    const encoded = encodeCtConstructor(art.constructorInputs, [TREASURY, FEE_WEI])
    deploymentData = `${art.creationBytecode}${encoded.slice(2)}`
  }

  const step: CtDeployStep | null =
    loaded.status === 'ARTIFACTS_VALID' || art
      ? {
          index: 1,
          total: 1,
          stepId: CT_FACTORY_CONTRACT,
          contractName: CT_FACTORY_CONTRACT,
          artifactAlias: CT_FACTORY_ALIAS,
          purpose: 'Permanent Create Token Factory — immutable 0.10 BNB fee to MELEGA TREASURY WALLET',
          humanFields: [
            { label: 'Contract', value: CT_FACTORY_ALIAS },
            { label: 'Solidity name', value: CT_FACTORY_CONTRACT },
            { label: 'Fee', value: '0.10 BNB' },
            { label: 'Fee recipient', value: `MELEGA TREASURY WALLET · ${TREASURY}` },
            { label: 'Network', value: 'BNB Smart Chain' },
            { label: 'Chain ID', value: '56' },
            { label: 'Deployer', value: `MELEGA DEPLOYER · ${DEPLOYER}` },
          ],
          constructorArgs: [
            { name: 'feeRecipient_', type: 'address', value: TREASURY },
            { name: 'creationFee_', type: 'uint256', value: FEE_WEI },
          ],
          creationBytecodeHash: gate.creationBytecodeHash,
          creationBytecodeSha256: gate.creationBytecodeSha256,
          expectedRuntimeHash: art?.expectedRuntimeBytecodeSha256 || '',
          artifactVerified: gate.ok,
          deploymentData,
          blockedReason,
        }
      : null

  const review = buildCreateTokenTransactionReview({
    creationBytecode: art?.creationBytecode,
    creationBytecodeHash: gate.creationBytecodeSha256,
    expectedRuntimeBytecodeHash: art?.expectedRuntimeBytecodeSha256,
  })

  return {
    artifactStatus: loaded.status,
    invalidReasons: loaded.invalidReasons,
    step,
    steps: step ? [step] : [],
    economicReview,
    review: {
      ...review,
      artifactValid: gate.ok,
      constructorValid,
    },
  }
}

export function maskCtImmutableRegions(runtimeBytecode: string): string {
  const loaded = loadCertifiedCtArtifacts()
  const ranges = loaded.immutableByteRanges || []
  const bytes = arrayify(runtimeBytecode.startsWith('0x') ? runtimeBytecode : `0x${runtimeBytecode}`)
  const copy = Uint8Array.from(bytes)
  for (const range of ranges) {
    for (let i = 0; i < range.length; i += 1) {
      if (range.start + i < copy.length) copy[range.start + i] = 0
    }
  }
  return hexlify(copy)
}

export function runtimeHashForCtCertifiedCompare(runtimeBytecode: string): string {
  const masked = maskCtImmutableRegions(runtimeBytecode)
  return sha256(masked.startsWith('0x') ? masked : `0x${masked}`)
}

export function verifyCtConstructorArgs(args: { feeRecipient: string; creationFeeWei: string }): {
  ok: boolean
  checks: Record<string, boolean>
} {
  const checks = {
    feeRecipientMatch: args.feeRecipient.toLowerCase() === TREASURY.toLowerCase(),
    creationFeeMatch: args.creationFeeWei === FEE_WEI,
  }
  return { ok: Object.values(checks).every(Boolean), checks }
}

/** Re-export keccak helper for tests. */
export { keccakCtCreationBytecode }
