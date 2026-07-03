import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { AI_MANIFEST_PREVIEW } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItBadge, ItManifestPre, ItOutlineBtn, ItPanel, ItSectionLabel } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
`

const ManifestBody = styled(ItManifestPre)`
  margin: 0;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${importTokenColors.border};
  background: #0a0a0a;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: ${importTokenColors.green};
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
  max-height: 280px;
  overflow-y: auto;
`

const BtnRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 12px;
`

const CollapseBtn = styled.button`
  border: none;
  background: transparent;
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${importTokenColors.gold};
  cursor: pointer;
  padding: 0;
`

const VISIBLE_LINES = 12

export const AIManifestSection: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const fullText = useMemo(() => JSON.stringify(AI_MANIFEST_PREVIEW, null, 2), [])
  const lines = useMemo(() => fullText.split('\n'), [fullText])
  const displayText = expanded ? fullText : `${lines.slice(0, VISIBLE_LINES).join('\n')}\n  …`

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(fullText)
  }, [fullText])

  const handleDownload = useCallback(() => {
    const blob = new Blob([fullText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'onboarding-manifest.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [fullText])

  return (
    <Panel data-iet-ai-manifest>
      <ItSectionLabel>Step 7 — AI Manifest</ItSectionLabel>
      <Header>
        <span style={{ fontFamily: IT_FONT_BODY, fontSize: 12, color: importTokenColors.label }}>Manifest Status</span>
        <ItBadge $variant="green">Machine Ready</ItBadge>
      </Header>
      <ManifestBody data-iet-manifest-preview>{displayText}</ManifestBody>
      {lines.length > VISIBLE_LINES ? (
        <CollapseBtn type="button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer lines' : `Expand all ${lines.length} lines`}
        </CollapseBtn>
      ) : null}
      <BtnRow>
        <ItOutlineBtn type="button" $width="140px" onClick={handleCopy}>
          Copy
        </ItOutlineBtn>
        <ItOutlineBtn type="button" $width="140px" onClick={handleDownload}>
          Download
        </ItOutlineBtn>
      </BtnRow>
    </Panel>
  )
}

export default AIManifestSection
