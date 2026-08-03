/**
 * Payment Router — shared commercial settlement model.
 * Assets: BNB · USDT · USDC · MARCO
 * Products: Create Token · Create Farm · Create Pool · Featured · Trend Boost
 *
 * No protocol redeploys. Create Token / Farm / Pool keep on-chain BNB fees;
 * multi-asset applies to treasury commercial settlement where the product allows.
 */
import { MELEGA_FEE_SCHEDULE } from 'config/constants/feeSchedule'
import { FEATURED_PAYMENT_TOKENS, type FeaturedPayAsset } from 'lib/featured-placement/constants'
import {
  FEATURED_PACKAGES,
  getFeaturedPackage,
  getTrendBoostPackage,
  MONETIZATION_ASSETS,
  MONETIZATION_CHAIN_ID,
  MONETIZATION_TREASURY,
  TREND_BOOST_PACKAGES,
  type MonetizationAsset,
  type PlacementPackage,
} from './packages'

export type PaymentRouterProduct =
  | 'create_token'
  | 'create_farm'
  | 'create_pool'
  | 'featured_project'
  | 'trend_boost'

export type PaymentSettlementMode =
  | 'protocol_native_bnb'
  | 'treasury_usd_quote'
  | 'treasury_fixed_bnb_quote'

export type PaymentRouterProductSpec = {
  product: PaymentRouterProduct
  label: string
  humanSummary: string
  acceptedAssets: readonly MonetizationAsset[]
  /** Asset required by the on-chain factory/router when applicable */
  protocolAsset: MonetizationAsset | null
  settlementMode: PaymentSettlementMode
  packages?: readonly PlacementPackage[]
  defaultPackageId?: string
  /** Fixed BNB fee from Founder schedule when settlementMode is treasury_fixed_bnb_quote / protocol */
  protocolFeeBnb?: string
  protocolFeeWei?: string
}

const CREATE_TOKEN_FEE = MELEGA_FEE_SCHEDULE.services.createToken.fee
const CREATE_POOL_OTHERWISE = MELEGA_FEE_SCHEDULE.services.createPool.rules.find(
  (r) => r.when === 'otherwise',
)?.fee
const CREATE_FARM_OTHERWISE = MELEGA_FEE_SCHEDULE.services.createFarm.priorityRules.find(
  (r) => r.when === 'otherwise',
)?.fee

export const PAYMENT_ROUTER_PRODUCTS: Record<PaymentRouterProduct, PaymentRouterProductSpec> = {
  create_token: {
    product: 'create_token',
    label: 'Create Token',
    humanSummary:
      'Token creation fee settles in BNB on-chain. You can still pay Featured or Trend Boost add-ons in BNB, USDT, USDC, or MARCO.',
    acceptedAssets: MONETIZATION_ASSETS,
    protocolAsset: 'BNB',
    settlementMode: 'protocol_native_bnb',
    protocolFeeBnb: CREATE_TOKEN_FEE.bnb,
    protocolFeeWei: CREATE_TOKEN_FEE.wei,
  },
  create_farm: {
    product: 'create_farm',
    label: 'Create Farm',
    humanSummary:
      'Farm creation fees follow the Founder BNB schedule on-chain. Featured and Trend Boost add-ons accept BNB, USDT, USDC, or MARCO.',
    acceptedAssets: MONETIZATION_ASSETS,
    protocolAsset: 'BNB',
    settlementMode: 'protocol_native_bnb',
    protocolFeeBnb: CREATE_FARM_OTHERWISE?.bnb ?? '0.25',
    protocolFeeWei: CREATE_FARM_OTHERWISE?.wei ?? '250000000000000000',
  },
  create_pool: {
    product: 'create_pool',
    label: 'Create Pool',
    humanSummary:
      'Pool creation fees follow the Founder BNB schedule on-chain. Featured and Trend Boost add-ons accept BNB, USDT, USDC, or MARCO.',
    acceptedAssets: MONETIZATION_ASSETS,
    protocolAsset: 'BNB',
    settlementMode: 'protocol_native_bnb',
    protocolFeeBnb: CREATE_POOL_OTHERWISE?.bnb ?? '0.25',
    protocolFeeWei: CREATE_POOL_OTHERWISE?.wei ?? '250000000000000000',
  },
  featured_project: {
    product: 'featured_project',
    label: 'Featured Project',
    humanSummary: 'Pay the Featured package in BNB, USDT, USDC, or MARCO. Settles directly to MELEGA TREASURY.',
    acceptedAssets: MONETIZATION_ASSETS,
    protocolAsset: null,
    settlementMode: 'treasury_usd_quote',
    packages: FEATURED_PACKAGES,
    defaultPackageId: 'featured_1w',
  },
  trend_boost: {
    product: 'trend_boost',
    label: 'Trend Boost',
    humanSummary: 'Pay Trend Boost in BNB, USDT, USDC, or MARCO. Settles directly to MELEGA TREASURY.',
    acceptedAssets: MONETIZATION_ASSETS,
    protocolAsset: null,
    settlementMode: 'treasury_usd_quote',
    packages: TREND_BOOST_PACKAGES,
    defaultPackageId: 'trend_6h',
  },
}

export type PaymentRouterQuoteInput = {
  product: PaymentRouterProduct
  asset: MonetizationAsset
  packageId?: string | null
  /** Required for BNB/MARCO USD quotes */
  unitPriceUsd?: number | null
}

export type PaymentRouterQuote = {
  schema: 'melega.payment-router.quote.v1'
  product: PaymentRouterProduct
  asset: MonetizationAsset
  packageId: string | null
  usdReferenceAmount: number | null
  tokenAmount: string | null
  tokenAmountRaw: string | null
  protocolFeeWei: string | null
  settlementMode: PaymentSettlementMode
  treasury: string
  chainId: typeof MONETIZATION_CHAIN_ID
  tokenAddress: string | null
  decimals: number
  humanLabel: string
}

function toRawAmount(human: number, decimals: number): string {
  const [whole, frac = ''] = human.toFixed(decimals).split('.')
  return BigInt(whole + frac.padEnd(decimals, '0').slice(0, decimals)).toString()
}

export function resolvePaymentProduct(product: PaymentRouterProduct): PaymentRouterProductSpec {
  return PAYMENT_ROUTER_PRODUCTS[product]
}

export function resolvePackageForProduct(
  product: PaymentRouterProduct,
  packageId?: string | null,
): PlacementPackage | null {
  if (product === 'featured_project') return getFeaturedPackage(packageId)
  if (product === 'trend_boost') return getTrendBoostPackage(packageId)
  return null
}

/**
 * Build a commercial quote. Does not broadcast.
 * For create_* products, returns protocol BNB fee when asset is BNB;
 * other assets return a USD-equivalent treasury quote of the schedule BNB fee
 * for commercial display only (protocol create still requires BNB).
 */
export function quotePaymentRouter(input: PaymentRouterQuoteInput): PaymentRouterQuote {
  const spec = resolvePaymentProduct(input.product)
  if (!spec.acceptedAssets.includes(input.asset)) {
    throw new Error(`ASSET_UNSUPPORTED:${input.asset}`)
  }

  const pkg = resolvePackageForProduct(input.product, input.packageId)
  const meta = FEATURED_PAYMENT_TOKENS[input.asset as FeaturedPayAsset]
  const treasury = MONETIZATION_TREASURY

  if (spec.settlementMode === 'protocol_native_bnb') {
    if (input.asset === 'BNB') {
      return {
        schema: 'melega.payment-router.quote.v1',
        product: input.product,
        asset: input.asset,
        packageId: null,
        usdReferenceAmount: null,
        tokenAmount: spec.protocolFeeBnb ?? null,
        tokenAmountRaw: spec.protocolFeeWei ?? null,
        protocolFeeWei: spec.protocolFeeWei ?? null,
        settlementMode: spec.settlementMode,
        treasury,
        chainId: MONETIZATION_CHAIN_ID,
        tokenAddress: null,
        decimals: 18,
        humanLabel: `${spec.label} · ${spec.protocolFeeBnb} BNB on-chain`,
      }
    }
    // Commercial equivalent display for non-BNB — does not replace protocol BNB fee.
    const bnbFee = Number(spec.protocolFeeBnb || '0')
    const bnbUsd = input.unitPriceUsd
    if (bnbUsd == null || !(bnbUsd > 0)) {
      throw new Error('QUOTE_UNAVAILABLE:BNB_USD')
    }
    const usd = bnbFee * bnbUsd
    let unit = input.unitPriceUsd
    if (input.asset === 'USDT' || input.asset === 'USDC') unit = 1
    if (unit == null || !(unit > 0)) throw new Error(`QUOTE_UNAVAILABLE:${input.asset}`)
    const tokenAmountNum = usd / unit
    const tokenAmount = tokenAmountNum.toFixed(Math.min(8, meta.decimals))
    return {
      schema: 'melega.payment-router.quote.v1',
      product: input.product,
      asset: input.asset,
      packageId: null,
      usdReferenceAmount: usd,
      tokenAmount,
      tokenAmountRaw: toRawAmount(Number(tokenAmount), meta.decimals),
      protocolFeeWei: spec.protocolFeeWei ?? null,
      settlementMode: 'treasury_fixed_bnb_quote',
      treasury,
      chainId: MONETIZATION_CHAIN_ID,
      tokenAddress: meta.address,
      decimals: meta.decimals,
      humanLabel: `${spec.label} · ~$${usd.toFixed(2)} in ${input.asset} (protocol create still needs BNB)`,
    }
  }

  if (!pkg) throw new Error('PACKAGE_REQUIRED')
  const usd = pkg.usdPrice
  let unit = input.unitPriceUsd ?? null
  if (input.asset === 'USDT' || input.asset === 'USDC') unit = 1
  if (unit == null || !(unit > 0)) throw new Error(`QUOTE_UNAVAILABLE:${input.asset}`)
  const tokenAmountNum = usd / unit
  const tokenAmount = tokenAmountNum.toFixed(Math.min(8, meta.decimals))
  return {
    schema: 'melega.payment-router.quote.v1',
    product: input.product,
    asset: input.asset,
    packageId: pkg.id,
    usdReferenceAmount: usd,
    tokenAmount,
    tokenAmountRaw: toRawAmount(Number(tokenAmount), meta.decimals),
    protocolFeeWei: null,
    settlementMode: spec.settlementMode,
    treasury,
    chainId: MONETIZATION_CHAIN_ID,
    tokenAddress: meta.address,
    decimals: meta.decimals,
    humanLabel: `${pkg.label} · $${usd} in ${input.asset}`,
  }
}

export function listPaymentRouterProducts(): PaymentRouterProductSpec[] {
  return Object.values(PAYMENT_ROUTER_PRODUCTS)
}
