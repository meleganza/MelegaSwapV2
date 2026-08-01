/**
 * Liquidity Builder Founder deploy transaction builders — certified order + constructor encoding.
 */
import { Interface } from '@ethersproject/abi'
import { id as keccakId } from '@ethersproject/hash'
import { AUTHORIZED_MELEGA_DEPLOYER, FOUNDER_TREASURY_DESTINATION } from './founderDeployer'
import {
  assessLbArtifactIntegrity,
  keccakCreationBytecode,
  linkLibraryBytecode,
  loadCertifiedLbArtifacts,
  type LbArtifactRecord,
} from './founderLbArtifacts'
import { LB_MELEGA_AMM } from 'config/constants/liquidityBuildingDeployment'

export type LbHumanField = { label: string; value: string }

export type LbDeployStep = {
  index: number
  total: number
  stepId: string
  contractName: string
  purpose: string
  dependencies: string[]
  humanFields: LbHumanField[]
  constructorArgs: Array<{ name: string; type: string; value: string }>
  creationBytecodeHash: string | null
  expectedRuntimeHash: string
  artifactVerified: boolean
  /** Creation tx data (bytecode + encoded constructor) when dependencies satisfied. */
  deploymentData: string | null
  blockedReason: string | null
}

const TREASURY = FOUNDER_TREASURY_DESTINATION
const DEPLOYER = AUTHORIZED_MELEGA_DEPLOYER

/** Canonical protocol parameters from DeployLiquidityBuildingV1Mainnet.s.sol / inputs.json */
export const LB_PROTOCOL_PARAMS = {
  successFeeBps: 1000,
  strategyCeilingBps: 5000,
  operatingCurveImpactBps: 40,
  hardCurveImpactBps: 100,
  hardEffectiveDeviationBps: 150,
  decisionExecutionDriftBps: 100,
  swapSlippageOperatingBps: 50,
  hardSlippageBps: 100,
  remainingBudgetEpochCapBps: 500,
  totalBudgetEpochCapBps: 200,
  rolling24hTotalBudgetCapBps: 2000,
  maximumGasCostShareBps: 1000,
  initialFinalityDepth: 15,
  maxSuccessfulExecutionsPerEpoch: 1,
} as const

const WBNB = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'

export type LbDeployedAddresses = {
  math?: string | null
  feeReceiver?: string | null
  authorizer?: string | null
  feeSink?: string | null
  program?: string | null
  factory?: string | null
}

function encodeDeployData(constructorInputs: unknown[], values: unknown[]): string {
  const iface = new Interface([{ type: 'constructor', inputs: constructorInputs as any }])
  return iface.encodeDeploy(values)
}

/** Canonical constructor encoding for proofs / tests. */
export function encodeLbConstructor(constructorInputs: unknown[], values: unknown[]): string {
  return encodeDeployData(constructorInputs, values)
}

export function buildLbEconomicReviewFields(): LbHumanField[] {
  return [
    { label: 'Protocol fee', value: '10% of each Liquidity Builder swap' },
    { label: 'Basis points', value: '1000 bps' },
    { label: 'Fee destination', value: 'MELEGA TREASURY WALLET' },
    { label: 'Treasury address', value: TREASURY },
    { label: 'Deployment signer', value: `MELEGA DEPLOYER · ${DEPLOYER}` },
    { label: 'Network', value: 'BNB Smart Chain · Chain 56' },
  ]
}

export function buildLbDeploySteps(deployed: LbDeployedAddresses = {}): {
  artifactStatus: ReturnType<typeof loadCertifiedLbArtifacts>['status']
  invalidReasons: string[]
  steps: LbDeployStep[]
  economicReview: LbHumanField[]
} {
  const loaded = loadCertifiedLbArtifacts()
  const arts = loaded.artifacts
  const economicReview = buildLbEconomicReviewFields()

  const mk = (
    contractName: string,
    purpose: string,
    dependencies: string[],
    humanFields: LbHumanField[],
    ctorValues: unknown[] | null,
    blockedReason: string | null,
    linkMath?: string | null,
  ): Omit<LbDeployStep, 'index' | 'total'> => {
    const art: LbArtifactRecord | undefined = arts[contractName]
    if (!art) {
      return {
        stepId: contractName,
        contractName,
        purpose,
        dependencies,
        humanFields,
        constructorArgs: [],
        creationBytecodeHash: null,
        expectedRuntimeHash: 'missing',
        artifactVerified: false,
        deploymentData: null,
        blockedReason: blockedReason ?? 'Artifact missing',
      }
    }
    let bytecode = art.creationBytecode
    if (contractName === 'LiquidityBuildingProgramV1') {
      if (!linkMath) {
        return {
          stepId: contractName,
          contractName,
          purpose,
          dependencies,
          humanFields,
          constructorArgs: [],
          creationBytecodeHash: keccakCreationBytecode(bytecode),
          expectedRuntimeHash: art.expectedRuntimeBytecodeSha256,
          artifactVerified: art.runtimeHashMatchesCertified,
          deploymentData: null,
          blockedReason: blockedReason ?? 'Deploy ExecutionMath library first',
        }
      }
      try {
        bytecode = linkLibraryBytecode(bytecode, linkMath)
      } catch (e) {
        return {
          stepId: contractName,
          contractName,
          purpose,
          dependencies,
          humanFields,
          constructorArgs: [],
          creationBytecodeHash: null,
          expectedRuntimeHash: art.expectedRuntimeBytecodeSha256,
          artifactVerified: false,
          deploymentData: null,
          blockedReason: e instanceof Error ? e.message : 'Library link failed',
        }
      }
    }

    const integrity = assessLbArtifactIntegrity(art, contractName)
    const ctorArgs = (art.constructorInputs || []).map((inp, i) => ({
      name: inp.name || `arg${i}`,
      type: inp.type,
      value: ctorValues ? String(ctorValues[i]) : '—',
    }))

    let deploymentData: string | null = null
    let block = blockedReason
    if (!integrity.ok) {
      block = integrity.mismatches[0] || `Artifact integrity failed for ${contractName}`
    } else if (ctorValues && !block) {
      try {
        const encoded = encodeDeployData(art.constructorInputs as any, ctorValues)
        deploymentData = bytecode + encoded.slice(2)
      } catch (e) {
        block = e instanceof Error ? e.message : 'Constructor encode failed'
      }
    } else if (!art.constructorInputs?.length && !block) {
      deploymentData = bytecode
    }

    return {
      stepId: contractName,
      contractName,
      purpose,
      dependencies,
      humanFields,
      constructorArgs: ctorArgs,
      creationBytecodeHash: keccakCreationBytecode(bytecode),
      expectedRuntimeHash: art.expectedRuntimeBytecodeSha256,
      artifactVerified: integrity.ok && !block,
      deploymentData,
      blockedReason: block,
    }
  }

  const factoryVersion = keccakId('LiquidityBuildingFactoryV1')
  const paramsTuple = {
    successFeeBps: LB_PROTOCOL_PARAMS.successFeeBps,
    strategyCeilingBps: LB_PROTOCOL_PARAMS.strategyCeilingBps,
    operatingCurveImpactBps: LB_PROTOCOL_PARAMS.operatingCurveImpactBps,
    hardCurveImpactBps: LB_PROTOCOL_PARAMS.hardCurveImpactBps,
    hardEffectiveDeviationBps: LB_PROTOCOL_PARAMS.hardEffectiveDeviationBps,
    decisionExecutionDriftBps: LB_PROTOCOL_PARAMS.decisionExecutionDriftBps,
    swapSlippageOperatingBps: LB_PROTOCOL_PARAMS.swapSlippageOperatingBps,
    hardSlippageBps: LB_PROTOCOL_PARAMS.hardSlippageBps,
    remainingBudgetEpochCapBps: LB_PROTOCOL_PARAMS.remainingBudgetEpochCapBps,
    totalBudgetEpochCapBps: LB_PROTOCOL_PARAMS.totalBudgetEpochCapBps,
    rolling24hTotalBudgetCapBps: LB_PROTOCOL_PARAMS.rolling24hTotalBudgetCapBps,
    maximumGasCostShareBps: LB_PROTOCOL_PARAMS.maximumGasCostShareBps,
    initialFinalityDepth: LB_PROTOCOL_PARAMS.initialFinalityDepth,
    maxSuccessfulExecutionsPerEpoch: LB_PROTOCOL_PARAMS.maxSuccessfulExecutionsPerEpoch,
  }
  const quotePolicies = [
    {
      asset: WBNB,
      decimals: 18,
      enabled: true,
      minimumGrossQuoteFloor: '43333333333333334',
      minimumQuoteReserve: '10833333333333333500',
      gasConversionMode: 0,
      gasConversionReference: '0x0000000000000000000000000000000000000000',
    },
  ]

  const drafts = [
    mk(
      'LiquidityBuildingExecutionMathV1',
      'Linked execution math library required by Program implementation.',
      [],
      [{ label: 'Role', value: 'Solidity linked library' }],
      [],
      null,
    ),
    mk(
      'LiquidityBuildingTreasuryFeeReceiverV1',
      'On-chain fee intake; beneficiary is MELEGA TREASURY WALLET.',
      [],
      [
        { label: 'Governor', value: DEPLOYER },
        { label: 'Beneficiary / Treasury', value: TREASURY },
      ],
      [DEPLOYER, TREASURY],
      null,
    ),
    mk(
      'LiquidityBuildingExecutionAuthorizerV1',
      'EIP-712 execution intent verifier. Authority is MELEGA DEPLOYER (Founder-signed model).',
      [],
      [{ label: 'Authority', value: DEPLOYER }],
      [DEPLOYER],
      null,
    ),
    mk(
      'LiquidityBuildingTreasuryFeeSinkV1',
      'Routes success fees to FeeReceiver contract.',
      ['LiquidityBuildingTreasuryFeeReceiverV1'],
      [{ label: 'Fee receiver', value: deployed.feeReceiver ?? 'Pending prior step' }],
      deployed.feeReceiver ? [deployed.feeReceiver] : null,
      deployed.feeReceiver ? null : 'Await FeeReceiver address from prior receipt',
    ),
    mk(
      'LiquidityBuildingProgramV1',
      'Program implementation (library-linked).',
      ['LiquidityBuildingExecutionMathV1'],
      [{ label: 'Linked library', value: deployed.math ?? 'Pending Math deploy' }],
      [],
      deployed.math ? null : 'Await ExecutionMath address from prior receipt',
      deployed.math,
    ),
    mk(
      'LiquidityBuildingFactoryV1',
      'Factory with successFeeBps locked at 1000 and Treasury fee sink wiring.',
      [
        'LiquidityBuildingProgramV1',
        'LiquidityBuildingExecutionAuthorizerV1',
        'LiquidityBuildingTreasuryFeeSinkV1',
      ],
      [
        { label: 'successFeeBps', value: '1000' },
        { label: 'Melega AMM factory', value: LB_MELEGA_AMM.factory },
        { label: 'Melega router', value: LB_MELEGA_AMM.router },
        { label: 'Implementation', value: deployed.program ?? 'Pending Program' },
        { label: 'Authorizer', value: deployed.authorizer ?? 'Pending Authorizer' },
        { label: 'Fee sink', value: deployed.feeSink ?? 'Pending FeeSink' },
      ],
      deployed.program && deployed.authorizer && deployed.feeSink
        ? [
            factoryVersion,
            deployed.program,
            LB_MELEGA_AMM.factory,
            LB_MELEGA_AMM.router,
            deployed.authorizer,
            deployed.feeSink,
            paramsTuple,
            quotePolicies,
          ]
        : null,
      deployed.program && deployed.authorizer && deployed.feeSink
        ? null
        : 'Await Program, Authorizer, and FeeSink addresses',
    ),
  ]

  const steps: LbDeployStep[] = drafts.map((d, i) => ({
    ...d,
    index: i + 1,
    total: drafts.length,
  }))

  return {
    artifactStatus: loaded.status,
    invalidReasons: loaded.invalidReasons,
    steps,
    economicReview,
  }
}

export function activeLbStep(steps: LbDeployStep[], completedStepIds: string[]): LbDeployStep | null {
  return steps.find((s) => !completedStepIds.includes(s.stepId)) ?? null
}
