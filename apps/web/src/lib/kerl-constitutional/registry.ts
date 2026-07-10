import { BSC_TESTNET_ADDRESSES } from 'config/constants/bscTestnet'

/** Canonical KRMP testnet registry — KERL-owned routing truth for chain 97. */
export const KRMP_TESTNET_CHAIN_ID = 97

export const KRMP_TESTNET_REGISTRY = {
  chainId: KRMP_TESTNET_CHAIN_ID,
  wrapperAddress: '0x9D2451b30102B098570bfCeae0E8b8C9Fd2bb2Db',
  treasuryCollector: BSC_TESTNET_ADDRESSES.treasuryIntake,
  underlyingRouter: BSC_TESTNET_ADDRESSES.router,
  marco: BSC_TESTNET_ADDRESSES.marco,
  wbnb: BSC_TESTNET_ADDRESSES.wbnb,
  usdt: BSC_TESTNET_ADDRESSES.usdt,
  routingDecisionSnapshotRef: 'kerl-genesis-testnet-routing-snapshot-001',
  kerlPackageId: 'kerl-genesis-testnet-handoff-001',
  correlationId: 'corr:genesis:testnet:swap:97:2026-07-03',
  registryUrl: 'https://kiri.melega.ai/public/registry/melega-dex/smart-router-wrapper-v2.json',
  truthStatus: 'SMART_ROUTER_TESTNET_FROZEN',
} as const
