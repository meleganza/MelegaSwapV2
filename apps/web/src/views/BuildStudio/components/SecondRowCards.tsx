import React, { useState } from 'react'
import styled from 'styled-components'
import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { NAV_COMING_SOON_LABEL } from 'lib/navigation/comingSoon'
import { STAKING_TEMPLATES } from '../buildStudioData'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
import { BS_FONT_BODY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import {
  BsCardTitle,
  BsField,
  BsFieldLabel,
  BsInput,
  BsLabel,
  BsPanel,
  BsPrimaryBtn,
} from './buildStudioPrimitives'

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: ${buildStudioLayout.cardGap};
  width: 100%;
  align-items: stretch;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const Inner = styled.div`
  padding: 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: visible;
`

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
`

const CardShell = styled(BsPanel)`
  min-height: auto;
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

export function StakingPoolCard() {
  const { poolPreview } = useBuildRuntime()
  const [templateId, setTemplateId] = useState('marco-holders')
  const template = STAKING_TEMPLATES.find((t) => t.id === templateId) ?? STAKING_TEMPLATES[0]
  const stakeLocked = template.lockStakeToken

  return (
    <CardShell data-bs-panel data-bs-staking-pool>
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
            value={premiumUiValue(poolPreview.available ? poolPreview.stakeToken : template.stakeToken)}
            readOnly={stakeLocked}
            style={{ height: 40, fontSize: 13 }}
          />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput value={premiumUiValue(poolPreview.rewardToken)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <SimBlock>
          <SimTitle>Pools Runtime</SimTitle>
          <SimRow>
            <span>APR</span>
            <SimVal>{premiumUiValue(poolPreview.apr)}</SimVal>
          </SimRow>
          <SimRow>
            <span>Pool Type</span>
            <SimVal>{premiumUiValue(poolPreview.poolType)}</SimVal>
          </SimRow>
          <SimRow>
            <span>Lock</span>
            <SimVal>{premiumUiValue(poolPreview.lock)}</SimVal>
          </SimRow>
        </SimBlock>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }} disabled title={NAV_COMING_SOON_LABEL}>
          {NAV_COMING_SOON_LABEL}
        </BsPrimaryBtn>
      </Inner>
    </CardShell>
  )
}

export function CreateFarmCard() {
  const { farmPreview } = useBuildRuntime()

  return (
    <CardShell data-bs-panel data-bs-create-farm>
      <Inner>
        <BsCardTitle>Create Farm</BsCardTitle>
        <BsField>
          <BsFieldLabel>Reward Token</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.reward)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>LP Token</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.lp)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>APR</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.apr)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Multiplier</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.multiplier)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Reward Budget</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.budget)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsField>
          <BsFieldLabel>Duration</BsFieldLabel>
          <BsInput value={premiumUiValue(farmPreview.duration)} readOnly style={{ height: 40, fontSize: 13 }} />
        </BsField>
        <BsPrimaryBtn type="button" $height="42px" style={{ marginTop: 'auto' }} disabled title={NAV_COMING_SOON_LABEL}>
          {NAV_COMING_SOON_LABEL}
        </BsPrimaryBtn>
      </Inner>
    </CardShell>
  )
}

export const SecondRowCards: React.FC = () => (
  <Grid data-bs-second-row>
    <StakingPoolCard />
    <CreateFarmCard />
  </Grid>
)

export default SecondRowCards
