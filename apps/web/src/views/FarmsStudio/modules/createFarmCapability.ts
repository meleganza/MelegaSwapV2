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

export const CREATE_FARM_CONTRACT_CAPABILITY = {
  schema: 'melega.dex.v1.create-farm-contract-capability',
  outcome: 'C_ADMIN_ONLY_MASTERBUILDER' as CreateFarmCapabilityOutcome,
  summary:
    'Create Farm execution is blocked. MasterChef.add() is owner-gated and there is no permissionless farm factory deployed for Melega DEX.',
  blockerLabel: 'Create Farm execution blocked — protocol admin / factory deployment required',
  facts: [
    'MasterChef.add(allocPoint, lpToken, withUpdate) is restricted to the contract owner (onlyOwner).',
    'No permissionless CreateFarmFactory contract is deployed on BNB Chain for Melega DEX.',
    'Farm creation currently requires a protocol admin transaction or a future factory deployment.',
  ],
  readiness: {
    walletCanExecute: false,
    requiresAdminAction: true,
    requiresFactoryDeployment: false,
  },
  contracts: {
    masterChef: 'MasterChef.add() — onlyOwner',
  },
} as const

export type CreateFarmContractCapability = typeof CREATE_FARM_CONTRACT_CAPABILITY
