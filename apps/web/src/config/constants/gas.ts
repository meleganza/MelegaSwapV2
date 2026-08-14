export enum GAS_PRICE {
  default = '5',
  fast = '6',
  instant = '7',
  testnet = '10',
}

// Static wei values avoid loading ethers' unit parser in the global Redux
// bootstrap solely to initialize the default gas setting.
export const GAS_PRICE_GWEI = {
  rpcDefault: 'rpcDefault',
  default: '5000000000',
  fast: '6000000000',
  instant: '7000000000',
  testnet: '10000000000',
} as const
