import React, { useState } from 'react'
import styled from 'styled-components'
import { projectsStudioColors, projectsStudioLayout } from '../projectsStudioTokens'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PrPanel } from './projectsStudioPrimitives'

const Title = styled.h3`
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid ${projectsStudioColors.rowBorder};

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.secondary};
`

const Value = styled.span<{ $tone?: 'green' | 'gold' }>`
  font-size: 14px;
  font-weight: 800;
  color: ${({ $tone }) =>
    $tone === 'green' ? projectsStudioColors.green : $tone === 'gold' ? projectsStudioColors.gold : projectsStudioColors.text};
  white-space: nowrap;
`

const Score = styled.span`
  font-size: 12px;
  font-weight: 700;
  color: ${projectsStudioColors.muted};
`

const RecList = styled.ul`
  margin: 12px 0 0;
  padding: 0 0 0 16px;
  font-size: 11px;
  line-height: 1.45;
  color: ${projectsStudioColors.secondary};
`

const Sustainability = styled.div`
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid ${projectsStudioColors.rowBorder};
`

const SustainLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${projectsStudioColors.muted};
  margin-bottom: 8px;
`

const Bar = styled.div`
  height: 6px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  overflow: hidden;
`

const Fill = styled.div<{ $width: string }>`
  height: 100%;
  width: ${({ $width }) => $width};
  border-radius: 999px;
  background: linear-gradient(90deg, ${projectsStudioColors.green}, ${projectsStudioColors.gold});
`

const MachineToggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${projectsStudioColors.muted};
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
  border: 1px solid ${projectsStudioColors.border};
  font-size: 9px;
  line-height: 1.35;
  color: ${projectsStudioColors.muted};
  max-height: 80px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
`

export const AIProjectAdvisorPanel: React.FC = () => {
  const { advisorRows, recommendations, indexCoverage, machine } = useProjectsRuntime()
  const [machineOpen, setMachineOpen] = useState(false)

  return (
    <PrPanel data-pr-panel data-pr-advisor $height={projectsStudioLayout.featuredHeight} style={{ padding: '18px', display: 'flex', flexDirection: 'column' }}>
      <Title>AI Project Advisor</Title>
      <List>
        {advisorRows.map((row) => (
          <Row key={row.label}>
            <div>
              <Label>{row.label}</Label>
              <div>
                <Value $tone={row.tone}>{row.value}</Value>
              </div>
            </div>
            <Score>{row.score}</Score>
          </Row>
        ))}
      </List>
      {recommendations.length > 0 && (
        <RecList>
          {recommendations.slice(0, 4).map((rec) => (
            <li key={rec.id}>{rec.text}</li>
          ))}
        </RecList>
      )}
      <Sustainability>
        <SustainLabel>
          <span>Index Coverage</span>
          <span style={{ color: projectsStudioColors.green }}>{indexCoverage.label}</span>
        </SustainLabel>
        <Bar>
          <Fill $width={`${indexCoverage.score}%`} />
        </Bar>
        <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: projectsStudioColors.muted, textAlign: 'right' }}>
          {indexCoverage.score}/100
        </div>
      </Sustainability>
      <MachineToggle type="button" onClick={() => setMachineOpen((v) => !v)}>
        {machineOpen ? 'Hide' : 'Show'} machine-readable runtime
      </MachineToggle>
      {machineOpen && (
        <MachinePre data-pr-machine-json>{JSON.stringify(machine, null, 2)}</MachinePre>
      )}
    </PrPanel>
  )
}

export default AIProjectAdvisorPanel
