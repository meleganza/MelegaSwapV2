import type { D87ServiceKey } from './d87PricingCodex'
import {
  formatProtocolFeePercent,
  getServicePriceLabel,
  SWAP_PROTOCOL_FEE_BUY_MARCO_BPS,
  SWAP_PROTOCOL_FEE_STANDARD_BPS,
} from './d87PricingCodex'

export type ServicePricingRow = {
  service: D87ServiceKey
  label: string
  standard: string
  marco: string
}

const SERVICE_LABELS: Record<D87ServiceKey, string> = {
  token_creation: 'Token Creation',
  token_self_listing: 'Token Self Listing',
  pool_creation: 'Pool Creation',
  liquidity_provision: 'Liquidity Provision',
  swap: 'Swap Protocol Fee',
  farm_creation: 'Farm Creation',
  staking_pool_creation: 'Staking Pool Creation',
  launchpad_integration: 'Launchpad Integration',
}

export function formatServicePricingRows(): ServicePricingRow[] {
  return (Object.keys(SERVICE_LABELS) as D87ServiceKey[]).map((service) => {
    if (service === 'swap') {
      return {
        service,
        label: SERVICE_LABELS[service],
        standard: `${formatProtocolFeePercent(SWAP_PROTOCOL_FEE_STANDARD_BPS)} protocol fee`,
        marco: `${formatProtocolFeePercent(SWAP_PROTOCOL_FEE_BUY_MARCO_BPS)} protocol fee (buy MARCO)`,
      }
    }
    return {
      service,
      label: SERVICE_LABELS[service],
      standard: getServicePriceLabel(service, 'standard'),
      marco: getServicePriceLabel(service, 'marco'),
    }
  })
}

export function getBuildStudioPricingSummary() {
  return {
    tokenCreation: getServicePriceLabel('token_creation', 'standard'),
    tokenCreationMarco: getServicePriceLabel('token_creation', 'marco'),
    farmCreation: getServicePriceLabel('farm_creation', 'standard'),
    farmCreationMarco: getServicePriceLabel('farm_creation', 'marco'),
    stakingPoolCreation: getServicePriceLabel('staking_pool_creation', 'standard'),
    stakingPoolCreationMarco: getServicePriceLabel('staking_pool_creation', 'marco'),
    selfListing: getServicePriceLabel('token_self_listing'),
    poolCreation: getServicePriceLabel('pool_creation'),
    liquidityProvision: getServicePriceLabel('liquidity_provision'),
    launchpadIntegration: getServicePriceLabel('launchpad_integration'),
  }
}
