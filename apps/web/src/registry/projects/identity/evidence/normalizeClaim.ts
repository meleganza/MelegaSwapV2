import { normalizeEvmAddress } from '../caip'
import { isSafeHttpUrl } from '../urlSafety'
import type { EvidenceClaimType } from './schema'

/** Normalize claim values so casing/trailing-slash/CAIP equivalents do not false-conflict. */
export function normalizeClaimValue(claimType: EvidenceClaimType, raw: string | null | undefined): string {
  if (raw == null) return ''
  const trimmed = String(raw).trim()
  if (!trimmed) return ''

  switch (claimType) {
    case 'OFFICIAL_WEBSITE':
    case 'OFFICIAL_DOCUMENTATION':
    case 'OFFICIAL_WHITEPAPER':
    case 'OFFICIAL_REPOSITORY':
    case 'OFFICIAL_GOVERNANCE':
    case 'OFFICIAL_SOCIAL':
    case 'PROJECT_LOGO': {
      if (!isSafeHttpUrl(trimmed)) return trimmed.toLowerCase()
      try {
        const url = new URL(trimmed)
        url.hash = ''
        let pathname = url.pathname
        if (pathname.length > 1 && pathname.endsWith('/')) {
          pathname = pathname.slice(0, -1)
        }
        return `${url.protocol}//${url.host.toLowerCase()}${pathname}${url.search}`.toLowerCase()
      } catch {
        return trimmed.toLowerCase()
      }
    }
    case 'CONTRACT_IDENTITY':
    case 'ASSET_IDENTITY': {
      // Accept CAIP-10 / CAIP-19 or bare address
      const caip10 = /^eip155:(\d+):(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
      if (caip10) return `eip155:${caip10[1]}:${caip10[2].toLowerCase()}`
      const caip19 = /^eip155:(\d+)\/erc20:(0x[a-fA-F0-9]{40})$/i.exec(trimmed)
      if (caip19) return `eip155:${caip19[1]}/erc20:${caip19[2].toLowerCase()}`
      const addr = normalizeEvmAddress(trimmed)
      return addr ?? trimmed.toLowerCase()
    }
    case 'CONTRACT_CLASSIFICATION':
    case 'SUPPORTED_CHAIN':
    case 'DEPLOYMENT_IDENTITY':
    case 'PROJECT_TYPE':
    case 'PROJECT_LIFECYCLE_STATUS':
    case 'PROJECT_CATEGORY':
    case 'PROJECT_TAG':
    case 'MELEGA_VERIFICATION':
    case 'PROJECT_IDENTITY':
      return trimmed.toLowerCase()
    case 'PROJECT_NAME':
    case 'PROJECT_PURPOSE':
      return trimmed.replace(/\s+/g, ' ').trim()
    default:
      return trimmed
  }
}
