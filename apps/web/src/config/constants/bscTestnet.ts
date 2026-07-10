import { ChainId } from '@pancakeswap/sdk'

/** Verified BNB Testnet (chain 97) addresses — Pancake V2 periphery + Treasury Runtime R751. */
export const BSC_TESTNET_CHAIN_ID = ChainId.BSC_TESTNET

export const BSC_TESTNET_ADDRESSES = {
  chainId: 97,
  chainName: 'BNB Testnet',
  router: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  factory: '0x6725F303b657a9451d8BA641348b6761A6CC7a17',
  wbnb: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  marco: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  treasuryIntake: '0xe674b1d925d79f5A0053e40cC7cdED7841AD4164',
  initCodeHash: '0x57224589c67f3f30a6b0d7ffa1c4d31a992c0afd7db71bd78779ba44415c0fba',
  explorer: 'https://testnet.bscscan.com',
  rpcUrls: [
    'https://data-seed-prebsc-1-s1.binance.org:8545',
    'https://data-seed-prebsc-2-s1.binance.org:8545',
    'https://data-seed-prebsc-1-s3.binance.org:8545',
  ],
  attestation: {
    router: 'PancakeSwap V2 Router — developer.pancakeswap.finance/contracts/v2/addresses',
    treasury: 'Treasury Runtime R751 — treasury.melega.ai/registry/treasury/index.json',
    marco: 'Treasury Runtime R744B',
  },
} as const
