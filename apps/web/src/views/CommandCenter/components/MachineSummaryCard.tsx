import React, { useCallback, useMemo } from 'react'
import styled from 'styled-components'
import { MACHINE_SUMMARY } from '../commandCenterData'
import { commandCenterColors, commandCenterLayout } from '../commandCenterTokens'
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
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`

const CopyBtn = styled(CcOutlineBtn)`
  width: auto;
  flex: 1;
  min-width: 140px;
  height: 40px;
`

export const MachineSummaryCard: React.FC = () => {
  const jsonText = useMemo(() => JSON.stringify(MACHINE_SUMMARY, null, 2), [])
  const previewLines = useMemo(() => jsonText.split('\n').slice(0, 8).join('\n'), [jsonText])

  const handleCopy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(jsonText).catch(() => undefined)
    }
  }, [jsonText])

  const handleDownload = useCallback(() => {
    if (typeof document === 'undefined' || typeof URL === 'undefined') return
    const blob = new Blob([jsonText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'melega-command-center-summary.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [jsonText])

  return (
    <CcDashCard data-cc-machine-summary $height={commandCenterLayout.machineSummaryHeight}>
      <CcCardHeader style={{ marginBottom: 0 }}>
        <CcTitle>Machine Summary</CcTitle>
        <CcPill $tone="gold">Machine Readable</CcPill>
      </CcCardHeader>
      <JsonBlock>{previewLines}</JsonBlock>
      <BtnRow>
        <CopyBtn type="button" onClick={handleCopy}>
          Copy Summary
        </CopyBtn>
        <CopyBtn type="button" onClick={handleDownload}>
          Download JSON
        </CopyBtn>
      </BtnRow>
    </CcDashCard>
  )
}

export default MachineSummaryCard
