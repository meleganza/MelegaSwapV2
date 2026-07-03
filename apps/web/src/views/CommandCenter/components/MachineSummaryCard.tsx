import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { useCommandRuntime } from '../commandCenterRuntime/CommandRuntimeContext'
import { commandCenterColors } from '../commandCenterTokens'
import { CcCardHeader, CcDashCard, CcOutlineBtn, CcPill, CcTitle } from './commandCenterPrimitives'

const JsonBlock = styled.pre`
  margin: 0;
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid ${commandCenterColors.border};
  font-family: 'SF Mono', 'Menlo', 'Monaco', monospace;
  font-size: 11px;
  line-height: 1.55;
  color: ${commandCenterColors.body};
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 160px;
  overflow-y: auto;
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const CopyBtn = styled(CcOutlineBtn)`
  width: auto;
  flex: 1;
  min-width: 120px;
  height: 40px;
`

const ExpandBtn = styled.button`
  height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${commandCenterColors.border};
  background: rgba(255, 255, 255, 0.04);
  color: ${commandCenterColors.gold};
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`

export const MachineSummaryCard: React.FC = () => {
  const { machine } = useCommandRuntime()
  const [expanded, setExpanded] = useState(false)
  const jsonText = useMemo(() => JSON.stringify(machine, null, 2), [machine])

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => undefined)
    }
  }

  const handleDownload = () => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'melega-command-center-summary.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <CcDashCard data-cc-machine-summary>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Machine Summary</CcTitle>
        <HeaderActions>
          <CcPill $tone="gold">Machine Readable</CcPill>
          <ExpandBtn type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
            {expanded ? 'Collapse' : 'Expand'}
          </ExpandBtn>
        </HeaderActions>
      </CcCardHeader>
      {expanded && (
        <>
          <JsonBlock>{jsonText.split('\n').slice(0, 8).join('\n')}</JsonBlock>
          <BtnRow>
            <CopyBtn type="button" onClick={handleCopy}>
              Copy Summary
            </CopyBtn>
            <CopyBtn type="button" onClick={handleDownload}>
              Download JSON
            </CopyBtn>
          </BtnRow>
        </>
      )}
    </CcDashCard>
  )
}

export default MachineSummaryCard
