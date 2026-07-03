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
  width: 100%;
  min-height: ${collectiblesStudioLayout.bannerHeight};
  margin-top: 28px;
  border-radius: 24px;
  padding: 32px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  background: linear-gradient(
    110deg,
    rgba(214, 180, 69, 0.22) 0%,
    rgba(19, 19, 19, 0.96) 48%,
    rgba(27, 231, 122, 0.08) 100%
  );
  border: 1px solid rgba(214, 180, 69, 0.45);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    height: auto;
    min-height: 0;
    padding: 24px;
    margin-top: 20px;
  }
`

const Text = styled.div`
  min-width: 0;
`

const Title = styled.h2`
  margin: 0 0 8px;
  font-family: ${CS_FONT_DISPLAY};
  font-size: 34px;
  font-weight: 700;
  color: ${collectiblesStudioColors.white};
  line-height: 1.1;
`

const Sub = styled.p`
  margin: 0;
  font-family: ${CS_FONT_BODY};
  font-size: 18px;
  line-height: 28px;
  color: ${collectiblesStudioColors.body};
`

const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
`

export const CollectiblesBottomCta: React.FC = () => (
  <Banner data-cs-bottom-cta>
    <Text>
      <Title>Become part of Civilization.</Title>
      <Sub>Own an identity. Unlock exclusive AI privileges.</Sub>
    </Text>
    <BtnRow>
      <CsPrimaryBtn type="button" $width="180px" $height="46px">
        Create Collectible
      </CsPrimaryBtn>
      <CsOutlineBtn type="button" $width="190px" $height="46px">
        Explore Collections
      </CsOutlineBtn>
    </BtnRow>
  </Banner>
)

export default CollectiblesBottomCta
