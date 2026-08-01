import { isCreateTokenFactoryBound } from 'config/constants/createTokenFactoryDeployment'
import { lbCoreContractsBound, readCanonicalLbAddresses } from 'config/constants/liquidityBuildingDeployment'
import { isPublicFarmFactoryBound } from 'config/constants/publicFarmFactoryDeployment'
import type { SubsystemId } from './types'

/** Sequential gate: later systems wait until prior is bound. */
export function isSubsystemReadyForFounderDeploy(id: SubsystemId): boolean {
  if (id === 'liquidity_builder') {
    return !lbCoreContractsBound(readCanonicalLbAddresses())
  }
  if (id === 'create_token') {
    return lbCoreContractsBound(readCanonicalLbAddresses()) && !isCreateTokenFactoryBound()
  }
  return isCreateTokenFactoryBound() && !isPublicFarmFactoryBound()
}

export function nextFounderDeployTarget(): SubsystemId | null {
  if (isSubsystemReadyForFounderDeploy('liquidity_builder')) return 'liquidity_builder'
  if (isSubsystemReadyForFounderDeploy('create_token')) return 'create_token'
  if (isSubsystemReadyForFounderDeploy('public_farm_factory')) return 'public_farm_factory'
  return null
}
