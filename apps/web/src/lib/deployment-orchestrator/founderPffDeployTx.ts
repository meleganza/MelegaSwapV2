/**
 * Public Farm Factory Founder deploy transaction builder — certified bytecode + constructor encoding.
 * No KMS. No server signer. No automatic broadcast.
 */
import { Interface } from '@ethersproject/abi'
import { arrayify, hexlify } from '@ethersproject/bytes'
import { sha256 } from '@ethersproject/sha2'
import {
  PUBLIC_FARM_DEFAULT_FEE_BNB,
  PUBLIC_FARM_ELIGIBILITY_SIGNER,
  PUBLIC_FARM_FACTORY_FEE_RECIPIENT,
  PUBLIC_FARM_MARCO_TOKEN,
  PUBLIC_FARM_MINIMUM_TVL_BNB,
  PUBLIC_FARM_PAIR_FACTORY,
} from 'config/constants/publicFarmFactoryDeployment'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import {
  assessPffArtifactIntegrity,
  keccakPffCreationBytecode,
  loadCertifiedPffArtifacts,
  PFF_FACTORY_ALIAS,
  PFF_FACTORY_CONTRACT,
} from './founderPffArtifacts'
import { buildPublicFarmFactoryTransactionReview } from './founderArtifacts'

export type PffHumanField = { label: string; value: string }

export type PffDeployStep = {
  index: number
  total: number
  stepId: string
  contractName: string
  artifactAlias: string
  purpose: string
  humanFields: PffHumanField[]
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

export function encodePffConstructor(constructorInputs: unknown[], values: unknown[]): string {
  const iface = new Interface([{ type: 'constructor', inputs: constructorInputs as any }])
  return iface.encodeDeploy(values)
}

export function buildPffEconomicReviewFields(): PffHumanField[] {
  return [
    { label: 'Contract', value: `${PFF_FACTORY_ALIAS}` },
    { label: 'MARCO pair fee', value: 'FREE' },
    { label: 'Other pair fee', value: `${PUBLIC_FARM_DEFAULT_FEE_BNB} BNB` },
    { label: 'Minimum LP TVL', value: `${PUBLIC_FARM_MINIMUM_TVL_BNB} BNB` },
    { label: 'Low liquidity action', value: 'REQUIRE_LIQUIDITY_INCREASE' },
    { label: 'Fee recipient', value: 'MELEGA TREASURY WALLET' },
    { label: 'Treasury address', value: TREASURY },
    { label: 'MARCO token', value: PUBLIC_FARM_MARCO_TOKEN },
    { label: 'Pair factory', value: PUBLIC_FARM_PAIR_FACTORY },
    { label: 'Eligibility signer', value: `MELEGA DEPLOYER · ${PUBLIC_FARM_ELIGIBILITY_SIGNER}` },
    { label: 'Deployment signer', value: `MELEGA DEPLOYER · ${DEPLOYER}` },
    { label: 'Network', value: 'BNB Smart Chain · Chain 56' },
    { label: 'Authority', value: 'Founder browser wallet only · no KMS · no server signer' },
  ]
}

export function verifyPffConstructorArgs(args: {
  treasury: string
  marcoToken: string
  pairFactory: string
  eligibilitySigner: string
}): { ok: boolean; checks: Record<string, boolean> } {
  const checks = {
    treasuryMatch: args.treasury.toLowerCase() === TREASURY.toLowerCase(),
    marcoMatch: args.marcoToken.toLowerCase() === PUBLIC_FARM_MARCO_TOKEN.toLowerCase(),
    pairFactoryMatch: args.pairFactory.toLowerCase() === PUBLIC_FARM_PAIR_FACTORY.toLowerCase(),
    eligibilitySignerMatch:
      args.eligibilitySigner.toLowerCase() === PUBLIC_FARM_ELIGIBILITY_SIGNER.toLowerCase(),
    feeRecipientCanonical:
      PUBLIC_FARM_FACTORY_FEE_RECIPIENT.toLowerCase() === TREASURY.toLowerCase(),
  }
  return { ok: Object.values(checks).every(Boolean), checks }
}

export function buildPublicFarmDeployStep(): {
  artifactStatus: ReturnType<typeof loadCertifiedPffArtifacts>['status']
  invalidReasons: string[]
  step: PffDeployStep | null
  steps: PffDeployStep[]
  economicReview: PffHumanField[]
  review: ReturnType<typeof buildPublicFarmFactoryTransactionReview>
} {
  const loaded = loadCertifiedPffArtifacts()
  const economicReview = buildPffEconomicReviewFields()
  const art = loaded.artifacts[PFF_FACTORY_CONTRACT]
  const gate = assessPffArtifactIntegrity(art, PFF_FACTORY_CONTRACT)
  const constructorCheck = verifyPffConstructorArgs({
    treasury: TREASURY,
    marcoToken: PUBLIC_FARM_MARCO_TOKEN,
    pairFactory: PUBLIC_FARM_PAIR_FACTORY,
    eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
  })

  let deploymentData: string | null = null
  let blockedReason: string | null = null
  if (!gate.ok || !art) {
    blockedReason = gate.mismatches[0] || 'Public Farm Factory certified artifact invalid'
  } else if (!constructorCheck.ok) {
    blockedReason = 'Constructor treasury / MARCO / pairFactory / eligibilitySigner validation failed'
  } else {
    const encoded = encodePffConstructor(art.constructorInputs, [
      TREASURY,
      PUBLIC_FARM_MARCO_TOKEN,
      PUBLIC_FARM_PAIR_FACTORY,
      PUBLIC_FARM_ELIGIBILITY_SIGNER,
    ])
    deploymentData = `${art.creationBytecode}${encoded.slice(2)}`
  }

  const step: PffDeployStep | null =
    loaded.status === 'ARTIFACTS_VALID' || art
      ? {
          index: 1,
          total: 1,
          stepId: PFF_FACTORY_CONTRACT,
          contractName: PFF_FACTORY_CONTRACT,
          artifactAlias: PFF_FACTORY_ALIAS,
          purpose:
            'Permanent Public Farm Factory — MARCO pairs FREE · other pairs 0.25 BNB to MELEGA TREASURY WALLET',
          humanFields: [
            { label: 'Contract', value: PFF_FACTORY_ALIAS },
            { label: 'Solidity name', value: PFF_FACTORY_CONTRACT },
            { label: 'MARCO pair fee', value: 'FREE' },
            { label: 'Other pairs', value: '0.25 BNB' },
            { label: 'Fee recipient', value: `MELEGA TREASURY WALLET · ${TREASURY}` },
            { label: 'Network', value: 'BNB Smart Chain' },
            { label: 'Chain ID', value: '56' },
            { label: 'Deployer', value: `MELEGA DEPLOYER · ${DEPLOYER}` },
          ],
          constructorArgs: [
            { name: 'treasury_', type: 'address', value: TREASURY },
            { name: 'marcoToken_', type: 'address', value: PUBLIC_FARM_MARCO_TOKEN },
            { name: 'pairFactory_', type: 'address', value: PUBLIC_FARM_PAIR_FACTORY },
            { name: 'eligibilitySigner_', type: 'address', value: PUBLIC_FARM_ELIGIBILITY_SIGNER },
          ],
          creationBytecodeHash: gate.creationBytecodeHash,
          creationBytecodeSha256: gate.creationBytecodeSha256,
          expectedRuntimeHash: art?.expectedRuntimeBytecodeSha256 || '',
          artifactVerified: gate.ok,
          deploymentData,
          blockedReason,
        }
      : null

  const review = buildPublicFarmFactoryTransactionReview({
    creationBytecode: art?.creationBytecode,
    creationBytecodeHash: gate.creationBytecodeSha256,
    expectedRuntimeBytecodeHash: art?.expectedRuntimeBytecodeSha256,
    eligibilitySigner: PUBLIC_FARM_ELIGIBILITY_SIGNER,
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
      constructorValid: constructorCheck.ok && review.constructorValid,
    },
  }
}

export function maskPffImmutableRegions(runtimeBytecode: string): string {
  const loaded = loadCertifiedPffArtifacts()
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

export function runtimeHashForPffCertifiedCompare(runtimeBytecode: string): string {
  const masked = maskPffImmutableRegions(runtimeBytecode)
  return sha256(masked.startsWith('0x') ? masked : `0x${masked}`)
}

export { keccakPffCreationBytecode }
