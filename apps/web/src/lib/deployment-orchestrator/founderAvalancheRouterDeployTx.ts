/**
 * Avalanche V2 Router Founder deploy transaction builder — certified bytecode + constructor encoding.
 * No KMS. No server signer. No automatic broadcast.
 */
import { Interface } from '@ethersproject/abi'
import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'
import {
  assessAvaxRouterArtifactIntegrity,
  AVAX_ROUTER_ALIAS,
  AVAX_ROUTER_CHAIN_ID,
  AVAX_ROUTER_CONTRACT,
  AVAX_ROUTER_FACTORY,
  AVAX_ROUTER_WAVAX,
  keccakAvaxRouterCreationBytecode,
  loadCertifiedAvaxRouterArtifacts,
} from './founderAvalancheRouterArtifacts'

export type AvaxRouterHumanField = { label: string; value: string }

export type AvaxRouterDeployStep = {
  index: number
  total: number
  stepId: string
  contractName: string
  artifactAlias: string
  purpose: string
  humanFields: AvaxRouterHumanField[]
  constructorArgs: Array<{ name: string; type: string; value: string }>
  creationBytecodeHash: string | null
  creationBytecodeSha256: string | null
  expectedRuntimeHash: string
  artifactVerified: boolean
  deploymentData: string | null
  blockedReason: string | null
  status: 'READY_FOR_FOUNDER_SIGNATURE' | 'BLOCKED'
}

export function encodeAvaxRouterConstructor(
  constructorInputs: unknown[],
  values: unknown[],
): string {
  const iface = new Interface([{ type: 'constructor', inputs: constructorInputs as any }])
  return iface.encodeDeploy(values)
}

export function buildAvaxRouterEconomicReviewFields(): AvaxRouterHumanField[] {
  return [
    { label: 'Contract', value: `${AVAX_ROUTER_ALIAS} · ${AVAX_ROUTER_CONTRACT}` },
    { label: 'Network', value: 'Avalanche C-Chain' },
    { label: 'Chain ID', value: String(AVAX_ROUTER_CHAIN_ID) },
    { label: 'Factory', value: AVAX_ROUTER_FACTORY },
    { label: 'WAVAX', value: AVAX_ROUTER_WAVAX },
    { label: 'Deployer', value: `MELEGA DEPLOYER · ${AUTHORIZED_MELEGA_DEPLOYER}` },
    { label: 'Authority', value: 'Founder browser wallet only · no KMS · no server signer' },
    { label: 'Proxy', value: 'None' },
    { label: 'Mutable authority', value: 'None' },
    { label: 'Protocol fee in Router', value: 'None (Smart Swap fee remains application-layer)' },
  ]
}

export function buildAvalancheV2RouterDeployStep(): {
  artifactStatus: ReturnType<typeof loadCertifiedAvaxRouterArtifacts>['status']
  invalidReasons: string[]
  step: AvaxRouterDeployStep | null
  economicReview: AvaxRouterHumanField[]
  statusLabels: string[]
} {
  const loaded = loadCertifiedAvaxRouterArtifacts()
  const economicReview = buildAvaxRouterEconomicReviewFields()
  const art = loaded.artifacts[AVAX_ROUTER_CONTRACT]
  const gate = assessAvaxRouterArtifactIntegrity(art)

  let deploymentData: string | null = null
  let blockedReason: string | null = null
  if (!gate.ok || !art) {
    blockedReason = gate.mismatches[0] || 'Avalanche V2 Router certified artifact invalid'
  } else {
    const encoded = encodeAvaxRouterConstructor(art.constructorInputs, [
      AVAX_ROUTER_FACTORY,
      AVAX_ROUTER_WAVAX,
    ])
    deploymentData = `${art.creationBytecode}${encoded.slice(2)}`
  }

  const ready = gate.ok && !!deploymentData && loaded.status === 'ARTIFACTS_VALID'
  const step: AvaxRouterDeployStep | null = art
    ? {
        index: 1,
        total: 1,
        stepId: AVAX_ROUTER_CONTRACT,
        contractName: AVAX_ROUTER_CONTRACT,
        artifactAlias: AVAX_ROUTER_ALIAS,
        purpose:
          'Permanent Melega-compatible V2 Router on Avalanche C-Chain — binds to existing Factory; Avalanche remains PREPARING until separate activation',
        humanFields: [
          { label: 'Network', value: 'Avalanche C-Chain' },
          { label: 'Chain ID', value: String(AVAX_ROUTER_CHAIN_ID) },
          { label: 'Factory', value: AVAX_ROUTER_FACTORY },
          { label: 'WAVAX', value: AVAX_ROUTER_WAVAX },
          { label: 'Deployer', value: AUTHORIZED_MELEGA_DEPLOYER },
          { label: 'Artifact', value: ready ? 'Loaded' : 'Invalid' },
          {
            label: 'Artifact hash',
            value: ready ? 'Verified' : gate.mismatches[0] || 'Failed',
          },
        ],
        constructorArgs: [
          { name: '_factory', type: 'address', value: AVAX_ROUTER_FACTORY },
          { name: '_WETH', type: 'address', value: AVAX_ROUTER_WAVAX },
        ],
        creationBytecodeHash: gate.creationBytecodeHash,
        creationBytecodeSha256: gate.creationBytecodeSha256,
        expectedRuntimeHash: art.expectedRuntimeBytecodeSha256 || '',
        artifactVerified: gate.ok,
        deploymentData,
        blockedReason,
        status: ready ? 'READY_FOR_FOUNDER_SIGNATURE' : 'BLOCKED',
      }
    : null

  return {
    artifactStatus: loaded.status,
    invalidReasons: loaded.invalidReasons,
    step,
    economicReview,
    statusLabels: loaded.statusLabels,
  }
}

export function keccakDeploymentData(deploymentData: string): string {
  return keccakAvaxRouterCreationBytecode(deploymentData)
}
