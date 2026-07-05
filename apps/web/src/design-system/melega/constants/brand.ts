/** Official brand asset URIs — shared across shell and catalogue. */
/** MARCO and Melega use the same official double-M round logo. */
export const MELEGA_LOGO_URI = '/images/melega.png'
export const MARCO_LOGO_URI = MELEGA_LOGO_URI
export const MARCO_BSC_CHAIN_ID = 56
export const MARCO_BSC_ADDRESS = '0x963556de0eb8138E97A85F0A86eE0acD159D210b'

/** True when a token/project label refers to MARCO or Melega brand. */
export const isMarcoSymbol = (symbol?: string | null, name?: string | null): boolean => {
  const s = (symbol ?? '').trim().toUpperCase()
  const n = (name ?? '').trim().toUpperCase()
  return s === 'MARCO' || s === 'MELEGA' || n === 'MARCO' || n === 'MELEGA' || n.includes('MELEGA')
}
