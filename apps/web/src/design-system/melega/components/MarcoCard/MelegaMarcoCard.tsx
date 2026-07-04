import React, { useState } from 'react'
import styled from 'styled-components'
import { MARCO_LOGO_URI } from '../../constants/brand'
import { MelegaLogoSvg } from '../BrandLockup/MelegaLogoSvg'
import { colors, typography } from '../../tokens'

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

const LogoSlot = styled.div`
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid #d6b445;
  background: #050505;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
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
  const [logoOk, setLogoOk] = useState(true)

  return (
    <Card data-melega-marco-card>
      <LogoSlot aria-hidden>
        {logoOk ? (
          <img src={MARCO_LOGO_URI} alt="" onError={() => setLogoOk(false)} />
        ) : (
          <MelegaLogoSvg size={28} />
        )}
      </LogoSlot>
      <Meta>
        <Name>MARCO</Name>
        {priceLabel && <Price>{priceLabel}</Price>}
      </Meta>
    </Card>
  )
}

export default MelegaMarcoCard
