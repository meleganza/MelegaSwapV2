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
  | 'READY_FOR_FOUNDER_SIGNATURE'
  | 'FACTORY_BOUND'
  | 'READY'
  | 'CONFIGURATION_INVALID'

const factoryBound = isCreateTokenFactoryBound()

export const CREATE_TOKEN_READINESS = {
  schema: 'melega.create-token-readiness.v2',
  capability: 'create_token',
  status: (factoryBound
    ? 'FACTORY_BOUND'
    : 'READY_FOR_FOUNDER_SIGNATURE') as CreateTokenReadinessStatus,
  listFlag: 'LIST_CREATE_TOKEN_AVAILABLE',
  listFlagValue: LIST_CREATE_TOKEN_AVAILABLE,
  chainId: CREATE_TOKEN_FACTORY_CHAIN_ID,
  factoryAddress: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
  factoryDeployed: factoryBound,
  bytecodePresent: true,
  creationFeeConfigured: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei != null,
  feeRecipientConfigured:
    CREATE_TOKEN_CANONICAL_DEPLOYMENT.feeRecipient.toLowerCase() ===
    '0xb6436ef4c7f76be0f26c0c5c9db72f2689abf65b',
  deploymentAuthorityReady: true,
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
  blockerCode: 'CREATE_TOKEN_FACTORY_AWAITING_FOUNDER_SIGNATURE',
  blockerSummary:
    'Create Token Factory package is certified and ready for Founder-signed mainnet deployment via MELEGA DEPLOYER on /runtime/deployment/. factoryAddress remains null. User token creation stays disabled until deploy, validate, and bind.',
  blockers: [
    'factoryAddress is null in createTokenFactoryDeployment (not fabricated)',
    'Awaiting Founder browser-wallet signature by MELEGA DEPLOYER (no KMS / no server signer)',
    'LIST_CREATE_TOKEN_AVAILABLE remains false until certified bind',
  ],
  nextActions: [
    'Open /runtime/deployment/ as MELEGA DEPLOYER on BNB Smart Chain (56)',
    'Review CreateTokenFactoryV1 constructor: feeRecipient=MELEGA TREASURY WALLET, creationFee=0.10 BNB',
    'Estimate gas · Ready for Founder signature · Deploy Create Token Factory',
    'Validate receipt + masked runtime hash, then bind factoryAddress',
    'Flip LIST_CREATE_TOKEN_AVAILABLE only after certification',
  ],
  contracts: {
    factory: 'contracts/create-token/MelegaTokenFactory.sol',
    token: 'contracts/create-token/MelegaFixedSupplyToken.sol',
    deployScript: 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol',
    certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/ct-v1-certified.json',
  },
  authorityModel: 'FOUNDER_WALLET_SIGNED',
  noKms: true,
  noServerSigner: true,
  noTreasuryRuntime: true,
  updatedAt: '2026-08-02T00:00:00.000Z',
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
    bytecodePresent: true,
    creationFeeConfigured: dep.creationFeeWei != null,
    feeRecipientConfigured: Boolean(dep.feeRecipient),
    creationFeeDecision: dep.creationFeeDecision,
    creationFeeWei: dep.creationFeeWei,
    deploymentAuthorityReady: true,
    verificationReady: false,
    blockers: [...CREATE_TOKEN_READINESS.blockers],
    uiState,
    updatedAt: CREATE_TOKEN_READINESS.updatedAt,
  }
}
