import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { localBscTokenLogoCandidates } from 'lib/token-logo/localTokenLogoPath'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PROJECTS_SCROLL_KEY } from '../projectsDirectoryV3'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout, PR_FONT_BODY } from '../projectsStudioTokens'

const Wrap = styled.div`
  min-width: 0;
  font-family: ${PR_FONT_BODY};
`

const Count = styled.p`
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: ${projectsStudioColors.muted};
`

const TableViewport = styled.div`
  overflow-x: auto;
  border: 1px solid ${projectsStudioColors.cardBorder};
  border-radius: ${projectsStudioLayout.cardRadius};
  background: rgba(13, 13, 13, 0.86);
`

const Table = styled.div`
  min-width: 920px;
`

const HeaderRow = styled.div`
  min-height: 38px;
  display: grid;
  grid-template-columns: 44px minmax(220px, 1.65fr) 104px 112px 112px 112px 100px 132px;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  color: rgba(255, 255, 255, 0.42);
  font-size: 10px;
  line-height: 14px;
  font-weight: 760;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid ${projectsStudioColors.cardBorder};
`

const Row = styled.div`
  min-height: 68px;
  display: grid;
  grid-template-columns: 44px minmax(220px, 1.65fr) 104px 112px 112px 112px 100px 132px;
  gap: 12px;
  align-items: center;
  padding: 0 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.065);
  transition: background 120ms ease;

  &:last-child {
    border-bottom: 0;
  }
  &:hover {
    background: rgba(255, 255, 255, 0.025);
  }
`

const Rank = styled.span`
  color: rgba(255, 255, 255, 0.45);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
`

const Identity = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`

const Logo = styled.img`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: contain;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const Initial = styled.span`
  width: 34px;
  height: 34px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(244, 196, 48, 0.1);
  color: ${projectsStudioColors.gold};
  border: 1px solid rgba(244, 196, 48, 0.24);
  font-weight: 800;
`

const IdentityText = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`

const ProjectName = styled(Link)`
  color: ${projectsStudioColors.text};
  font-size: 14px;
  line-height: 18px;
  font-weight: 730;
  text-decoration: none;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Sub = styled.span`
  color: ${projectsStudioColors.muted};
  font-size: 11px;
  line-height: 14px;
`

const Metric = styled.span<{ $positive?: boolean; $negative?: boolean }>`
  color: ${({ $positive, $negative }) => ($positive ? '#18d987' : $negative ? '#ff5964' : projectsStudioColors.text)};
  font-size: 13px;
  font-weight: 660;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
`

const Actions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 6px;
`

const Action = styled(Link)<{ $primary?: boolean }>`
  min-height: 34px;
  padding: 0 10px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.48)' : projectsStudioColors.cardBorder)};
  background: ${({ $primary }) => ($primary ? 'rgba(244,196,48,0.13)' : 'transparent')};
  color: ${({ $primary }) => ($primary ? projectsStudioColors.gold : projectsStudioColors.text)};
  text-decoration: none;
  font-size: 11px;
  font-weight: 720;
`

const EmptyPanel = styled.div`
  padding: 22px 16px;
  border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.cardBorder};
  color: ${projectsStudioColors.muted};
  text-align: center;
`

const LoadMore = styled.button`
  display: block;
  margin: 16px auto 0;
  height: 40px;
  padding: 0 20px;
  border-radius: 10px;
  border: 1px solid ${projectsStudioColors.cardBorder};
  background: ${projectsStudioColors.card};
  color: ${projectsStudioColors.text};
  font-family: ${PR_FONT_BODY};
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
`

function metric(project: ProjectPreviewCard, ...labels: string[]): string {
  return project.metrics.find((entry) => labels.includes(entry.label))?.value ?? '—'
}

/** Discovery publishes every valid indexed/listed contract, while market fields
 * remain honest dashes until an observation is available. */
export function isMarketDiscoverableProject(project: ProjectPreviewCard): boolean {
  const address = project.contractAddress ?? project.contract
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return false
  const name = project.name.trim()
  if (!name || /^https?:\/\//i.test(name)) return false
  return !/^melega\s*dex$/i.test(name)
}

const IndexedProjectLogo: React.FC<{ project: ProjectPreviewCard }> = ({ project }) => {
  const address = project.contractAddress ?? project.contract
  const candidates = useMemo(() => {
    const local = project.chainId === 56 ? localBscTokenLogoCandidates(address) : []
    return [...new Set([project.logoURI, ...local].filter((value): value is string => Boolean(value)))]
  }, [address, project.chainId, project.logoURI])
  const [candidateIndex, setCandidateIndex] = useState(0)

  useEffect(() => setCandidateIndex(0), [address, project.chainId, project.logoURI])

  const candidate = candidates[candidateIndex]
  if (!candidate) return <Initial>{project.symbol?.[0] ?? project.name[0]}</Initial>

  return (
    <Logo
      src={candidate}
      alt={`${project.name} logo`}
      loading="lazy"
      onError={() => setCandidateIndex((index) => index + 1)}
    />
  )
}

export const ProjectsGrid: React.FC = () => {
  const { projects, visibleProjects, loadMore } = useProjectsRuntime()
  const realProjects = useMemo(() => projects.filter(isMarketDiscoverableProject), [projects])
  // Invalid registry records must not consume pagination slots. The runtime
  // still owns the page size; discovery applies that size to the already
  // validated market inventory.
  const realVisible = useMemo(
    () => realProjects.slice(0, Math.max(visibleProjects.length, 1)),
    [realProjects, visibleProjects.length],
  )
  const hasRealMore = realVisible.length < realProjects.length

  useEffect(() => {
    try {
      const y = Number(sessionStorage.getItem(PROJECTS_SCROLL_KEY))
      if (Number.isFinite(y) && y > 0) window.requestAnimationFrame(() => window.scrollTo(0, y))
    } catch {
      /* storage unavailable */
    }
  }, [])

  useEffect(() => {
    const onScroll = () => {
      try {
        sessionStorage.setItem(PROJECTS_SCROLL_KEY, String(window.scrollY))
      } catch {
        /* ignore */
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Wrap data-testid="projects-directory-list" data-projects-directory-view="market-list">
      <Count>{`Showing ${realVisible.length} of ${realProjects.length} indexed projects`}</Count>
      {realVisible.length === 0 ? (
        <EmptyPanel>No verified market records match these filters.</EmptyPanel>
      ) : (
        <TableViewport>
          <Table role="table" aria-label="Indexed projects">
            <HeaderRow role="row">
              <span>#</span>
              <span>Project</span>
              <span>Price</span>
              <span>24H</span>
              <span>Market cap</span>
              <span>Volume</span>
              <span>Chain</span>
              <span />
            </HeaderRow>
            {realVisible.map((project, index) => {
              const change = project.change24hPct
              return (
                <Row role="row" key={`${project.chainId ?? 0}:${project.contractAddress ?? project.id}`}>
                  <Rank>{index + 1}</Rank>
                  <Identity>
                    <IndexedProjectLogo project={project} />
                    <IdentityText>
                      <ProjectName href={project.projectHref ?? `/@${project.slug}`}>{project.name}</ProjectName>
                      <Sub>{project.symbol ? `$${project.symbol}` : project.contractAddress?.slice(0, 10)}</Sub>
                    </IdentityText>
                  </Identity>
                  <Metric>{project.priceDisplay ?? metric(project, 'Price')}</Metric>
                  <Metric $positive={change != null && change > 0} $negative={change != null && change < 0}>
                    {project.change24hDisplay ??
                      (change == null ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(2)}%`)}
                  </Metric>
                  <Metric>{metric(project, 'Market Cap', 'FDV')}</Metric>
                  <Metric>{metric(project, 'Volume', 'Volume 24h')}</Metric>
                  <Sub>{project.chains[0] ?? '—'}</Sub>
                  <Actions>
                    <Action href={project.projectHref ?? `/@${project.slug}`}>Project</Action>
                    <Action $primary href={project.tradeHref ?? '/swap'}>
                      Trade
                    </Action>
                  </Actions>
                </Row>
              )
            })}
          </Table>
        </TableViewport>
      )}
      {hasRealMore ? (
        <LoadMore type="button" onClick={loadMore} data-testid="projects-load-more">
          Load more
        </LoadMore>
      ) : null}
    </Wrap>
  )
}

export default ProjectsGrid
