import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

export const WRAPPER_DEPLOY_CHAIN_ID = 97
export const WRAPPER_DEPLOY_CHAIN_HEX = '0x61'

export const WRAPPER_CREATION_ARTIFACT_URL = '/testnet/MelegaSmartRouterWrapper.creation.json'

export const WRAPPER_CONSTRUCTOR = {
  underlyingRouter: BSC_TESTNET_ADDRESSES.router,
  treasuryIntake: BSC_TESTNET_ADDRESSES.treasuryIntake,
  marcoToken: BSC_TESTNET_ADDRESSES.marco,
  owner: '0xb6eeb3ab9695979f5b2ef6df4112e63212e33ee0',
  pricingRefLabel: 'D87_DEX_PRICING_RATIFIED',
  treasuryPolicyRefLabel: 'FSC-01',
} as const

export const WRAPPER_IMMUTABLE_EXPECT = {
  standardFeeBps: 30,
  buyMarcoFeeBps: 20,
} as const

export function txExplorerUrl(txHash: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/tx/${txHash}`
}

export function addressExplorerUrl(address: string) {
  return `${BSC_TESTNET_ADDRESSES.explorer}/address/${address}`
}
