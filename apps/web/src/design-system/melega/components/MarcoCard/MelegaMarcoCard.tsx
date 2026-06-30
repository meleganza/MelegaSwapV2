import React, { useState } from 'react'
import styled from 'styled-components'
import { MARCO_LOGO_URI } from '../../constants/brand'
import { colors, typography, spacing, radius } from '../../tokens'

const Card = styled.div`
  width: 100%;
  height: 72px;
  background: ${colors.surface1};
  border: 1px solid ${colors.border};
  border-radius: ${radius.lg};
  padding: ${spacing[3]};
  display: flex;
  align-items: center;
  gap: ${spacing[3]};
  box-sizing: border-box;
  box-shadow: none;
`

const Circle = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(145deg, #1a1508 0%, #0a0a0a 55%, #1f1806 100%);
  border: 1px solid rgba(212, 175, 55, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const Mark = styled.span`
  font-family: ${typography.fontFamily.wordmark};
  font-size: 10px;
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.gold};
`

const Meta = styled.div`
  min-width: 0;
`

const Name = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
`

const Price = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.semibold};
  color: ${colors.green};
  margin-top: 2px;
`

export interface MelegaMarcoCardProps {
  priceLabel?: string
}

export const MelegaMarcoCard: React.FC<MelegaMarcoCardProps> = ({ priceLabel }) => {
  const [ok, setOk] = useState(true)

  return (
    <Card data-melega-marco-card>
      <Circle aria-hidden>
        {ok ? (
          <img src={MARCO_LOGO_URI} alt="MARCO" onError={() => setOk(false)} />
        ) : (
          <Mark>M</Mark>
        )}
      </Circle>
      <Meta>
        <Name>MARCO</Name>
        {priceLabel && <Price>{priceLabel}</Price>}
      </Meta>
    </Card>
  )
}

export default MelegaMarcoCard
