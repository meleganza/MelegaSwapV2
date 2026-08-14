/**
 * Shared placement label — Featured · Trending · Sponsored
 */
import React from 'react'
import styled, { css } from 'styled-components'
import type { SuggestionKind } from 'lib/monetization/sponsorship'

const Chip = styled.span<{ $kind: SuggestionKind }>`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.02em;
  line-height: 1;
  white-space: nowrap;
  border: 1px solid;
  ${({ $kind }) =>
    $kind === 'featured'
      ? css`
          color: #f2c84c;
          border-color: rgba(244, 196, 48, 0.55);
          background: rgba(244, 196, 48, 0.14);
        `
      : $kind === 'trending'
        ? css`
            color: #7dd3fc;
            border-color: rgba(125, 211, 252, 0.45);
            background: rgba(56, 189, 248, 0.12);
          `
        : css`
            color: #c4b5fd;
            border-color: rgba(196, 181, 253, 0.45);
            background: rgba(139, 92, 246, 0.12);
          `}
`

export const PlacementLabel: React.FC<{ kind: SuggestionKind; className?: string }> = ({
  kind,
  className,
}) => (
  <Chip
    $kind={kind}
    className={className}
    data-testid={`placement-label-${kind}`}
    data-placement-label={kind}
  >
    {kind === 'featured' ? 'Featured' : kind === 'trending' ? 'Trending' : 'Sponsored'}
  </Chip>
)

export default PlacementLabel
