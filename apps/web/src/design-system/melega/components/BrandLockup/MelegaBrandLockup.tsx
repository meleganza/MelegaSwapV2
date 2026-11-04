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
  /* Proportions measured on the approved Trade mockup: Evo ~0.44x wordmark width, dropping below the baseline. */
  width: auto;
  height: ${({ $compact }) => ($compact ? '40px' : '46px')};
  object-fit: contain;
  margin-left: 4px;
  position: relative;
  top: ${({ $compact }) => ($compact ? '10px' : '12px')};
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
            <Evo src="/brand/evo-founder-v2.svg" alt="Evo" width={compact ? 49 : 56} height={compact ? 40 : 46} $compact={compact} />
          </BrandText>
        ) : null}
      </Wrap>
    </BrandLink>
  )
}

export default MelegaBrandLockup
