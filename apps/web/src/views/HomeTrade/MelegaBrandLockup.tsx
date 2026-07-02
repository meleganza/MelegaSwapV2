import React from 'react'
import styled from 'styled-components'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { ht } from './homeTradeTokens'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${ht.fontBody};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.15;
  letter-spacing: -0.02em;
  white-space: nowrap;
`

const MelegaWord = styled.span`
  color: ${ht.white};
`

const DexWord = styled.span`
  color: ${ht.gold};
`

export const MelegaBrandLockup: React.FC<{ size?: 'desktop' | 'mobile'; iconOnly?: boolean }> = ({
  size = 'desktop',
  iconOnly = false,
}) => {
  const logoSize = size === 'mobile' ? 38 : 42

  return (
    <Wrap>
      <MelegaLogoSvg size={logoSize} />
      {!iconOnly ? (
        <BrandText style={size === 'mobile' ? { fontSize: 21 } : undefined}>
          <MelegaWord>Melega</MelegaWord>
          <DexWord>DEX</DexWord>
        </BrandText>
      ) : null}
    </Wrap>
  )
}

export default MelegaBrandLockup
