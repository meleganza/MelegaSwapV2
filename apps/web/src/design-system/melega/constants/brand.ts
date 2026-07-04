/** Official brand asset URIs — shared across shell and catalogue. */
/** MARCO and Melega use the same official double-M round logo. */
export const MELEGA_LOGO_URI = '/images/melega.png'
export const MARCO_LOGO_URI = MELEGA_LOGO_URI

/** True when a token/project label refers to MARCO or Melega brand. */
export const isMarcoSymbol = (symbol?: string | null, name?: string | null): boolean => {
  const s = (symbol ?? '').trim().toUpperCase()
  const n = (name ?? '').trim().toUpperCase()
  return s === 'MARCO' || n === 'MARCO' || n === 'MELEGA' || s === 'MELEGA'
}
