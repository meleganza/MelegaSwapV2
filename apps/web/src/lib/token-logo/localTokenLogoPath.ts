/**
 * Deterministic local logo path for BSC historical tokens under
 * apps/web/public/images/56/tokens — prefers EIP-55 checksum filenames
 * (majority of on-disk assets), then lowercase fallback.
 */

import { getAddress } from '@ethersproject/address'

export const LOCAL_BSC_TOKEN_LOGO_PREFIX = '/images/56/tokens/'

/** Primary local logo path (checksummed when address is valid). */
export function localBscTokenLogoPath(address?: string | null): string | undefined {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return undefined
  try {
    return `${LOCAL_BSC_TOKEN_LOGO_PREFIX}${getAddress(address)}.png`
  } catch {
    return `${LOCAL_BSC_TOKEN_LOGO_PREFIX}${address.toLowerCase()}.png`
  }
}

/** Ordered local candidates — checksum first, then lowercase. */
export function localBscTokenLogoCandidates(address?: string | null): string[] {
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return []
  const lower = `${LOCAL_BSC_TOKEN_LOGO_PREFIX}${address.toLowerCase()}.png`
  try {
    const checksummed = `${LOCAL_BSC_TOKEN_LOGO_PREFIX}${getAddress(address)}.png`
    return checksummed.toLowerCase() === lower ? [checksummed] : [checksummed, lower]
  } catch {
    return [lower]
  }
}
