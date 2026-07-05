import React, { useState } from 'react'
import styled from 'styled-components'
import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
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
  overflow: visible;
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

const BuilderGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`

const BuilderCard = styled.button<{ $active?: boolean }>`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${({ $active }) => ($active ? buildStudioColors.gold : buildStudioColors.border)};
  background: rgba(255, 255, 255, 0.02);
  text-align: left;
  cursor: pointer;
  transition: border-color 150ms ease;

  &:hover {
    border-color: ${buildStudioColors.gold};
  }
`

const BuilderTitle = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 12px;
  font-weight: 700;
  color: ${buildStudioColors.white};
`

const TemplatesLabel = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
`

export const CreateTokenPanel: React.FC = () => {
  const { tokenPreparation, builderTemplates, selectedTemplateId, setSelectedTemplateId } = useBuildRuntime()

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
        <TemplatesLabel>Builder Templates</TemplatesLabel>
        <BuilderGrid data-bs-builder-templates>
          {builderTemplates.map((t) => (
            <BuilderCard
              key={t.id}
              type="button"
              $active={selectedTemplateId === t.id}
              onClick={() => setSelectedTemplateId(t.id)}
            >
              <BuilderTitle>{t.title}</BuilderTitle>
            </BuilderCard>
          ))}
        </BuilderGrid>
        <Chains>
          {SUPPORTED_CHAINS.map((chain) => (
            <Chain key={chain}>{chain}</Chain>
          ))}
        </Chains>
        <Meta>
          Gas: {premiumUiValue(tokenPreparation.gasEstimation)}
          <br />
          Treasury: {premiumUiValue(tokenPreparation.treasuryConfiguration)}
          <br />
          Readiness: {tokenPreparation.readinessScore}/100
        </Meta>
        <BtnCol>
          <BsPrimaryBtn type="button" $width="100%" $height="44px" style={{ fontSize: 13 }}>
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
