import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
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
  const { manifest } = useImportRuntime()
  const [expanded, setExpanded] = useState(false)
  const fullText = useMemo(() => JSON.stringify(manifest, null, 2), [manifest])
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
    a.download = 'import-manifest.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [fullText])

  return (
    <Panel data-iet-ai-manifest>
      <Header>
        <ItSectionLabel style={{ margin: 0 }}>AI Manifest</ItSectionLabel>
        <ItBadge $tone={manifest.status === 'ready' ? 'green' : 'yellow'}>{manifest.status}</ItBadge>
      </Header>
      <ManifestBody data-iet-manifest-preview>{displayText}</ManifestBody>
      {hasMore ? (
        <CollapseBtn type="button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'Show fewer lines' : `Show all ${lines.length} lines`}
        </CollapseBtn>
      ) : null}
      <BtnRow>
        <ItOutlineBtn type="button" onClick={handleCopy}>
          Copy Manifest
        </ItOutlineBtn>
        <ItOutlineBtn type="button" onClick={handleDownload}>
          Download JSON
        </ItOutlineBtn>
      </BtnRow>
    </Panel>
  )
}

export default AIManifestSection
