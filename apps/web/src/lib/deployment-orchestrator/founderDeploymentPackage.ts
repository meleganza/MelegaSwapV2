/**
 * Package-specific Founder deployment chain gates.
 * Required chain is derived from the selected deployment package — never global BNB-only.
 */
import { FOUNDER_DEPLOY_CHAIN_ID } from './founderDeployer'
import { AVAX_ROUTER_CHAIN_ID } from './founderAvalancheRouterArtifacts'

export type FounderDeploymentPackageId = 'avalanche_v2_router' | 'bnb_founder_packages'

export type FounderDeploymentPackageSelection = {
  packageId: FounderDeploymentPackageId
  /** Chain the Founder wallet must use for the selected package. */
  requiredChainId: number
  requiredNetworkLabel: string
  switchNetworkCopy: string
  /** True when URL/query selects Avalanche V2 Router as the active package. */
  isAvalancheRouterPackage: boolean
}

const BNB_SELECTION: FounderDeploymentPackageSelection = {
  packageId: 'bnb_founder_packages',
  requiredChainId: FOUNDER_DEPLOY_CHAIN_ID,
  requiredNetworkLabel: 'BNB Smart Chain',
  switchNetworkCopy: 'Switch to BNB Smart Chain',
  isAvalancheRouterPackage: false,
}

const AVAX_SELECTION: FounderDeploymentPackageSelection = {
  packageId: 'avalanche_v2_router',
  requiredChainId: AVAX_ROUTER_CHAIN_ID,
  requiredNetworkLabel: 'Avalanche C-Chain',
  switchNetworkCopy: 'Switch to Avalanche C-Chain',
  isAvalancheRouterPackage: true,
}

/**
 * Resolve the active Founder deployment package from the route query `chain`.
 * `?chain=avalanche` → Avalanche V2 Router (43114).
 * Otherwise → BNB Founder packages (LB / Create Token / Public Farm) on 56.
 */
export function resolveFounderDeploymentPackage(
  chainQuery: string | string[] | undefined | null,
): FounderDeploymentPackageSelection {
  const raw = Array.isArray(chainQuery) ? chainQuery[0] : chainQuery
  const normalized = (raw || '').trim().toLowerCase()
  if (normalized === 'avalanche' || normalized === 'avax' || normalized === 'avalanche1') {
    return AVAX_SELECTION
  }
  return BNB_SELECTION
}

export function isFounderPackageChainMatch(
  selection: FounderDeploymentPackageSelection,
  walletChainId: number | null | undefined,
): boolean {
  return walletChainId != null && walletChainId === selection.requiredChainId
}
