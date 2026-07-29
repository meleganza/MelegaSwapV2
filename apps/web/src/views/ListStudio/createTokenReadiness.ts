/**
 * Create Token deployment readiness — honest measured state.
 * No fabricated factory address. No parallel token factory.
 */

export const CREATE_TOKEN_READINESS = {
  schema: 'melega.create-token-readiness.v1',
  capability: 'create_token',
  status: 'DEPLOYMENT_BLOCKED' as const,
  listFlag: 'LIST_CREATE_TOKEN_AVAILABLE',
  listFlagValue: false,
  chainId: 56,
  factoryAddress: null as string | null,
  factoryDeployed: false,
  executionEnabled: false,
  uiMode: 'readiness_explanation' as const,
  requiredModel: {
    supply: 'fixed',
    hiddenMint: false,
    arbitraryOwnerSupplyControl: false,
    concealedBlacklist: false,
    undisclosedTransferTax: false,
    ownershipDisclosure: 'required',
    fakeRenounceForbidden: true,
    verification: 'required_post_deploy',
  },
  blockerCode: 'CREATE_TOKEN_FACTORY_NOT_DEPLOYED',
  blockerSummary:
    'No verified canonical Melega token factory is deployed on BNB Smart Chain (chainId 56) in this repository. Create Token UI remains available for configuration review only; wallet deployment is blocked until a certified factory address and execution path are bound.',
  nextActions: [
    'Deploy certified fixed-supply factory from the deployment package',
    'Verify contract on BscScan',
    'Bind factory address in List create-token readiness config',
    'Flip LIST_CREATE_TOKEN_AVAILABLE only after certification',
  ],
} as const

export type CreateTokenReadiness = typeof CREATE_TOKEN_READINESS

export function getCreateTokenReadiness(): CreateTokenReadiness {
  return CREATE_TOKEN_READINESS
}
