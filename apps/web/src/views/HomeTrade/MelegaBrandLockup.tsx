import React from 'react'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Wrap = styled.div<{ $size?: 'desktop' | 'mobile' }>`
  display: flex;
  align-items: center;
  gap: 10px;
`

const LogoCircle = styled.div<{ $size?: 'desktop' | 'mobile' }>`
  width: ${({ $size }) => ($size === 'mobile' ? '36px' : '40px')};
  height: ${({ $size }) => ($size === 'mobile' ? '36px' : '40px')};
  border-radius: 50%;
  flex-shrink: 0;
  background: linear-gradient(135deg, ${ht.goldBright} 0%, ${ht.goldDark} 100%);
  border: 1px solid ${ht.borderGold};
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

const BrandText = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-family: ${ht.fontBody};
  font-size: 22px;
  font-weight: 700;
  line-height: 1.15;
`

const MelegaWord = styled.span`
  color: ${ht.white};
`

const DexWord = styled.span`
  color: ${ht.gold};
`

export const MelegaBrandLockup: React.FC<{ size?: 'desktop' | 'mobile' }> = ({ size = 'desktop' }) => (
  <Wrap $size={size}>
    <LogoCircle $size={size}>
      <img src="https://melega.finance/favicon.ico" alt="Melega" />
    </LogoCircle>
    <BrandText>
      <MelegaWord>Melega</MelegaWord>
      <DexWord>DEX</DexWord>
    </BrandText>
  </Wrap>
)

export default MelegaBrandLockup
