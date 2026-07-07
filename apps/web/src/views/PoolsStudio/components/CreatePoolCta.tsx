import React from 'react'
import { Link } from 'react-router-dom'
import styled, { css } from 'styled-components'
import { premiumUiValue } from 'design-system/melega/tokens/premiumStudio'
import { STAKING_TEMPLATES } from 'views/BuildStudio/buildStudioData'
import { poolsStudioColors } from '../poolsStudioTokens'

const Card = styled.section`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background: #141414;
  border: 1px solid rgba(212, 175, 55, 0.45);
  border-radius: 22px;
  padding: 32px 36px 34px;
  display: flex;
  flex-direction: column;
  overflow: visible;

  @media (max-width: 767px) {
    padding: 18px;
    border-radius: 18px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    margin-bottom: 32px;
    scroll-margin-top: 72px;
    scroll-margin-bottom: 120px;
  }
`

const Header = styled.div`
  margin-bottom: 24px;

  @media (max-width: 767px) {
    margin-bottom: 18px;
  }
`

const Title = styled.h2`
  margin: 0;
  font-family: Orbitron, sans-serif;
  font-size: 32px;
  line-height: 38px;
  font-weight: 700;
  color: #ffffff;

  @media (max-width: 767px) {
    font-size: 24px;
    line-height: 30px;
  }
`

const Subtitle = styled.p`
  margin: 6px 0 0;
  font-family: Inter, sans-serif;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  color: #9a9a9a;

  @media (max-width: 767px) {
    font-size: 12px;
    line-height: 18px;
  }
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  column-gap: 18px;
  row-gap: 18px;
  width: 100%;

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
    column-gap: 0;
    row-gap: 10px;
  }
`

const Field = styled.div`
  display: flex;
  flex-direction: column;
  height: 68px;
  min-height: 68px;
  min-width: 0;
  overflow: visible;

  @media (max-width: 767px) {
    height: 56px;
    min-height: 56px;
  }
`

const Label = styled.span`
  font-family: Inter, sans-serif;
  font-size: 11px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: #7f7f7f;
  white-space: nowrap;
  overflow: visible;

  @media (max-width: 767px) {
    font-size: 9px;
    line-height: 11px;
    letter-spacing: 0.08em;
    color: #777777;
  }
`

const valueTextStyles = css<{ $compact?: boolean }>`
  font-family: Inter, sans-serif;
  font-size: ${({ $compact }) => ($compact ? '12px' : '14px')};
  font-weight: 700;
  line-height: 1.2;
  color: #f2f2f2;

  @media (max-width: 767px) {
    font-size: 12px;
    font-weight: 600;
    color: #ffffff;
  }
`

const inputSurfaceStyles = css`
  margin-top: 8px;
  height: 42px;
  min-height: 42px;
  width: 100%;
  box-sizing: border-box;
  padding: 0 14px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  background: #1a1a1a;
  overflow: visible;
  text-overflow: clip;
  white-space: nowrap;
`

const InputBox = styled.input<{ $compact?: boolean }>`
  ${inputSurfaceStyles}
  ${valueTextStyles}

  &::placeholder {
    color: #7f7f7f;
  }

  @media (max-width: 767px) {
    margin-top: 6px;
    height: 38px;
    min-height: 38px;
    padding: 0 12px;
    border-radius: 10px;
    border-color: #292929;
  }
`

const PreviewBtn = styled.button`
  ${inputSurfaceStyles}
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  color: ${poolsStudioColors.explorerGold};
  text-align: left;
  cursor: pointer;

  @media (max-width: 767px) {
    margin-top: 6px;
    height: 38px;
    min-height: 38px;
    padding: 0 12px;
    font-size: 12px;
    font-weight: 600;
    border-radius: 10px;
    border-color: #292929;
  }
`

const Footer = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-top: 24px;
  width: 100%;
  min-width: 0;

  @media (max-width: 767px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    margin-top: 14px;
  }
`

const CreateBtn = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 168px;
  min-width: 168px;
  height: 46px;
  border: none;
  border-radius: 12px;
  background: #e8c43a;
  color: #050505;
  font-family: Inter, sans-serif;
  font-size: 14px;
  font-weight: 800;
  text-decoration: none;
  flex-shrink: 0;
  transition: box-shadow 150ms ease;
  overflow: visible;

  &:hover {
    box-shadow: 0 0 24px rgba(232, 196, 58, 0.22);
  }

  @media (max-width: 767px) {
    width: 100%;
    min-width: 0;
    height: 44px;
  }
`

const FooterNote = styled.p`
  margin: 0;
  max-width: 420px;
  font-family: Inter, sans-serif;
  font-size: 13px;
  line-height: 18px;
  font-weight: 400;
  color: #8c8c8c;

  @media (max-width: 767px) {
    max-width: none;
    margin-top: 10px;
    font-size: 12px;
    color: #888888;
  }
`

const FIELDS: { label: string; value: string; preview?: boolean; compact?: boolean }[] = [
  { label: 'Reward Token', value: 'MARCO' },
  { label: 'Stake Token', value: '' },
  { label: 'Reward Budget', value: 'Configurable' },
  { label: 'Emission Duration', value: 'Budget exhaustion', compact: true },
  { label: 'Lock Type', value: 'Flexible / Fixed', compact: true },
  { label: 'Lock Period', value: '30 / 90 / 180 / 365d', compact: true },
  { label: 'Cool-off', value: 'None / 7 Days', compact: true },
  { label: 'Auto Compound', value: 'Optional' },
  { label: 'Deposit Fee', value: '0%' },
  { label: 'Withdrawal Fee', value: '0%' },
  { label: 'Pool Type', value: 'Official / Partner', compact: true },
  { label: 'Minimum Stake', value: 'Configurable' },
  { label: 'Maximum Stake', value: 'Configurable' },
  { label: 'Visibility', value: 'Build Studio toggle', compact: true },
  { label: 'Reward Sustainability', value: 'Runtime preview', compact: true },
  { label: 'Machine Preview', value: 'View JSON', preview: true },
]

const template = STAKING_TEMPLATES[0]

export const CreatePoolCta: React.FC = () => {
  const fields = FIELDS.map((field) =>
    field.label === 'Stake Token'
      ? { ...field, value: premiumUiValue(template.stakeToken) }
      : field,
  )

  return (
    <Card
      id="create-pool"
      data-ps-create-pool-builder
      data-r709-create-pool
      data-r710-create-pool
      data-r711-create-pool
      data-r712-create-pool
    >
      <Header>
        <Title>Create Pool</Title>
        <Subtitle>Configure reward token, stake token, emission, lock and safety parameters.</Subtitle>
      </Header>
      <Grid data-ps-create-pool-grid>
        {fields.map((field) => (
          <Field key={field.label} data-ps-create-field>
            <Label>{field.label}</Label>
            {field.preview ? (
              <PreviewBtn type="button" data-ps-create-machine-preview>
                View JSON
              </PreviewBtn>
            ) : (
              <InputBox
                value={field.value}
                readOnly
                aria-label={field.label}
                $compact={field.compact}
                data-ps-create-value={field.compact ? 'compact' : 'default'}
              />
            )}
          </Field>
        ))}
      </Grid>
      <Footer data-ps-create-pool-footer>
        <CreateBtn to="/build-studio?intent=staking-pool#create-pool" data-ps-create-pool-btn>
          Create Pool
        </CreateBtn>
        <FooterNote>
          Creates a reward configuration preview. On-chain deployment remains gated.
        </FooterNote>
      </Footer>
    </Card>
  )
}

export default CreatePoolCta
