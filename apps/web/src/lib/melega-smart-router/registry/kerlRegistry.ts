import marcoBsc from '../../../../public/registry/assets/marco.json'
import marcoBscTestnet from '../../../../public/registry/assets/marco-bsc-testnet.json'
import marcoEth from '../../../../public/registry/assets/marco-ethereum.json'
import marcoPolygon from '../../../../public/registry/assets/marco-polygon.json'
import marcoBase from '../../../../public/registry/assets/marco-base.json'
import kerlIndex from '../../../../public/registry/kerl/index.json'
import type { RegistryStatus } from '../types'

type AssetRecord = {
  chain_id: number
  contract_address?: string
  symbol?: string
  as_of?: string
}

const KERL_MARCO_BY_CHAIN: Record<number, AssetRecord> = {
  56: marcoBsc as AssetRecord,
  97: marcoBscTestnet as AssetRecord,
  1: marcoEth as AssetRecord,
  137: marcoPolygon as AssetRecord,
  8453: marcoBase as AssetRecord,
}

export function getKerlRegistryVersion(): string {
  return (kerlIndex as { registryVersion?: string }).registryVersion ?? '1.0.0'
}

export function readKerlMarcoToken(chainId: number): {
  available: boolean
  marcoTokenAddress?: string
  status: RegistryStatus
  lastVerifiedAt: string
} {
  const record = KERL_MARCO_BY_CHAIN[chainId]
  if (!record?.contract_address) {
    return { available: false, status: 'missing', lastVerifiedAt: getKerlRegistryVersion() }
  }

  return {
    available: true,
    marcoTokenAddress: record.contract_address,
    status: 'active',
    lastVerifiedAt: record.as_of ?? getKerlRegistryVersion(),
  }
}

/** KERL treasury collector publication — none indexed in this build. */
export function readKerlTreasuryCollector(_chainId: number): {
  available: boolean
  collectorAddress?: string
  collectorVersion?: string | null
  lastVerifiedAt: string
} {
  return { available: false, lastVerifiedAt: getKerlRegistryVersion() }
}
