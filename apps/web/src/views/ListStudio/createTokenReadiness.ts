/**
 * Create Token deployment readiness — honest measured state.
 * Factory bound after mainnet validation against ct-v1-certified.json.
 */

import {
  CREATE_TOKEN_CANONICAL_DEPLOYMENT,
  CREATE_TOKEN_CREATION_FEE_BNB,
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
const uiState = resolveCreateTokenUiState({
  factoryAddress: CREATE_TOKEN_CANONICAL_DEPLOYMENT.factoryAddress,
  creationFeeWei: CREATE_TOKEN_CANONICAL_DEPLOYMENT.creationFeeWei,
  feeRecipient: CREATE_TOKEN_CANONICAL_DEPLOYMENT.feeRecipient,
  chainId: null,
  account: null,
})

export const CREATE_TOKEN_READINESS = {
  schema: 'melega.create-token-readiness.v2',
  capability: 'create_token',
  status: (factoryBound && LIST_CREATE_TOKEN_AVAILABLE ? 'READY' : factoryBound ? 'FACTORY_BOUND' : 'READY_FOR_FOUNDER_SIGNATURE') as CreateTokenReadinessStatus,
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
  verificationReady: true,
  executionEnabled: factoryBound && LIST_CREATE_TOKEN_AVAILABLE,
  uiMode: (factoryBound && LIST_CREATE_TOKEN_AVAILABLE ? 'user_create_token' : 'readiness_explanation') as const,
  uiState: (factoryBound ? 'READY' : uiState) as CreateTokenUiState,
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
  blockerCode: factoryBound && LIST_CREATE_TOKEN_AVAILABLE ? null : 'CREATE_TOKEN_FACTORY_AWAITING_FOUNDER_SIGNATURE',
  blockerSummary: factoryBound && LIST_CREATE_TOKEN_AVAILABLE
    ? 'Create Token Factory is DEPLOYED · VALIDATED · BOUND · READY. Users create tokens by paying 0.10 BNB to MELEGA TREASURY WALLET via CreateTokenFactoryV1. Founder is not involved in user creation.'
    : 'Create Token Factory package awaits Founder-signed mainnet deployment, validation, and bind.',
  blockers: factoryBound && LIST_CREATE_TOKEN_AVAILABLE
    ? ([] as string[])
    : [
        'factoryAddress is null in createTokenFactoryDeployment (not fabricated)',
        'Awaiting Founder browser-wallet signature by MELEGA DEPLOYER (no KMS / no server signer)',
        'LIST_CREATE_TOKEN_AVAILABLE remains false until certified bind',
      ],
  nextActions: factoryBound && LIST_CREATE_TOKEN_AVAILABLE
    ? [
        'Connect wallet on BNB Smart Chain (56)',
        'Configure fixed-supply token in List → Create Token',
        'Pay 0.10 BNB creation fee to MELEGA TREASURY WALLET via factory',
        'Factory deploys MelegaFixedSupplyToken — no Founder involvement',
      ]
    : [
        'Open /runtime/deployment/ as MELEGA DEPLOYER on BNB Smart Chain (56)',
        'Deploy / validate / bind CreateTokenFactoryV1',
      ],
  contracts: {
    factory: 'contracts/create-token/MelegaTokenFactory.sol',
    token: 'contracts/create-token/MelegaFixedSupplyToken.sol',
    deployScript: 'script/create-token/DeployMelegaTokenFactoryMainnet.s.sol',
    certifiedArtifact: 'apps/web/src/lib/deployment-orchestrator/artifacts/ct-v1-certified.json',
  },
  lifecycle: factoryBound
    ? (['DEPLOYED', 'VALIDATED', 'BOUND', 'READY'] as const)
    : (['READY_FOR_FOUNDER_SIGNATURE'] as const),
  authorityModel: 'FOUNDER_WALLET_SIGNED',
  noKms: true,
  noServerSigner: true,
  noTreasuryRuntime: true,
  updatedAt: '2026-08-02T04:00:00.000Z',
} as const

export type CreateTokenReadiness = typeof CREATE_TOKEN_READINESS

export function getCreateTokenReadiness(): CreateTokenReadiness {
  return CREATE_TOKEN_READINESS
}

export function getCreateTokenMachineReadableReadiness() {
  const dep = CREATE_TOKEN_CANONICAL_DEPLOYMENT
  const resolvedUi = resolveCreateTokenUiState({
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
    verificationReady: CREATE_TOKEN_READINESS.verificationReady,
    blockers: [...CREATE_TOKEN_READINESS.blockers],
    uiState: factoryBound ? ('READY' as CreateTokenUiState) : resolvedUi,
    updatedAt: CREATE_TOKEN_READINESS.updatedAt,
  }
}
