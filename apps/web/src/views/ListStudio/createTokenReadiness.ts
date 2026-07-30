/**
 * Create Token deployment readiness — honest measured state.
 * No fabricated factory address. No parallel token factory.
 */

import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_BNB,
  CREATE_TOKEN_CREATION_FEE_WEI,
  CREATE_TOKEN_FACTORY_CHAIN_ID,
  isCreateTokenFactoryBound,
} from 'config/constants/createTokenFactoryDeployment'
import { LIST_CREATE_TOKEN_AVAILABLE } from './listTokens'
import { resolveCreateTokenUiState, type CreateTokenUiState } from './createToken/createTokenTx'

export type CreateTokenReadinessStatus =
  | 'DEPLOYMENT_BLOCKED'
  | 'FACTORY_BOUND'
  | 'READY'
  | 'CONFIGURATION_INVALID'

export const CREATE_TOKEN_READINESS = {
  schema: 'melega.create-token-readiness.v2',
  capability: 'create_token',
  status: 'DEPLOYMENT_BLOCKED' as CreateTokenReadinessStatus,
  listFlag: 'LIST_CREATE_TOKEN_AVAILABLE',
  listFlagValue: LIST_CREATE_TOKEN_AVAILABLE,
  chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
  factoryAddress: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
  factoryDeployed: isCreateTokenFactoryBound(),
  bytecodePresent: false,
  creationFeeConfigured: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei != null,
  feeRecipientConfigured:
    CREATE_TOKEN_CANONICAL_DEPLOYMENT.feeRecipient.toLowerCase() ===
    '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b',
  deploymentAuthorityReady: false,
  verificationReady: false,
  executionEnabled: false,
  uiMode: 'readiness_explanation' as const,
  uiState: 'FACTORY_NOT_DEPLOYED' as CreateTokenUiState,
  requiredModel: {
    supply: 'fixed',
    hiddenMint: false,
    arbitraryOwnerSupplyControl: false,
    concealedBlacklist: false,
    undisclosedTransferTax: false,
    ownershipDisclosure: 'required',
    fakeRenounceForbidden: true,
    verification: 'required_post_deploy',
    upgradeability: false,
    pause: false,
    tax: false,
  },
  feeRecipient: CREATE_TOKEN_CANONICAL_DEPLOYMENT.feeRecipient,
  creationFeeWei: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei,
  creationFeeBnb: CREATE_TOKEN_CREATION_FEE_BNB,
  creationFeeDecision: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeDecision,
  blockerCode: 'CREATE_TOKEN_FACTORY_NOT_DEPLOYED',
  blockerSummary:
    'Factory deployment pending. Creation fee is Founder-approved (0.05 BNB). Canonical MelegaTokenFactory + MelegaFixedSupplyToken are implemented and locally tested, but no verified mainnet factory address is bound. Create Token remains configuration/review only until authorized BSC mainnet deployment.',
  blockers: [
    'production deployment authority unavailable (MAINNET_DEPLOYER / CT_MAINNET_DEPLOY_AUTHORIZED / BNB_MAINNET_RPC_URL / BSCSCAN_API_KEY)',
    'factoryAddress is null in createTokenFactoryDeployment',
    'LIST_CREATE_TOKEN_AVAILABLE remains false until certified bind',
  ],
  nextActions: [
    `Export CT_CREATION_FEE_WEI=${CREATE_TOKEN_CREATION_FEE_WEI} CT_FEE_FOUNDER_APPROVED=1 CT_FEE_RECIPIENT=${CREATE_TOKEN_CANONICAL_DEPLOYMENT.feeRecipient}`,
    'Export MAINNET_DEPLOYER + BNB_MAINNET_RPC_URL + BSCSCAN_API_KEY',
    'Set CT_MAINNET_DEPLOY_AUTHORIZED=1 and broadcast DeployMelegaTokenFactoryMainnet',
    'Verify factory on BscScan',
    'Bind factoryAddress in createTokenFactoryDeployment.ts (fee already approved)',
    'Flip LIST_CREATE_TOKEN_AVAILABLE only after certification',
  ],
  contracts: {
    factory: 'contracts/create-token/MelegaTokenFactory.sol',
    token: 'contracts/create-token/MelegaFixedSupplyToken.sol',
    deployScript: 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol',
  },
  updatedAt: '2026-07-30T13:00:00.000Z',
} as const

export type CreateTokenReadiness = typeof CREATE_TOKEN_READINESS

export function getCreateTokenReadiness(): CreateTokenReadiness {
  return CREATE_TOKEN_READINESS
}

export function getCreateTokenMachineReadableReadiness() {
  const dep = CREATE_TOKEN_CANONICAL_DEPLOYMENT
  const uiState = resolveCreateTokenUiState({
    factoryAddress: dep.factoryAddress,
    creationFeeWei: dep.creationFeeWei,
    feeRecipient: dep.feeRecipient,
    chainId: null,
    account: null,
  })
  return {
    status: CREATE_TOKEN_READINESS.status,
    chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
    factoryAddress: dep.factoryAddress,
    bytecodePresent: false,
    creationFeeConfigured: dep.creationFeeWei != null,
    feeRecipientConfigured: Boolean(dep.feeRecipient),
    creationFeeDecision: dep.creationFeeDecision,
    creationFeeWei: dep.creationFeeWei,
    deploymentAuthorityReady: false,
    verificationReady: false,
    blockers: [...CREATE_TOKEN_READINESS.blockers],
    uiState,
    updatedAt: CREATE_TOKEN_READINESS.updatedAt,
  }
}
