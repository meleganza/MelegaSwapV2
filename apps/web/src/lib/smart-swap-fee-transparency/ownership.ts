import { MELEGA_TREASURY_WALLET_LABEL } from 'config/dexEconomicAuthority'

export const SMART_SWAP_FEE_TRANSPARENCY_OWNERSHIP = {
  module: 'SMART_SWAP_MODULE_004_FEE_TRANSPARENCY',
  owns: ['fee presentation', 'economic visibility copy', 'transparency flow UI'],
  doesNotOwn: [
    'fee calculation',
    'fee mutation',
    'D87 fee rules',
    'FSC-01 split',
    'Treasury Runtime settlement',
    'Treasury Runtime execution',
    'KERL mint / allocate / reward simulation',
    'custody',
    'signing',
    'swap execution',
  ],
  feeAuthority: 'Canonical fee engine (D87 via resolveSwapProtocolFeeContext*) — display only when proven',
  settlementAuthority: 'NONE — Treasury Runtime decommissioned',
  allocationAuthority: 'NONE — no local redistribution',
  feeDestination: MELEGA_TREASURY_WALLET_LABEL,
  attributionAuthority: 'NONE — KERL not proven in Smart Swap execution path',
  engine: 'SmartSwapForm unchanged — presentation consumes authoritative snapshots',
} as const
