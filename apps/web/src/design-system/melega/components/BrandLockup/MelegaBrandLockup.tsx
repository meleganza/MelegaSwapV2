import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { typography } from '../../tokens'
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
  gap: 7px;
  min-width: 0;
`

const BrandText = styled.div<{ $compact?: boolean }>`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${typography.fontFamily.body};
  font-size: ${({ $compact }) => ($compact ? '17px' : '22px')};
  font-weight: 700;
  line-height: 1;
  letter-spacing: -0.4px;
  white-space: nowrap;
`

const Wordmark = styled.span`
  color: #171817;
`

const Evo = styled.img<{ $compact?: boolean }>`
  /* Proportions measured on the approved Trade mockup: Evo ~0.44x wordmark width, dropping below the baseline. */
  width: auto;
  height: ${({ $compact }) => ($compact ? '34px' : '46px')};
  object-fit: contain;
  margin-left: 4px;
  position: relative;
  top: ${({ $compact }) => ($compact ? '8px' : '12px')};
`

const Badge = styled.span`
  display: inline-flex;
  flex: 0 0 auto;
  border-radius: 50%;
  overflow: hidden;
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
        <Badge data-melega-brand-badge>
          <MelegaLogoSvg size={compact ? 26 : 30} />
        </Badge>
        {!iconOnly ? (
          <BrandText $compact={compact}>
            <Wordmark>MelegaDEX</Wordmark>
            <Evo src="/brand/evo-founder-v2.svg" alt="Evo" width={compact ? 42 : 56} height={compact ? 34 : 46} $compact={compact} />
          </BrandText>
        ) : null}
      </Wrap>
    </BrandLink>
  )
}

export default MelegaBrandLockup
