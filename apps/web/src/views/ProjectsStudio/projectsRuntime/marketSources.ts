import { CHAIN_EXPLORER_TOKEN_URL } from 'registry/projects/constants'
import type { StaticProjectRecord } from 'registry/projects/types'

export type MarketSourceKey =
  | 'coingecko'
  | 'coinmarketcap'
  | 'dextools'
  | 'dexscreener'
  | 'explorer'
  | 'website'
  | 'social'
  | 'github'
  | 'tokensniffer'
  | 'goplus'
  | 'internal_ai'

export interface MarketSourceStatus {
  key: MarketSourceKey
  label: string
  available: boolean
  href?: string
  lastUpdate?: string
}

const CHAIN_SLUG: Record<number, string> = {
  1: 'ethereum',
  56: 'bsc',
  137: 'polygon_pos',
  8453: 'base',
}

const DEXTOOLS_CHAIN: Record<number, string> = {
  1: 'ether',
  56: 'bnb',
  137: 'polygon',
  8453: 'base',
}

function primaryToken(project: StaticProjectRecord) {
  return project.resources.tokens[0]
}

function githubUrl(project: StaticProjectRecord): string | undefined {
  const link = project.socialLinks?.find((s) => s.type === 'github' || s.url.includes('github.com'))
  return link?.url
}

export function buildMarketSources(project: StaticProjectRecord, asOf: string): MarketSourceStatus[] {
  const token = primaryToken(project)
  const chainId = token?.chainId ?? 56
  const address = token?.address?.toLowerCase()
  const explorerBuilder = CHAIN_EXPLORER_TOKEN_URL[chainId]
  const explorerHref = address && explorerBuilder ? explorerBuilder(address) : undefined
  const dexChain = DEXTOOLS_CHAIN[chainId]
  const cgChain = CHAIN_SLUG[chainId]

  const coingeckoHref =
    address && cgChain
      ? `https://www.coingecko.com/en/coins/${cgChain}/contract/${address}`
      : undefined

  const dexscreenerHref = address
    ? `https://dexscreener.com/${cgChain ?? 'bsc'}/${address}`
    : undefined

  const dextoolsHref =
    address && dexChain ? `https://www.dextools.io/app/en/${dexChain}/pair-explorer/${address}` : undefined

  const tokensnifferHref = address ? `https://tokensniffer.com/token/${chainId}/${address}` : undefined
  const goplusHref = address ? `https://gopluslabs.io/token-security/${chainId}/${address}` : undefined

  const hasRegistryListing = Boolean(project.slug && project.registryStatus === 'listed')

  return [
    {
      key: 'internal_ai',
      label: 'Internal Melega Runtime',
      available: hasRegistryListing,
      lastUpdate: hasRegistryListing ? asOf : undefined,
    },
    {
      key: 'explorer',
      label: 'Explorer',
      available: Boolean(explorerHref),
      href: explorerHref,
      lastUpdate: explorerHref ? asOf : undefined,
    },
    {
      key: 'website',
      label: 'Website',
      available: Boolean(project.websiteUrl),
      href: project.websiteUrl,
      lastUpdate: project.websiteUrl ? asOf : undefined,
    },
    {
      key: 'social',
      label: 'Social',
      available: Boolean(project.socialLinks?.length),
      href: project.socialLinks?.[0]?.url,
      lastUpdate: project.socialLinks?.length ? asOf : undefined,
    },
    {
      key: 'github',
      label: 'GitHub',
      available: Boolean(githubUrl(project)),
      href: githubUrl(project),
      lastUpdate: githubUrl(project) ? asOf : undefined,
    },
    {
      key: 'coingecko',
      label: 'CoinGecko',
      available: false,
      href: coingeckoHref,
    },
    {
      key: 'coinmarketcap',
      label: 'CoinMarketCap',
      available: false,
    },
    {
      key: 'dexscreener',
      label: 'DexScreener',
      available: false,
      href: dexscreenerHref,
    },
    {
      key: 'dextools',
      label: 'DexTools',
      available: false,
      href: dextoolsHref,
    },
    {
      key: 'tokensniffer',
      label: 'TokenSniffer',
      available: false,
      href: tokensnifferHref,
    },
    {
      key: 'goplus',
      label: 'GoPlus',
      available: false,
      href: goplusHref,
    },
  ]
}

export function countAvailableSources(sources: MarketSourceStatus[]): number {
  return sources.filter((s) => s.available).length
}
