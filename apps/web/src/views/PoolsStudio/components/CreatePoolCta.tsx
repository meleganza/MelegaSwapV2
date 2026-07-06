import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { STAKING_TEMPLATES } from 'views/BuildStudio/buildStudioData'
import { poolsStudioColors } from '../poolsStudioTokens'
import { PsField, PsFieldLabel, PsInput, PsPrimaryBtn } from './poolsStudioPrimitives'

const Card = styled.section`
  width: 100%;
  border-radius: 20px;
  border: 1px solid ${poolsStudioColors.border};
  background: ${poolsStudioColors.panel};
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Title = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 20px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 991px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const SimRow = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${poolsStudioColors.border};
  background: rgba(255, 255, 255, 0.02);

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const SimItem = styled.div`
  font-size: 11px;
  color: ${poolsStudioColors.muted};

  strong {
    display: block;
    margin-top: 4px;
    font-size: 14px;
    color: ${poolsStudioColors.text};
  }
`

const template = STAKING_TEMPLATES[0]

export const CreatePoolCta: React.FC = () => (
  <Card data-ps-create-pool-builder>
    <Title>Create Pool</Title>
    <Grid>
      <PsField>
        <PsFieldLabel>Stake Token</PsFieldLabel>
        <PsInput value={premiumUiValue(template.stakeToken)} readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Reward Token</PsFieldLabel>
        <PsInput value="MARCO" readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Reward Budget</PsFieldLabel>
        <PsInput value="Preparation only" readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Lock Type</PsFieldLabel>
        <PsInput value={premiumUiValue(template.title)} readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Cooldown</PsFieldLabel>
        <PsInput value="None" readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Pool Duration</PsFieldLabel>
        <PsInput value="Configurable" readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>Start Date</PsFieldLabel>
        <PsInput value="At deployment" readOnly />
      </PsField>
      <PsField>
        <PsFieldLabel>End Date</PsFieldLabel>
        <PsInput value="At budget exhaustion" readOnly />
      </PsField>
    </Grid>
    <SimRow>
      <SimItem>
        APR Simulation
        <strong>8–12%</strong>
      </SimItem>
      <SimItem>
        Estimated Sustainability
        <strong>High</strong>
      </SimItem>
      <SimItem>
        Estimated Daily Distribution
        <strong>Runtime preview</strong>
      </SimItem>
      <SimItem>
        Participants Simulation
        <strong>—</strong>
      </SimItem>
    </SimRow>
    <PsPrimaryBtn as={Link} to="/build-studio?intent=staking-pool" type="button" style={{ alignSelf: 'flex-start', minWidth: 200 }}>
      Create Pool
    </PsPrimaryBtn>
  </Card>
)

export default CreatePoolCta
