import React from 'react'
import styled from 'styled-components'
import {
  CS_FONT_BODY,
  CS_FONT_DISPLAY,
  collectiblesStudioColors,
  collectiblesStudioLayout,
} from '../collectiblesStudioTokens'
import { CsOutlineBtn, CsPrimaryBtn } from './collectiblesStudioPrimitives'

const Banner = styled.section`
  min-height: ${collectiblesStudioLayout.bannerHeight};
  border-radius: ${collectiblesStudioLayout.cardRadius};
  background: linear-gradient(135deg, #2a2208 0%, #1a1406 40%, #0d0a04 100%);
  border: 1px solid rgba(214, 180, 69, 0.35);
  padding: 32px 36px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(ellipse at 80% 50%, rgba(214, 180, 69, 0.15) 0%, transparent 55%);
    pointer-events: none;
  }

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 24px;
  }
`

const Text = styled.div`
  position: relative;
  z-index: 1;
  min-width: 0;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
`

const Sub = styled.p`
  margin: 0;
  font-family: ${CS_FONT_BODY};
  font-size: 16px;
  line-height: 26px;
  color: ${collectiblesStudioColors.secondary};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;
  position: relative;
  z-index: 1;

  @media (max-width: 767px) {
    flex-direction: column;
    width: 100%;
  }
`

export const CollectiblesBottomCta: React.FC = () => (
  <Banner data-cs-bottom-cta>
    <Text>
      <Title>Create your own collectible.</Title>
      <Sub>Grant access. Reward your community.</Sub>
    </Text>
    <BtnRow>
      <CsPrimaryBtn type="button" $width="200px">
        Create Collection
      </CsPrimaryBtn>
      <CsOutlineBtn type="button" $width="220px">
        Reward MARCO Holders
      </CsOutlineBtn>
    </BtnRow>
  </Banner>
)

export default CollectiblesBottomCta
