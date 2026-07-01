import React, { useState } from 'react'
import styled from 'styled-components'
import { MARCO_LOGO_URI } from '../../constants/brand'
import { colors, typography } from '../../tokens'
import { MarcoLogoSvg } from './MarcoLogoSvg'

const Card = styled.div`
  width: 100%;
  height: 72px;
  background: #0b0b0b;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-sizing: border-box;
  box-shadow: none;
`

const Circle = styled.div`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${colors.background};
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

const Meta = styled.div`
  min-width: 0;
`

const Name = styled.div`
  font-size: ${typography.fontSize.md};
  font-weight: ${typography.fontWeight.bold};
  color: ${colors.textPrimary};
`

const Price = styled.div`
  font-size: 13px;
  font-weight: ${typography.fontWeight.semibold};
  color: #22c55e;
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
          <MarcoLogoSvg size={28} />
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
