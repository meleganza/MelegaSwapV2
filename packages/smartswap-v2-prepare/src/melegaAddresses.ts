/**
 * Addresses the V2 preparer needs without loading the chain registry.
 * The registry imports @pancakeswap/sdk; this file does not.
 */

export const MELEGA_DEX_VENUE_ID = 'melega-dex' as const

/** Canonical Melega V2 factory on BSC. Same value as the chain registry. */
export const MELEGA_BNB_FACTORY = '0xb7E5848e1d0CB457f2026670fCb9BbdB7e9E039C' as const
