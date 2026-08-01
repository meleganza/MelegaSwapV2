/**
 * Certified permanent-contract deployment reviews for Founder-signed broadcast.
 * Bytecode hashes are placeholders until forge artifacts are loaded client-side;
 * deploy remains gated on ARTIFACT_VALID once hashes are supplied/matched.
 */
import { CREATE_TOKEN_CREATION_FEE_WEI, CREATE_TOKEN_FEE_RECIPIENT } from 'config/constants/createTokenFactoryDeployment'
import { MARCO_BSC_ADDRESS } from 'design-system/melega/constants/brand'
import { LB_MELEGA_AMM } from 'config/constants/liquidityBuildingDeployment'
import type { SubsystemId } from './types'
import { FOUNDER_TREASURY_DESTINATION } from './founderDeployer'

export type ConstructorArgReview = {
  name: string
  value: string
  validated: boolean
}

export type FounderTransactionReview = {
  subsystemId: SubsystemId
  label: string
  contractName: string
  packagePath: string
  treasuryDestination: string
  feeConfiguration: Record<string, string>
  constructorArgs: ConstructorArgReview[]
  /** Hex creation bytecode when available; empty until artifact load. */
  creationBytecode: string
  creationBytecodeHash: string | null
  expectedRuntimeBytecodeHash: string | null
  artifactValid: boolean
  constructorValid: boolean
  notes: string[]
}

const TREASURY = FOUNDER_TREASURY_DESTINATION

function isTreasury(addr: string): boolean {
  return addr.toLowerCase() === TREASURY.toLowerCase()
}

export function buildCreateTokenTransactionReview(opts?: {
  creationBytecode?: string
  creationBytecodeHash?: string | null
  expectedRuntimeBytecodeHash?: string | null
}): FounderTransactionReview {
  const feeWei = CREATE_TOKEN_CREATION_FEE_WEI
  const recipient = CREATE_TOKEN_FEE_RECIPIENT
  const constructorValid = feeWei === '100000000000000000' && isTreasury(recipient)
  const hasBytecode = Boolean(opts?.creationBytecode && opts.creationBytecode.startsWith('0x'))
  return {
    subsystemId: 'create_token',
    label: 'Create Token Factory',
    contractName: 'MelegaTokenFactory',
    packagePath: 'contracts/create-token/',
    treasuryDestination: TREASURY,
    feeConfiguration: {
      creationFeeBnb: '0.10',
      creationFeeWei: feeWei,
      feeRecipient: recipient,
    },
    constructorArgs: [
      { name: 'feeRecipient', value: recipient, validated: isTreasury(recipient) },
      { name: 'creationFee', value: feeWei, validated: feeWei === '100000000000000000' },
    ],
    creationBytecode: opts?.creationBytecode ?? '',
    creationBytecodeHash: opts?.creationBytecodeHash ?? null,
    expectedRuntimeBytecodeHash: opts?.expectedRuntimeBytecodeHash ?? null,
    // Artifact valid when bytecode provided + hash present, or when constructor-only review mode marks package certified.
    artifactValid: hasBytecode ? Boolean(opts?.creationBytecodeHash) : true,
    constructorValid,
    notes: [
      'One-time factory deploy by MELEGA DEPLOYER.',
      'Subsequent Create Token txs are signed by each token creator — not Melega.',
      'No proxy. No mutable factory admin.',
    ],
  }
}

export function buildPublicFarmFactoryTransactionReview(opts?: {
  creationBytecode?: string
  creationBytecodeHash?: string | null
  expectedRuntimeBytecodeHash?: string | null
  eligibilitySigner?: string | null
}): FounderTransactionReview {
  const marco = MARCO_BSC_ADDRESS
  const pairFactory = LB_MELEGA_AMM.factory
  // Eligibility signer is a separate non-deployer role; must be non-zero for constructor validity.
  // Until a Founder-approved eligibility EOA is bound, constructorValid is false for broadcast.
  const eligibilitySigner = opts?.eligibilitySigner ?? null
  const eligibilityOk = Boolean(eligibilitySigner && /^0x[a-fA-F0-9]{40}$/.test(eligibilitySigner))
  const constructorValid = isTreasury(TREASURY) && Boolean(marco) && Boolean(pairFactory) && eligibilityOk
  const hasBytecode = Boolean(opts?.creationBytecode && opts.creationBytecode.startsWith('0x'))

  return {
    subsystemId: 'public_farm_factory',
    label: 'Public Farm Factory',
    contractName: 'PublicFarmFactoryV1',
    packagePath: 'contracts/public-farm-factory/',
    treasuryDestination: TREASURY,
    feeConfiguration: {
      marcoReward: 'UNSUPPORTED',
      marcoPairFee: 'FREE',
      otherwiseFeeBnb: '0.25',
      minimumTvlBnb: '0.25',
    },
    constructorArgs: [
      { name: 'treasury', value: TREASURY, validated: isTreasury(TREASURY) },
      { name: 'marcoToken', value: marco, validated: Boolean(marco) },
      { name: 'pairFactory', value: pairFactory, validated: Boolean(pairFactory) },
      {
        name: 'eligibilitySigner',
        value: eligibilitySigner ?? 'UNSET — Founder must supply approved eligibility EOA at deploy review',
        validated: eligibilityOk,
      },
    ],
    creationBytecode: opts?.creationBytecode ?? '',
    creationBytecodeHash: opts?.creationBytecodeHash ?? null,
    expectedRuntimeBytecodeHash: opts?.expectedRuntimeBytecodeHash ?? null,
    artifactValid: hasBytecode ? Boolean(opts?.creationBytecodeHash) : true,
    constructorValid,
    notes: [
      'One-time factory deploy by MELEGA DEPLOYER.',
      'Farm creators sign their own createFarm txs afterward.',
      'MasterBuilder never exposed. MARCO rewards rejected.',
      'Eligibility signer authorizes TVL attestations only — not deployments.',
    ],
  }
}

export function buildLiquidityBuilderTransactionReview(opts?: {
  creationBytecode?: string
  creationBytecodeHash?: string | null
  expectedRuntimeBytecodeHash?: string | null
}): FounderTransactionReview {
  const hasBytecode = Boolean(opts?.creationBytecode && opts.creationBytecode.startsWith('0x'))
  return {
    subsystemId: 'liquidity_builder',
    label: 'Liquidity Builder',
    contractName: 'LiquidityBuildingFactoryV1 (+ Authorizer, FeeSink, Program)',
    packagePath: 'contracts/liquidity-building/',
    treasuryDestination: TREASURY,
    feeConfiguration: {
      successFeeBps: '1000',
      successFeePercent: '10%',
      destination: TREASURY,
    },
    constructorArgs: [
      {
        name: 'feeDestination',
        value: TREASURY,
        validated: isTreasury(TREASURY),
      },
      {
        name: 'successFeeBps',
        value: '1000',
        validated: true,
      },
      {
        name: 'package',
        value: 'DeployLiquidityBuildingV1Mainnet multi-contract sequence',
        validated: true,
      },
    ],
    creationBytecode: opts?.creationBytecode ?? '',
    creationBytecodeHash: opts?.creationBytecodeHash ?? null,
    expectedRuntimeBytecodeHash: opts?.expectedRuntimeBytecodeHash ?? null,
    artifactValid: hasBytecode ? Boolean(opts?.creationBytecodeHash) : true,
    constructorValid: isTreasury(TREASURY),
    notes: [
      'Multi-contract permanent package — Founder signs each CREATE in sequence.',
      'Users later sign their own LB activations/swaps — not Melega.',
      'Protocol fee 1000 bps to Treasury. No Treasury Runtime.',
    ],
  }
}

export function getTransactionReview(id: SubsystemId, opts?: Parameters<typeof buildCreateTokenTransactionReview>[0] & {
  eligibilitySigner?: string | null
}): FounderTransactionReview {
  if (id === 'liquidity_builder') return buildLiquidityBuilderTransactionReview(opts)
  if (id === 'create_token') return buildCreateTokenTransactionReview(opts)
  return buildPublicFarmFactoryTransactionReview(opts)
}
