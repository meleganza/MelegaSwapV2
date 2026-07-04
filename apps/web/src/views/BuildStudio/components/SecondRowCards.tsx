import React, { useState } from 'react'
import styled from 'styled-components'
import { STAKING_TEMPLATES } from '../buildStudioData'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { IconCoins } from './buildStudioIcons'
import {
  BsBody,
  BsCardTitle,
  BsField,
  BsFieldLabel,
  BsInput,
  BsLabel,
  BsOutlineBtn,
  BsPanel,
  BsPrimaryBtn,
} from './buildStudioPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, ${buildStudioLayout.secondRowCardW});
  gap: ${buildStudioLayout.cardGap};
  width: 100%;
  align-items: stretch;

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Inner = styled.div`
  padding: 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: hidden;
`

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  max-height: 160px;
  overflow-y: auto;
`

const TemplateCard = styled.button<{ $active?: boolean; $featured?: boolean }>`
  padding: 8px 10px;
  border-radius: 12px;
  border: 1px solid
    ${({ $active, $featured }) =>
      $active ? buildStudioColors.gold : $featured ? 'rgba(214,180,69,0.55)' : buildStudioColors.border};
  background: ${({ $active }) => ($active ? buildStudioColors.goldBg : 'rgba(255,255,255,0.02)')};
  text-align: left;
  cursor: pointer;
`

const TemplateTitle = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  font-weight: 700;
  color: ${buildStudioColors.white};
`

const TemplateDesc = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 10px;
  line-height: 14px;
  color: ${buildStudioColors.muted};
  margin-top: 2px;
`

const SimBlock = styled.div`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${buildStudioColors.border};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 4px;
`

const SimTitle = styled.div`
  font-family: ${BS_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${buildStudioColors.label};
  margin-bottom: 2px;
`

const SimRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-family: ${BS_FONT_BODY};
  font-size: 11px;
  color: ${buildStudioColors.muted};
`

const SimVal = styled.span`
  color: ${buildStudioColors.white};
  font-weight: 700;
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

function StakingPoolCard() {
  const { poolPreview } = useBuildRuntime()
  const [templateId, setTemplateId] = useState('marco-holders')
  const template = STAKING_TEMPLATES.find((t) => t.id === templateId) ?? STAKING_TEMPLATES[0]
  const stakeLocked = template.lockStakeToken

  return (
    <BsPanel data-bs-panel data-bs-staking-pool $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle>Create Staking Pool</BsCardTitle>
        <BsLabel>Infrastructure Templates</BsLabel>
        <TemplateGrid>
          {STAKING_TEMPLATES.map((t) => (
            <TemplateCard
              key={t.id}
              type="button"
              $active={templateId === t.id}
              $featured={t.featured}
              onClick={() => setTemplateId(t.id)}
            >
              <TemplateTitle>
                {t.featured ? '⭐ ' : ''}
                {t.title}
              </TemplateTitle>
              <TemplateDesc>{t.description}</TemplateDesc>
            </TemplateCard>
          ))}
        </TemplateGrid>
        <BsField>
          <BsFieldLabel>Stake Token</BsFieldLabel>
          <BsInput
            value={poolPreview.available ? poolPreview.stakeToken : template.stakeToken}
            readOnly={stakeLocked}
            style={{ height: 40, fontSize: 13 }}
          />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput
            value={poolPreview.rewardToken}
            readOnly
            style={{ height: 40, fontSize: 13 }}
          />
        </BsField>
        <SimBlock>
          <SimTitle>Pools Runtime</SimTitle>
          <SimRow>
            <span>APR</span>
            <SimVal>{poolPreview.apr}</SimVal>
          </SimRow>
          <SimRow>
            <span>Pool Type</span>
            <SimVal>{poolPreview.poolType}</SimVal>
          </SimRow>
          <SimRow>
            <span>Lock</span>
            <SimVal>{poolPreview.lock}</SimVal>
          </SimRow>
        </SimBlock>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }} disabled>
          Create Pool
        </BsPrimaryBtn>
      </Inner>
    </BsPanel>
  )
}

function CreateFarmCard() {
  const { farmPreview } = useBuildRuntime()

  return (
    <BsPanel data-bs-panel data-bs-create-farm $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle>Create Farm</BsCardTitle>
        <BsField>
          <BsFieldLabel>LP Token</BsFieldLabel>
          <BsInput value={farmPreview.lp} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput value={farmPreview.reward} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <SimBlock data-bs-farm-simulation>
          <SimTitle>Farms Runtime</SimTitle>
          <SimRow>
            <span>APR</span>
            <SimVal>{farmPreview.apr}</SimVal>
          </SimRow>
          <SimRow>
            <span>Multiplier</span>
            <SimVal>{farmPreview.multiplier}</SimVal>
          </SimRow>
          <SimRow>
            <span>Reward budget</span>
            <SimVal>{farmPreview.budget}</SimVal>
          </SimRow>
          <SimRow>
            <span>Duration</span>
            <SimVal>{farmPreview.duration}</SimVal>
          </SimRow>
        </SimBlock>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }} disabled>
          Create Farm
        </BsPrimaryBtn>
      </Inner>
    </BsPanel>
  )
}

function BuilderTemplatesCard() {
  const { builderTemplates, selectedTemplateId, setSelectedTemplateId } = useBuildRuntime()

  return (
    <BsPanel data-bs-panel data-bs-builder-templates $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle>Builder Templates</BsCardTitle>
        <BuilderGrid>
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
      </Inner>
    </BsPanel>
  )
}

function QuickCreateTokenCard() {
  return (
    <BsPanel data-bs-panel $emphasis="reduced" $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle $size="reduced">Create Token</BsCardTitle>
        <BsBody style={{ fontSize: 13, lineHeight: '20px', color: buildStudioColors.muted }}>
          Quick access to token deployment preparation with AI manifest generation.
        </BsBody>
        <BsOutlineBtn type="button" $height="42px" style={{ marginTop: 'auto' }} disabled>
          <IconCoins size={16} />
          Open Token Builder
        </BsOutlineBtn>
      </Inner>
    </BsPanel>
  )
}

export const SecondRowCards: React.FC = () => (
  <Grid data-bs-second-row>
    <QuickCreateTokenCard />
    <StakingPoolCard />
    <CreateFarmCard />
    <BuilderTemplatesCard />
  </Grid>
)

export default SecondRowCards
