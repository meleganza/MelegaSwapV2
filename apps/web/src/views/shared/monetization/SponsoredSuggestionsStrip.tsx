/**
 * Sponsored / Featured / Trending suggestions strip for Search + Token selector.
 * Presentation only — does not change token lists or swap routes.
 */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import useSWR from 'swr'
import { suggestionsForQuery, type TokenSuggestion } from 'lib/monetization/sponsorship'
import { PlacementLabel } from './PlacementLabel'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 12px;
  min-width: 0;
`

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const Item = styled.button`
  appearance: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 10px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #f2f2f2;
  font-size: 12px;
  font-weight: 650;
  &:hover {
    border-color: rgba(244, 196, 48, 0.45);
    background: rgba(244, 196, 48, 0.08);
  }
`

const Sym = styled.span`
  font-weight: 750;
`

type Props = {
  query?: string
  onSelect?: (suggestion: TokenSuggestion) => void
  testId?: string
}

type ActiveSponsoredPlacement = {
  orderId: string
  projectSlug: string | null
  projectContract: string | null
  chainId: number
  name: string
  symbol: string
}

const loadSponsored = async (url: string): Promise<ActiveSponsoredPlacement[]> => {
  const response = await fetch(url)
  if (!response.ok) return []
  const payload = (await response.json()) as { placements?: ActiveSponsoredPlacement[] }
  return payload.placements ?? []
}

export const SponsoredSuggestionsStrip: React.FC<Props> = ({
  query = '',
  onSelect,
  testId = 'sponsored-suggestions',
}) => {
  const { data: paidSponsored = [] } = useSWR('/api/trend-boost/active?service=sponsored-research', loadSponsored, {
    refreshInterval: 30_000,
    revalidateOnFocus: false,
  })
  const items = useMemo(() => {
    const paid = paidSponsored.map<TokenSuggestion>((placement) => ({
      kind: 'sponsored',
      label: 'Sponsored',
      symbol: placement.symbol,
      name: placement.name,
      address: /^0x[a-fA-F0-9]{40}$/.test(placement.projectContract ?? '')
        ? (placement.projectContract as `0x${string}`)
        : null,
      chainId: placement.chainId,
      href: placement.projectSlug ? `/project-hq/${placement.projectSlug}` : undefined,
    }))
    const base = suggestionsForQuery(query).filter((item) => item.kind !== 'sponsored')
    const normalizedQuery = query.trim().toLowerCase()
    const visiblePaid = normalizedQuery
      ? paid.filter(
          (item) =>
            item.symbol.toLowerCase().includes(normalizedQuery) ||
            item.name.toLowerCase().includes(normalizedQuery) ||
            item.address?.toLowerCase().includes(normalizedQuery),
        )
      : paid
    return [...visiblePaid, ...base]
  }, [paidSponsored, query])
  if (!items.length) return null
  return (
    <Wrap data-testid={testId} aria-label="Featured, Trending, and Sponsored suggestions">
      <Row>
        {items.map((s) => (
          <Item
            key={`${s.kind}-${s.symbol}`}
            type="button"
            onClick={() => onSelect?.(s)}
            data-testid={`${testId}-${s.kind}-${s.symbol.toLowerCase()}`}
            data-suggestion-kind={s.kind}
          >
            <PlacementLabel kind={s.kind} />
            <Sym>{s.symbol}</Sym>
          </Item>
        ))}
      </Row>
    </Wrap>
  )
}

export default SponsoredSuggestionsStrip
