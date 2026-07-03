import React from 'react'
import styled from 'styled-components'
import { SUPPORTED_CHAINS } from '../buildStudioData'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { IconCoins } from './buildStudioIcons'
import { BsBadge, BsBody, BsCardTitle, BsOutlineBtn, BsPanel, BsPrimaryBtn } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
`

const Chains = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chain = styled.span`
  height: 26px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid ${buildStudioColors.border};
  background: rgba(255, 255, 255, 0.02);
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  color: ${buildStudioColors.muted};
  display: inline-flex;
  align-items: center;
`

const BtnCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: auto;
`

const Meta = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  color: ${buildStudioColors.muted};
  line-height: 1.5;
`

export const CreateTokenPanel: React.FC = () => {
  const { tokenPreparation } = useBuildRuntime()

  return (
    <BsPanel data-bs-panel data-bs-create-token $emphasis="reduced" $height={buildStudioLayout.createTokenH}>
      <Inner>
        <TitleRow>
          <BsCardTitle $size="reduced">Create Token</BsCardTitle>
          <IconCoins size={18} />
        </TitleRow>
        <BsBadge $variant="green">Preparation Only</BsBadge>
        <BsBody style={{ fontSize: 13, lineHeight: '20px', color: buildStudioColors.muted }}>
          {tokenPreparation.deploymentPreview}
        </BsBody>
        <Chains>
          {SUPPORTED_CHAINS.map((chain) => (
            <Chain key={chain}>{chain}</Chain>
          ))}
        </Chains>
        <Meta>
          Gas: {tokenPreparation.gasEstimation}
          <br />
          Treasury: {tokenPreparation.treasuryConfiguration}
          <br />
          Readiness: {tokenPreparation.readinessScore}/100
        </Meta>
        <BtnCol>
          <BsPrimaryBtn type="button" $width="100%" $height="44px" style={{ fontSize: 13 }} disabled>
            Create Token →
          </BsPrimaryBtn>
          <BsOutlineBtn type="button" $height="40px" style={{ fontSize: 13 }}>
            Learn More
          </BsOutlineBtn>
        </BtnCol>
      </Inner>
    </BsPanel>
  )
}

export default CreateTokenPanel
