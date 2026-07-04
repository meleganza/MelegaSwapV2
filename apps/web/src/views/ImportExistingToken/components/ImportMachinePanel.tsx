import React, { useState } from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 20px 24px;
`

const JsonBlock = styled.pre`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${importTokenColors.border};
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: ${importTokenColors.body};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 200px;
  overflow-y: auto;
`

const ToggleBtn = styled.button`
  margin-top: 10px;
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${importTokenColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${importTokenColors.gold};
  font-family: ${IT_FONT_BODY};
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

export const ImportMachinePanel: React.FC = () => {
  const { machine } = useImportRuntime()
  const [open, setOpen] = useState(false)
  const jsonText = JSON.stringify(machine, null, 2)

  return (
    <Panel data-iet-machine-summary>
      <ItSectionLabel>Machine Summary</ItSectionLabel>
      <ToggleBtn type="button" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? 'Collapse' : 'Expand'} machine-readable runtime
      </ToggleBtn>
      {open ? <JsonBlock data-iet-machine-json>{jsonText}</JsonBlock> : null}
    </Panel>
  )
}

export default ImportMachinePanel
