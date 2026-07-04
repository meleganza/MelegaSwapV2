import React from 'react'
import styled from 'styled-components'
import { useImportRuntime } from '../importExistingTokenRuntime/ImportRuntimeContext'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { ItBody, ItPanel, ItSectionLabel, ItSourceTag } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const Top = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Logo = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 1px solid ${importTokenColors.border};
  background: linear-gradient(135deg, rgba(214, 180, 69, 0.2), rgba(19, 19, 19, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${IT_FONT_BODY};
  font-size: 24px;
  font-weight: 800;
  color: ${importTokenColors.gold};
  flex-shrink: 0;
`

const Meta = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_BODY};
  font-size: 24px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const TickerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  color: ${importTokenColors.muted};
`

const LinkRow = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 14px;
`

const Link = styled.a`
  font-size: 13px;
  font-weight: 700;
  color: ${importTokenColors.gold};
  text-decoration: none;
`

export const ProjectDetectedCard: React.FC = () => {
  const { analysis, contract } = useImportRuntime()
  if (!analysis || analysis.pending || !analysis.found || !analysis.project) return null

  const project = analysis.project
  const sym = analysis.symbol ?? project.displayName
  const addr = project.resources.tokens[0]?.address

  return (
    <Panel data-iet-project-detected>
      <ItSectionLabel>Step 3 — Canonical Project</ItSectionLabel>
      <Top>
        <Logo>{sym.slice(0, 2)}</Logo>
        <Meta>
          <Name>{analysis.projectName ?? project.displayName}</Name>
          <TickerRow>
            <span>{sym}</span>
            <ItSourceTag>Registry</ItSourceTag>
            {project.trustBadges.includes('canonical') ? <ItSourceTag>Canonical</ItSourceTag> : null}
          </TickerRow>
          <ItBody style={{ marginTop: 12 }}>{analysis.summary}</ItBody>
          <LinkRow>
            <Link href={`/projects/${project.slug}`}>Open Project</Link>
            {addr ? <Link href={`/radar?contract=${addr}`}>Radar Intelligence</Link> : null}
            {addr ? <Link href={`/swap?outputCurrency=${addr}`}>Trade</Link> : null}
          </LinkRow>
        </Meta>
      </Top>
      {contract ? (
        <TickerRow style={{ marginTop: 12 }}>
          Contract: {contract} · Provenance: Projects + Radar runtime
        </TickerRow>
      ) : null}
    </Panel>
  )
}

export default ProjectDetectedCard
