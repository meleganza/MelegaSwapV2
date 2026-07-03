import React, { useState } from 'react'
import styled from 'styled-components'
import { BUILDER_TEMPLATES, FARM_SIMULATION, STAKING_TEMPLATES } from '../buildStudioData'
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
  max-height: 130px;
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

const BuilderCard = styled.button`
  padding: 10px;
  border-radius: 12px;
  border: 1px solid ${buildStudioColors.border};
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
          <BsInput value={template.stakeToken} readOnly={stakeLocked} style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput placeholder="Select reward token" style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }}>
          Create Pool
        </BsPrimaryBtn>
      </Inner>
    </BsPanel>
  )
}

function CreateFarmCard() {
  return (
    <BsPanel data-bs-panel data-bs-create-farm $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle>Create Farm</BsCardTitle>
        <BsField>
          <BsFieldLabel>LP Token</BsFieldLabel>
          <BsInput placeholder="MARCO-BNB LP" style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput placeholder="MARCO" style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <SimBlock data-bs-farm-simulation>
          <SimTitle>AI Simulation Summary</SimTitle>
          <SimRow>
            <span>Estimated APR</span>
            <SimVal>{FARM_SIMULATION.estimatedApr}</SimVal>
          </SimRow>
          <SimRow>
            <span>Estimated TVL</span>
            <SimVal>{FARM_SIMULATION.estimatedTvl}</SimVal>
          </SimRow>
          <SimRow>
            <span>Estimated emissions</span>
            <SimVal>{FARM_SIMULATION.estimatedEmissions}</SimVal>
          </SimRow>
          <SimRow>
            <span>Reward duration</span>
            <SimVal>{FARM_SIMULATION.rewardDuration}</SimVal>
          </SimRow>
          <SimRow>
            <span>Treasury impact</span>
            <SimVal>{FARM_SIMULATION.treasuryImpact}</SimVal>
          </SimRow>
        </SimBlock>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }}>
          Create Farm
        </BsPrimaryBtn>
      </Inner>
    </BsPanel>
  )
}

function BuilderTemplatesCard() {
  return (
    <BsPanel data-bs-panel data-bs-builder-templates $height={buildStudioLayout.secondRowCardH}>
      <Inner>
        <BsCardTitle>Builder Templates</BsCardTitle>
        <BuilderGrid>
          {BUILDER_TEMPLATES.map((t) => (
            <BuilderCard key={t.id} type="button">
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
          Quick access to token deployment with AI manifest generation.
        </BsBody>
        <BsOutlineBtn type="button" $height="42px" style={{ marginTop: 'auto' }}>
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
