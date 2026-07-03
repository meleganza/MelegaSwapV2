import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { AI_MANIFEST_PREVIEW } from '../buildStudioData'
import { BS_FONT_BODY, BS_FONT_DISPLAY, buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsBadge, BsManifestPreview, BsOutlineBtn, BsPanel } from './buildStudioPrimitives'

const Inner = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`

const Title = styled.h2`
  margin: 0;
  font-family: ${BS_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 600;
  color: ${buildStudioColors.white};
`

const Sub = styled.span`
  font-family: ${BS_FONT_BODY};
  font-size: 14px;
  color: ${buildStudioColors.muted};
`

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`

const ManifestBody = styled(BsManifestPreview)`
  margin: 0;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid ${buildStudioColors.border};
  background: #0a0a0a;
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 12px;
  line-height: 1.6;
  color: ${buildStudioColors.green};
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
`

const CollapseBtn = styled.button`
  border: none;
  background: transparent;
  font-family: ${BS_FONT_BODY};
  font-size: 13px;
  font-weight: 600;
  color: ${buildStudioColors.gold};
  cursor: pointer;
  padding: 0;
  transition: opacity ${buildStudioLayout.btnTransition} ease;

  &:hover {
    opacity: 0.85;
  }
`

const VISIBLE_LINES = 10

export const AIManifestPanel: React.FC = () => {
  const [expanded, setExpanded] = useState(false)
  const fullText = useMemo(() => JSON.stringify(AI_MANIFEST_PREVIEW, null, 2), [])
  const lines = useMemo(() => fullText.split('\n'), [fullText])
  const hasMore = lines.length > VISIBLE_LINES
  const displayText = expanded || !hasMore ? fullText : `${lines.slice(0, VISIBLE_LINES).join('\n')}\n  …`

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(fullText)
  }, [fullText])

  const handleDownload = useCallback(() => {
    const blob = new Blob([fullText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'ai-manifest.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [fullText])

  return (
    <BsPanel data-bs-panel data-bs-ai-manifest>
      <Inner>
        <Header>
          <TitleBlock>
            <Title>AI Manifest</Title>
            <Sub>Machine-readable infrastructure specification — operationally validated before deployment</Sub>
          </TitleBlock>
          <StatusRow>
            <span style={{ fontFamily: BS_FONT_BODY, fontSize: 12, color: buildStudioColors.label }}>Manifest Status</span>
            <BsBadge $variant="green">Machine Readable</BsBadge>
          </StatusRow>
        </Header>

        <ManifestBody data-bs-manifest-preview>{displayText}</ManifestBody>

        {hasMore ? (
          <CollapseBtn type="button" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'Show fewer lines' : `Show all ${lines.length} lines`}
          </CollapseBtn>
        ) : null}

        <BtnRow>
          <BsOutlineBtn type="button" $width="160px" $height="44px" onClick={handleCopy}>
            Copy Manifest
          </BsOutlineBtn>
          <BsOutlineBtn type="button" $width="160px" $height="44px" onClick={handleDownload}>
            Download JSON
          </BsOutlineBtn>
        </BtnRow>
      </Inner>
    </BsPanel>
  )
}

export default AIManifestPanel
