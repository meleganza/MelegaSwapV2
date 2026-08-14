import type { PropsWithChildren } from 'react'
import { MemoryRouter } from 'react-router-dom'

/**
 * Compatibility boundary for the remaining legacy NFT/ILO pages.
 * Canonical product routes use Next Router exclusively and never load this chunk.
 */
export default function LegacyReactRouterBoundary({ children }: PropsWithChildren<unknown>) {
  return <MemoryRouter>{children}</MemoryRouter>
}
