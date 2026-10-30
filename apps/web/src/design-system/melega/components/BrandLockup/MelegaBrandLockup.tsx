import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { colors, typography } from '../../tokens'

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
  gap: 0;
  min-width: 0;
`

const BrandText = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $compact }) => ($compact ? '19px' : '22px')};
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.4px;
  white-space: nowrap;
`

const Wordmark = styled.span`
  color: #171817;
`

const Evo = styled.img<{ $compact?: boolean }>`
  width: ${({ $compact }) => ($compact ? '46px' : '54px')};
  height: ${({ $compact }) => ($compact ? '31px' : '36px')};
  object-fit: cover;
  object-position: center;
  margin-left: 4px;
  mix-blend-mode: multiply;
`

export interface MelegaBrandLockupProps {
  size?: 'desktop' | 'mobile'
  /** Icon-only lockup — circular Melega symbol without wordmark. */
  iconOnly?: boolean
}

export const MelegaBrandLockup: React.FC<MelegaBrandLockupProps> = ({ size = 'desktop', iconOnly = false }) => {
  const compact = size === 'mobile'

  return (
    <BrandLink href="/" aria-label="Melega DEX home">
      <Wrap data-melega-brand-lockup>
        {!iconOnly ? (
          <BrandText $compact={compact}>
            <Wordmark>MelegaDEX</Wordmark>
            <Evo src="/brand/evo-founder.png" alt="Evo" $compact={compact} />
          </BrandText>
        ) : null}
      </Wrap>
    </BrandLink>
  )
}

export default MelegaBrandLockup
