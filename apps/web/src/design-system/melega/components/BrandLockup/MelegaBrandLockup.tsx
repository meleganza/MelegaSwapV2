import React, { useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MELEGA_LOGO_URI } from '../../constants/brand'
import { colors, typography } from '../../tokens'
import { MelegaLogoSvg } from './MelegaLogoSvg'

const BrandLink = styled(Link)`
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 150ms ease;
  min-width: 0;

  &:hover {
    opacity: 0.92;
  }
`

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`

const Circle = styled.div<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: 50%;
  flex-shrink: 0;
  background: ${colors.background};
  border: 2px solid #d4af37;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-sizing: border-box;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const BrandText = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $compact }) => ($compact ? '20px' : '22px')};
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.4px;
  white-space: nowrap;
`

const MelegaWord = styled.span`
  color: #ffffff;
`

const DexWord = styled.span`
  color: #d4af37;
`

export interface MelegaBrandLockupProps {
  size?: 'desktop' | 'mobile'
  /** Icon-only lockup — circular Melega symbol without wordmark. */
  iconOnly?: boolean
}

export const MelegaBrandLockup: React.FC<MelegaBrandLockupProps> = ({ size = 'desktop', iconOnly = false }) => {
  const logoSize = size === 'mobile' ? 38 : 42
  const [ok, setOk] = useState(true)

  return (
    <BrandLink href="/" aria-label="Melega DEX home">
      <Wrap data-melega-brand-lockup>
        <Circle $size={logoSize} aria-hidden>
          {ok ? (
            <img src={MELEGA_LOGO_URI} alt="" onError={() => setOk(false)} />
          ) : (
            <MelegaLogoSvg size={logoSize} />
          )}
        </Circle>
        {!iconOnly ? (
          <BrandText $compact={size === 'mobile'}>
            <MelegaWord>Melega</MelegaWord>
            <DexWord>DEX</DexWord>
          </BrandText>
        ) : null}
      </Wrap>
    </BrandLink>
  )
}

export default MelegaBrandLockup
