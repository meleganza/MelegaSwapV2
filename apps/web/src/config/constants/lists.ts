export const PANCAKE_EXTENDED = 'https://tokens.pancakeswap.finance/pancakeswap-extended.json'
export const COINGECKO = 'https://tokens.pancakeswap.finance/coingecko.json'
export const UNISWAP = 'https://cloudflare-ipfs.com/ipns/tokens.uniswap.org'
export const CMC = 'https://tokens.pancakeswap.finance/cmc.json'

export const ETH_URLS = []
export const BSC_URLS = []

// List of official tokens list
export const OFFICIAL_LISTS = []

export const UNSUPPORTED_LIST_URLS: string[] = []
export const WARNING_LIST_URLS: string[] = []

// lower index == higher priority for token import
export const DEFAULT_LIST_OF_LISTS: string[] = [
  ...BSC_URLS,
  ...ETH_URLS,
  ...UNSUPPORTED_LIST_URLS, // need to load unsupported tokens as well
  ...WARNING_LIST_URLS,
]

// default lists to be 'active' aka searched across
export const DEFAULT_ACTIVE_LIST_URLS: string[] = []
