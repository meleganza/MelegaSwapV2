/**
 * Sponsored / Featured / Trending suggestions strip for Search + Token selector.
 * Presentation only — does not change token lists or swap routes.
 */
import React, { useMemo } from 'react'
import styled from 'styled-components'
import { suggestionsForQuery, type TokenSuggestion } from 'lib/monetization/sponsorship'
import { PlacementLabel } from './PlacementLabel'

const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0 0 12px;
  min-width: 0;
`

const Title = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.55);
  letter-spacing: 0.02em;
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

export const SponsoredSuggestionsStrip: React.FC<Props> = ({
  query = '',
  onSelect,
  testId = 'sponsored-suggestions',
}) => {
  const items = useMemo(() => suggestionsForQuery(query), [query])
  if (!items.length) return null
  return (
    <Wrap data-testid={testId} aria-label="Featured, Trending, and Sponsored suggestions">
      <Title>Featured · Trending · Sponsored</Title>
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
