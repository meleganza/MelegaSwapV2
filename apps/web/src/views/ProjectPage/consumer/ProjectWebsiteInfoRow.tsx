import React from 'react'
import styled from 'styled-components'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { isTokenProjectTemplate } from './helpers'
import { IconChevronRight, IconLock, IconZap } from './ProjectWebsiteIcons'

const Row = styled.section`
  display: grid;
  gap: 14px;
  grid-template-columns: 1fr;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const Card = styled.article`
  min-height: 174px;
  padding: 16px;
  border-radius: 14px;
  background: #111111;
  border: 1px solid rgba(255, 255, 255, 0.075);
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.28);
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const Heading = styled.h2`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 16px;
  font-weight: 650;
  color: #ffffff;
  line-height: 1.15;
`

const Status = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: #ddb92f;
`

const Body = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.65);
`

const LockRow = styled.div`
  display: flex;
  gap: 14px;
  align-items: center;
  flex: 1;
`

const LockCircle = styled.div`
  width: 92px;
  height: 92px;
  border-radius: 999px;
  background: #151515;
  display: grid;
  place-items: center;
  color: rgba(221, 185, 47, 0.75);
  flex-shrink: 0;
`

const TextBtn = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 30px;
  padding: 0 12px;
  border-radius: 8px;
  border: 1px solid rgba(221, 185, 47, 0.28);
  color: #ddb92f;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  align-self: flex-start;
`

const Timeline = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

const Milestone = styled.li<{ $tone: 'done' | 'active' | 'upcoming' }>`
  display: grid;
  grid-template-columns: 58px 14px minmax(0, 1fr);
  align-items: center;
  height: 27px;
  gap: 4px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.72);

  span:first-child {
    font-size: 10px;
    color: ${({ $tone }) => ($tone === 'active' ? '#ddb92f' : 'rgba(255, 255, 255, 0.42)')};
  }

  span:nth-child(2) {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    justify-self: center;
    background: ${({ $tone }) =>
      $tone === 'done' ? '#11d978' : $tone === 'active' ? '#ddb92f' : 'rgba(255, 255, 255, 0.28)'};
  }
`

const UtilList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`

const UtilRow = styled.li`
  display: grid;
  grid-template-columns: 25px minmax(0, 1fr) 13px;
  align-items: center;
  gap: 8px;
  min-height: 30px;
`

const UtilIcon = styled.span`
  width: 25px;
  height: 25px;
  border-radius: 7px;
  background: rgba(221, 185, 47, 0.1);
  border: 1px solid rgba(221, 185, 47, 0.22);
  display: grid;
  place-items: center;
  color: #ddb92f;
`

const UtilText = styled.div`
  min-width: 0;

  strong {
    display: block;
    font-size: 11px;
    font-weight: 600;
    color: #f7f7f7;
  }

  span {
    display: block;
    font-size: 9px;
    color: rgba(255, 255, 255, 0.42);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`

const UTILITY_GROUPS = new Set(['PRODUCTS', 'INFRASTRUCTURE', 'ECONOMY', 'DEVELOPER'])

function roadmapTone(status: string): 'done' | 'active' | 'upcoming' {
  const n = status.toUpperCase()
  if (/COMPLETE|DONE|SHIPPED/.test(n)) return 'done'
  if (/PROGRESS|ACTIVE|CURRENT/.test(n)) return 'active'
  return 'upcoming'
}

interface Props {
  document: CanonicalProjectDocument
  tokenomicsDocument: ProjectTokenomicsDocument | null
  roadmapDocument: ProjectRoadmapDocument | null
  ecosystemDocument: ProjectEcosystemDocument
}

const ProjectWebsiteInfoRow: React.FC<Props> = ({
  document,
  tokenomicsDocument,
  roadmapDocument,
  ecosystemDocument,
}) => {
  const tokenMode = isTokenProjectTemplate(document)
  const tokenomicsPublished = Boolean(tokenomicsDocument?.published)
  const milestones = (roadmapDocument?.milestones ?? []).slice(0, 4)
  const utilities = ecosystemDocument.services
    .filter((s) => UTILITY_GROUPS.has(s.group))
    .slice(0, 4)

  return (
    <Row data-testid="project-website-info-row">
      {tokenMode ? (
        <Card id="tokenomics" aria-labelledby="tokenomics-heading">
          <Heading id="tokenomics-heading">Tokenomics</Heading>
          {!tokenomicsPublished ? (
            <>
              <Status>Publishing soon</Status>
              <LockRow>
                <LockCircle aria-hidden>
                  <IconLock size={24} />
                </LockCircle>
                <div>
                  <Body>Full tokenomics will be published here.</Body>
                  <TextBtn href="#more-tokenomics" style={{ marginTop: 10 }}>
                    Learn more
                  </TextBtn>
                </div>
              </LockRow>
            </>
          ) : (
            <>
              <Status>Published</Status>
              <Body>
                {(tokenomicsDocument?.allocationCategories ?? [])
                  .slice(0, 4)
                  .map((c) => c.label)
                  .join(' · ') || 'Allocation details available below.'}
              </Body>
              <TextBtn href="#more-tokenomics">View full tokenomics</TextBtn>
            </>
          )}
        </Card>
      ) : (
        <Card aria-labelledby="protocol-liquidity-heading">
          <Heading id="protocol-liquidity-heading">Liquidity</Heading>
          <Status>Live destinations</Status>
          <Body>Provide liquidity and manage positions through Liquidity Studio.</Body>
          <TextBtn href="/liquidity-studio">Open Liquidity</TextBtn>
        </Card>
      )}

      <Card id="roadmap" aria-labelledby="roadmap-heading">
        <Heading id="roadmap-heading">Roadmap</Heading>
        {milestones.length === 0 ? (
          <>
            <Status>Publishing soon</Status>
            <Body>Roadmap milestones will appear here when the project publishes them.</Body>
            <TextBtn href="#more-roadmap">View full roadmap</TextBtn>
          </>
        ) : (
          <>
            <Timeline>
              {milestones.map((m) => (
                <Milestone key={m.id} $tone={roadmapTone(m.status)}>
                  <span>{m.targetPeriod || '—'}</span>
                  <span aria-hidden />
                  <span>{m.title}</span>
                </Milestone>
              ))}
            </Timeline>
            <TextBtn href="#more-roadmap">View full roadmap</TextBtn>
          </>
        )}
      </Card>

      <Card id="utility" aria-labelledby="utility-heading">
        <Heading id="utility-heading">{tokenMode ? 'Utility' : 'Build'}</Heading>
        <Status>{tokenMode ? 'Powering the Melega Ecosystem' : 'Protocol surfaces'}</Status>
        {utilities.length > 0 ? (
          <UtilList>
            {utilities.map((u) => {
              const href = u.route ?? u.externalUrl
              return (
                <UtilRow key={u.serviceId}>
                  <UtilIcon aria-hidden>
                    <IconZap size={14} />
                  </UtilIcon>
                  <UtilText>
                    <strong>{u.title}</strong>
                    <span>{u.summary}</span>
                  </UtilText>
                  {href ? (
                    <a href={href} aria-label={`Open ${u.title}`} style={{ color: 'rgba(255,255,255,0.45)' }}>
                      <IconChevronRight size={13} />
                    </a>
                  ) : (
                    <span aria-hidden style={{ color: 'rgba(255,255,255,0.25)' }}>
                      <IconChevronRight size={13} />
                    </span>
                  )}
                </UtilRow>
              )
            })}
          </UtilList>
        ) : (
          <Body>No public utilities are registered for this project yet.</Body>
        )}
        <TextBtn href={tokenMode ? '#about' : '/projects'} style={{ height: 29 }}>
          Explore utilities
        </TextBtn>
      </Card>
    </Row>
  )
}

export default ProjectWebsiteInfoRow
