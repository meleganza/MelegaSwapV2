import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import { useBuildRuntime } from '../buildRuntime/BuildRuntimeContext'
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

const MachineBody = styled(BsManifestPreview)`
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

export const BuildMachinePanel: React.FC = () => {
  const { machine } = useBuildRuntime()
  const [open, setOpen] = useState(false)
  const fullText = useMemo(() => JSON.stringify(machine, null, 2), [machine])
  const lines = useMemo(() => fullText.split('\n'), [fullText])
  const hasMore = lines.length > VISIBLE_LINES
  const displayText = open || !hasMore ? fullText : `${lines.slice(0, VISIBLE_LINES).join('\n')}\n  …`

  const handleCopy = useCallback(() => {
    void navigator.clipboard?.writeText(fullText)
  }, [fullText])

  const handleDownload = useCallback(() => {
    const blob = new Blob([fullText], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'build-runtime-machine.json'
    a.click()
    URL.revokeObjectURL(url)
  }, [fullText])

  return (
    <BsPanel data-bs-machine-json>
      <Inner>
        <Header>
          <TitleBlock>
            <Title>Build Machine JSON</Title>
            <Sub>Runtime machine payload — complements AI Manifest, does not replace it</Sub>
          </TitleBlock>
          <StatusRow>
            <span style={{ fontFamily: BS_FONT_BODY, fontSize: 12, color: buildStudioColors.label }}>Schema</span>
            <BsBadge $variant="green">melega.surface.v1</BsBadge>
          </StatusRow>
        </Header>

        {open ? <MachineBody data-bs-machine-preview>{displayText}</MachineBody> : null}

        <CollapseBtn type="button" onClick={() => setOpen(!open)}>
          {open ? 'Collapse machine JSON' : 'Expand machine JSON'}
        </CollapseBtn>

        {open ? (
          <BtnRow>
            <BsOutlineBtn type="button" $width="160px" $height="44px" onClick={handleCopy}>
              Copy JSON
            </BsOutlineBtn>
            <BsOutlineBtn type="button" $width="160px" $height="44px" onClick={handleDownload}>
              Download JSON
            </BsOutlineBtn>
          </BtnRow>
        ) : null}
      </Inner>
    </BsPanel>
  )
}

export default BuildMachinePanel
