import React, { useState } from 'react'
import styled from 'styled-components'
import { poolsStudioColors, poolsStudioLayout } from '../poolsStudioTokens'
import { usePoolsRuntime } from '../poolsRuntime/PoolsRuntimeContext'
import { PsPanel } from './poolsStudioPrimitives'

const Title = styled.h3`
  margin: 0 0 14px;
  font-family: Orbitron, sans-serif;
  font-size: 16px;
  font-weight: 800;
  color: ${poolsStudioColors.text};
`

const Row = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid ${poolsStudioColors.rowBorder};

  &:last-of-type {
    border-bottom: none;
  }
`

const Icon = styled.span<{ $tone?: string }>`
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  flex-shrink: 0;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? poolsStudioColors.green
      : $tone === 'gold'
        ? poolsStudioColors.gold
        : $tone === 'blue'
          ? poolsStudioColors.blue
          : poolsStudioColors.muted};
`

const RowText = styled.div`
  flex: 1;
  min-width: 0;
`

const RowLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${poolsStudioColors.muted};
  margin-bottom: 2px;
`

const RowValue = styled.div<{ $tone?: string }>`
  font-size: 13px;
  font-weight: 700;
  line-height: 1.4;
  word-break: break-word;
  color: ${({ $tone }) =>
    $tone === 'green'
      ? poolsStudioColors.green
      : $tone === 'gold'
        ? poolsStudioColors.gold
        : $tone === 'blue'
          ? poolsStudioColors.blue
          : poolsStudioColors.text};
`

const Sustain = styled.div`
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid ${poolsStudioColors.rowBorder};
`

const SustainLabel = styled.div`
  font-size: 11px;
  font-weight: 700;
  color: ${poolsStudioColors.muted};
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
`

const BarTrack = styled.div`
  height: 8px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

const BarFill = styled.div<{ $score: number }>`
  height: 100%;
  width: ${({ $score }) => $score}%;
  background: linear-gradient(90deg, ${poolsStudioColors.green}, #4ade80);
  border-radius: 999px;
  transition: width 900ms ease;
`

const SustainMeta = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${poolsStudioColors.green};
`

const MachineToggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${poolsStudioColors.muted};
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  text-align: left;
`

const MachinePre = styled.pre`
  margin: 8px 0 0;
  padding: 8px;
  border-radius: 8px;
  background: #0c0c0c;
  border: 1px solid ${poolsStudioColors.border};
  font-size: 9px;
  line-height: 1.35;
  color: ${poolsStudioColors.muted};
  max-height: 80px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

export const AIRewardAdvisorPanel: React.FC = () => {
  const { advisorItems, sustainability, machine, loadingLabel } = usePoolsRuntime()
  const [machineOpen, setMachineOpen] = useState(false)

  return (
    <PsPanel
      data-ps-panel
      data-ps-advisor
      $height={poolsStudioLayout.featuredHeight}
      $radius="20px"
      style={{ padding: '18px', width: '100%' }}
    >
      <Title>AI Reward Advisor</Title>
      {loadingLabel ? (
        <RowLabel>{loadingLabel}</RowLabel>
      ) : (
        advisorItems.map((row) => (
          <Row key={row.label}>
            <Icon $tone={row.tone}>{row.icon}</Icon>
            <RowText>
              <RowLabel>{row.label}</RowLabel>
              <RowValue $tone={row.tone}>{row.value}</RowValue>
            </RowText>
          </Row>
        ))
      )}
      <Sustain>
        <SustainLabel>{sustainability.label}</SustainLabel>
        <BarTrack>
          <BarFill $score={sustainability.score} data-ps-sustain-bar />
        </BarTrack>
        <SustainMeta>
          <span>{sustainability.level}</span>
          <span>{sustainability.score}/100</span>
        </SustainMeta>
      </Sustain>
      <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
        {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
      </MachineToggle>
      {machineOpen && (
        <MachinePre data-ps-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
      )}
    </PsPanel>
  )
}

export default AIRewardAdvisorPanel
