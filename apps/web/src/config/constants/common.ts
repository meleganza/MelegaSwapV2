// Lightweight application constants. Keep this module free of token, farm,
// pool and IFO registries so shell/runtime consumers do not pull those
// catalogs into every route.

export const INITIAL_ALLOWED_SLIPPAGE = 50
export const DEFAULT_DEADLINE_FROM_NOW = 60 * 20

export const FAST_INTERVAL = 10000
export const SLOW_INTERVAL = 60000

export const NOT_ON_SALE_SELLER = '0x0000000000000000000000000000000000000000'
export const NO_PROXY_CONTRACT = '0x0000000000000000000000000000000000000000'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD'

export const PREDICTION_TOOLTIP_DISMISS_KEY = 'prediction-switcher-dismiss-tooltip'

export const GELATO_NATIVE = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'

export const EXCHANGE_DOCS_URLS = 'https://docs.cyberglow.finance/cyberglow-dex/exchange'
export const EXCHANGE_HELP_URLS = 'https://docs.cyberglow.finance'
