/**
 * Create Farm contract capability — factual readiness assessment.
 *
 * MasterChef.add(allocPoint, lpToken, withUpdate) is restricted to the contract
 * owner (onlyOwner). There is no permissionless farm factory deployed for
 * Melega DEX, so wallet-initiated "Create Farm" execution cannot be honestly
 * offered yet. This mirrors the intended create-farm-contract-capability.json
 * content as a typed const so the UI and any tooling read the same source.
 */

export type CreateFarmCapabilityOutcome =
  | 'A_PERMISSIONLESS_FACTORY_AVAILABLE'
  | 'B_FACTORY_DEPLOYMENT_REQUIRED'
  | 'C_ADMIN_ONLY_MASTERBUILDER'

/**
 * @deprecated Prefer PUBLIC_FARM_FACTORY_CAPABILITY — Public Farm Factory supersedes
 * the admin-only MasterBuilder create path for public users. Kept for historical
 * evidence references; runtime Create Farm UI reads publicFarmFactoryCapability.
 */
export const CREATE_FARM_CONTRACT_CAPABILITY = {
  schema: 'melega.dex.v1.create-farm-contract-capability',
  outcome: 'B_FACTORY_DEPLOYMENT_REQUIRED' as CreateFarmCapabilityOutcome,
  summary:
    'Public Create Farm execution is blocked pending PublicFarmFactoryV1 deployment. MasterChef.add() / MasterBuilder remain protocol-only and are never exposed publicly.',
  blockerLabel: 'Create Farm execution blocked — Public Farm Factory deployment required',
  facts: [
    'PublicFarmFactoryV1 package exists under contracts/public-farm-factory/ but is not deployed.',
    'MasterChef.add(allocPoint, lpToken, withUpdate) remains owner-gated and is not a public Create Farm path.',
    'MARCO reward farms stay protocol-managed and are rejected by the Public Farm Factory.',
  ],
  readiness: {
    walletCanExecute: false,
    requiresAdminAction: false,
    requiresFactoryDeployment: true,
  },
  contracts: {
    masterChef: 'MasterChef.add() — protocol-only (not exposed)',
    publicFarmFactory: null as string | null,
  },
} as const

export type CreateFarmContractCapability = typeof CREATE_FARM_CONTRACT_CAPABILITY
