// used to construct the list of all pairs we consider by default in the frontend

export { BLOCKED_ADDRESSES } from './blockedAddresses'

// default allowed slippage, in bips
export const INITIAL_ALLOWED_SLIPPAGE = 50
// 20 minutes, denominated in seconds
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const FAST_INTERVAL = 10000
export const SLOW_INTERVAL = 60000

export const NOT_ON_SALE_SELLER = '0x0000000000000000000000000000000000000000'
export const NO_PROXY_CONTRACT = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

export const PREDICTION_TOOLTIP_DISMISS_KEY = 'prediction-switcher-dismiss-tooltip'

// Gelato uses this address to define a native currency in all chains
export const GELATO_NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const EXCHANGE_DOCS_URLS = 'https://docs.cyberglow.finance/cyberglow-dex/exchange'
export const EXCHANGE_HELP_URLS = 'https://docs.cyberglow.finance'

export { default as ifosConfig } from './ifo'
