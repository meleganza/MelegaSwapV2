import React, { useState } from 'react'
import styled from 'styled-components'
import { MELEGA_LOGO_URI } from '../../constants/brand'
import { colors, typography } from '../../tokens'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Circle = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${colors.canvas};
  border: 1px solid rgba(212, 175, 55, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const Mark = styled.span<{ $size: number }>`
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $size }) => Math.round($size * 0.28)}px;
  font-weight: ${typography.fontWeight.extrabold};
  color: ${colors.textPrimary};
  letter-spacing: -0.04em;
`

const BrandText = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $compact }) => ($compact ? '21px' : '22px')};
  font-weight: ${typography.fontWeight.extrabold};
  line-height: 1;
  letter-spacing: -0.02em;
  white-space: nowrap;
`

const MelegaWord = styled.span`
  color: ${colors.textPrimary};
`

const DexWord = styled.span`
  color: ${colors.gold};
`

export interface MelegaBrandLockupProps {
  size?: 'desktop' | 'mobile'
}

export const MelegaBrandLockup: React.FC<MelegaBrandLockupProps> = ({ size = 'desktop' }) => {
  const logoSize = size === 'mobile' ? 38 : 40
  const [ok, setOk] = useState(true)

  return (
    <Wrap data-melega-brand-lockup>
      <Circle $size={logoSize} aria-hidden>
        {ok ? (
          <img src={MELEGA_LOGO_URI} alt="Melega" onError={() => setOk(false)} />
        ) : (
          <Mark $size={logoSize}>MM</Mark>
        )}
      </Circle>
      <BrandText $compact={size === 'mobile'}>
        <MelegaWord>Melega</MelegaWord>
        <DexWord>DEX</DexWord>
      </BrandText>
    </Wrap>
  )
}

export default MelegaBrandLockup
