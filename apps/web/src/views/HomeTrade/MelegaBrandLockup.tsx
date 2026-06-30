import React, { useState } from 'react'
import styled from 'styled-components'
import { ht } from './homeTradeTokens'

const Wrap = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`

const LogoCircle = styled.div<{ $size?: 'desktop' | 'mobile' }>`
  width: ${({ $size }) => ($size === 'mobile' ? '38px' : '42px')};
  height: ${({ $size }) => ($size === 'mobile' ? '38px' : '42px')};
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

const PlaceholderMark = styled.span`
  font-family: ${ht.fontDisplay};
  font-size: 14px;
  font-weight: 700;
  color: #000;
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

export const MelegaBrandLockup: React.FC<{ size?: 'desktop' | 'mobile' }> = ({ size = 'desktop' }) => {
  const [imgOk, setImgOk] = useState(true)

  return (
    <Wrap>
      <LogoCircle $size={size}>
        {imgOk ? (
          <img src={ht.melegaLogoUri} alt="Melega" onError={() => setImgOk(false)} />
        ) : (
          <PlaceholderMark>M</PlaceholderMark>
        )}
      </LogoCircle>
      <BrandText>
        <MelegaWord>Melega</MelegaWord>
        <DexWord>DEX</DexWord>
      </BrandText>
    </Wrap>
  )
}

export default MelegaBrandLockup
