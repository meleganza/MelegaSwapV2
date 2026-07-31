/**
 * Subsystem adapters — compose existing readiness SSOTs. No duplicated gate math.
 */
import {
  LB_CANONICAL_DEPLOYED_ADDRESSES,
  lbCoreContractsBound,
  readCanonicalLbAddresses,
} from 'config/constants/liquidityBuildingDeployment'
import { assessExecutionReadiness } from 'views/LiquidityStudio/liquidityBuilding/addresses'
import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { getCreateTokenMachineReadableReadiness } from 'views/ListStudio/createTokenReadiness'
import { PUBLIC_FARM_FACTORY_CAPABILITY } from 'views/FarmsStudio/modules/publicFarmFactoryCapability'
import {
  getPublicFarmFactoryDeployment,
  isPublicFarmFactoryBound,
} from 'config/constants/publicFarmFactoryDeployment'
import { getCanaryStatus } from './canary'
import { computeSubsystemState } from './computeState'
import type { SubsystemSnapshot } from './types'

function sanitizeBlockers(raw: string[]): string[] {
  // Human-readable blockers only — strip stack-like noise.
  return raw
    .map((b) => b.replace(/\s+/g, ' ').trim())
    .filter((b) => b.length > 0 && !b.includes('at ') && !b.includes('Error:'))
}

export function snapshotLiquidityBuilder(authorityPresent: boolean, now: string): SubsystemSnapshot {
  const addrs = readCanonicalLbAddresses()
  const exec = assessExecutionReadiness(addrs)
  const bound = lbCoreContractsBound(addrs)
  const deployed = bound // no separate deploy tx field while null
  const verified = bound // verification implied only after bind of verified registry
  const canary = getCanaryStatus('liquidity_builder')
  const blockers = sanitizeBlockers([
    ...(exec.ready ? [] : ['Missing factory address (Liquidity Builder core contracts unbound)']),
    ...(authorityPresent ? [] : ['Missing deploy authorization for Liquidity Builder']),
    ...(!authorityPresent && !bound ? ['Missing KMS / RPC / BscScan keys for LB track'] : []),
  ])

  const state = computeSubsystemState({
    packageReady: true,
    authorityPresent,
    deployed,
    verified,
    bound,
    runtimeReady: exec.ready,
    canaryPassed: canary === 'Passed',
  })

  return {
    id: 'liquidity_builder',
    label: 'Liquidity Builder',
    state,
    lanes: {
      contracts: true,
      deploy: deployed,
      verify: verified,
      bind: bound,
      frontend: bound,
      runtime: exec.ready,
      canary,
    },
    readiness: {
      source: 'assessExecutionReadiness + LB_CANONICAL_DEPLOYED_ADDRESSES',
      execution: exec,
      reason: exec.reason,
    },
    blockers,
    addresses: {
      lbFactory: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFactory,
      lbAuthorizer: LB_CANONICAL_DEPLOYED_ADDRESSES.lbAuthorizer,
      lbFeeSink: LB_CANONICAL_DEPLOYED_ADDRESSES.lbFeeSink,
      programAddress: LB_CANONICAL_DEPLOYED_ADDRESSES.programAddress,
    },
    packagePath: 'contracts/liquidity-building/',
    dependsOn: null,
    sequence: 1,
    updatedAt: now,
  }
}

export function snapshotCreateToken(authorityPresent: boolean, now: string): SubsystemSnapshot {
  const ct = getCreateTokenMachineReadableReadiness()
  const dep = CREATE_TOKEN_CANONICAL_DEPLOYMENT
  const bound = isCreateTokenFactoryBound()
  const deployed = Boolean(dep.deploymentTx || dep.factoryAddress)
  const verified = Boolean(dep.verified && dep.factoryAddress)
  const canary = getCanaryStatus('create_token')
  const blockers = sanitizeBlockers([
    ...ct.blockers,
    ...(authorityPresent ? [] : ['Missing deploy authorization for Create Token']),
  ])

  const state = computeSubsystemState({
    packageReady: true,
    authorityPresent,
    deployed,
    verified,
    bound,
    runtimeReady: ct.status === 'READY',
    canaryPassed: canary === 'Passed',
  })

  return {
    id: 'create_token',
    label: 'Create Token',
    state,
    lanes: {
      contracts: true,
      deploy: deployed,
      verify: verified,
      bind: bound,
      frontend: bound,
      runtime: ct.status === 'READY',
      canary,
    },
    readiness: {
      source: 'getCreateTokenMachineReadableReadiness',
      status: ct.status,
      factoryAddress: ct.factoryAddress,
      uiState: ct.uiState,
    },
    blockers,
    addresses: {
      factoryAddress: dep.factoryAddress,
      feeRecipient: dep.feeRecipient,
    },
    packagePath: 'contracts/create-token/',
    dependsOn: 'liquidity_builder',
    sequence: 2,
    updatedAt: now,
  }
}

export function snapshotPublicFarmFactory(authorityPresent: boolean, now: string): SubsystemSnapshot {
  const dep = getPublicFarmFactoryDeployment()
  const cap = PUBLIC_FARM_FACTORY_CAPABILITY
  const bound = isPublicFarmFactoryBound()
  const deployed = Boolean(dep.deploymentTx || dep.factoryAddress)
  const verified = Boolean(dep.verified && dep.factoryAddress)
  const canary = getCanaryStatus('public_farm_factory')
  const blockers = sanitizeBlockers([
    ...cap.deployment.blockers,
    ...(bound ? [] : ['Missing factory address (Public Farm Factory unbound)']),
    ...(authorityPresent ? [] : ['Missing deploy authorization for Public Farm Factory']),
    ...(dep.verified ? [] : ['Missing BscScan verification']),
  ])

  const state = computeSubsystemState({
    packageReady: Boolean(cap.contracts.package),
    authorityPresent,
    deployed,
    verified,
    bound,
    runtimeReady: cap.readiness.walletCanExecute === true,
    canaryPassed: canary === 'Passed',
  })

  return {
    id: 'public_farm_factory',
    label: 'Public Farm Factory',
    state,
    lanes: {
      contracts: true,
      deploy: deployed,
      verify: verified,
      bind: bound,
      frontend: bound,
      runtime: cap.readiness.walletCanExecute === true,
      canary,
    },
    readiness: {
      source: 'PUBLIC_FARM_FACTORY_CAPABILITY + publicFarmFactoryDeployment',
      outcome: cap.outcome,
      walletCanExecute: cap.readiness.walletCanExecute,
      deploymentStatus: cap.deployment.status,
    },
    blockers,
    addresses: {
      factoryAddress: dep.factoryAddress,
      publicFarmFactory: cap.contracts.publicFarmFactory,
    },
    packagePath: dep.packagePath,
    dependsOn: 'create_token',
    sequence: 3,
    updatedAt: now,
  }
}
