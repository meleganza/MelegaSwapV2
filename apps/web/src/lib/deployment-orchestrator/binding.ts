/**
 * Binding facade — reuses existing bind helpers; does not invent addresses.
 */
import { isCreateTokenFactoryBound } from 'config/constants/createTokenFactoryDeployment'
import { isPublicFarmFactoryBound } from 'config/constants/publicFarmFactoryDeployment'
import { lbCoreContractsBound, readCanonicalLbAddresses } from 'config/constants/liquidityBuildingDeployment'
import {
  resolveProductionBinding,
  type BindingResult,
  type DeploymentBindingCandidate,
} from 'views/LiquidityStudio/liquidityBuilding/addresses'
import type { SubsystemId } from './types'

export function assessSubsystemBinding(id: SubsystemId): {
  bound: boolean
  detail: string
} {
  if (id === 'liquidity_builder') {
    const bound = lbCoreContractsBound(readCanonicalLbAddresses())
    return {
      bound,
      detail: bound ? 'LB core addresses bound in liquidityBuildingDeployment.ts' : 'LB addresses null — awaiting verified bind',
    }
  }
  if (id === 'create_token') {
    const bound = isCreateTokenFactoryBound()
    return {
      bound,
      detail: bound
        ? 'Create Token factoryAddress bound'
        : 'Create Token factoryAddress null — awaiting verified bind',
    }
  }
  const bound = isPublicFarmFactoryBound()
  return {
    bound,
    detail: bound
      ? 'Public Farm Factory address bound'
      : 'Public Farm Factory address null — awaiting verified bind',
  }
}

/** Delegate LB production binding to the existing fail-closed helper. */
export function bindLiquidityBuilderCandidate(candidate: DeploymentBindingCandidate): BindingResult {
  return resolveProductionBinding(candidate)
}
