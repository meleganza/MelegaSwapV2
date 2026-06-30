import React from 'react'
import styled from 'styled-components'
import { SafeLogo } from './homeTradeShared'
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

export const MelegaBrandLockup: React.FC<{ size?: 'desktop' | 'mobile' }> = ({ size = 'desktop' }) => (
  <Wrap>
    <SafeLogo src={ht.melegaLogoUri} alt="Melega" size={size === 'mobile' ? 38 : 42} fallbackMark="MM" />
    <BrandText style={size === 'mobile' ? { fontSize: 21 } : undefined}>
      <MelegaWord>Melega</MelegaWord>
      <DexWord>DEX</DexWord>
    </BrandText>
  </Wrap>
)

export default MelegaBrandLockup
