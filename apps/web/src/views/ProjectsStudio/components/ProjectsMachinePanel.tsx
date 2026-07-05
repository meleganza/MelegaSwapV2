import React, { useState } from 'react'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { projectsStudioColors } from '../projectsStudioTokens'

const Panel = styled.div`
  background: ${projectsStudioColors.card};
  border: 1px solid ${projectsStudioColors.border};
  border-radius: 16px;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Title = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${projectsStudioColors.text};
`

const ToggleBtn = styled.button`
  align-self: flex-start;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${projectsStudioColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${projectsStudioColors.gold};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

const JsonBlock = styled.pre`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${projectsStudioColors.border};
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: ${projectsStudioColors.muted};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 220px;
  overflow-y: auto;
`

export const ProjectsMachinePanel: React.FC = () => {
  const { machine } = useProjectsRuntime()
  const [open, setOpen] = useState(false)
  const jsonText = JSON.stringify(machine, null, 2)

  return (
    <Panel data-projects-machine-json>
      <Title>Machine Summary</Title>
      <ToggleBtn type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Collapse' : 'Expand'} machine-readable runtime
      </ToggleBtn>
      {open ? <JsonBlock>{jsonText}</JsonBlock> : null}
    </Panel>
  )
}

export default ProjectsMachinePanel
