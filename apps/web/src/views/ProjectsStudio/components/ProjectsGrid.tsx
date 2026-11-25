import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { useProjectsRuntime } from '../projectsRuntime/ProjectsRuntimeContext'
import { PROJECTS_SCROLL_KEY } from '../projectsDirectoryV3'
import type { ProjectPreviewCard } from '../projectsStudioData'
import { projectsStudioColors, projectsStudioLayout, PR_FONT_BODY } from '../projectsStudioTokens'

const Wrap = styled.section`
  min-width: 0;
  font-family: ${PR_FONT_BODY};
  @media (max-width: 767px) { padding: 0 16px; }
`
const Head = styled.div`
  display: flex; align-items: end; justify-content: space-between; gap: 12px; margin-bottom: 12px;
`
const Heading = styled.div`
  h2 { margin: 0; color: ${projectsStudioColors.text}; font-size: 20px; line-height: 1.2; }
  p { margin: 3px 0 0; color: ${projectsStudioColors.muted}; font-size: 12px; }
`
/* R035B: approved Explore mockup — ranked rows: rank, logo, name/symbol, verified fact, Swap. */
const Grid = styled.div`
  display: flex; flex-direction: column; gap: 6px;
  padding: 6px; border-radius: 18px; background: #FFFFFF; border: 1px solid #EFEDE6;
`
const Row = styled.div`
  min-width: 0; min-height: 60px; padding: 8px 10px; border-radius: 14px;
  display: grid; grid-template-columns: 26px minmax(0, 1fr) auto auto; align-items: center; gap: 10px;
  &:hover { background: #F7F6F2; }
`
const Rank = styled.span<{ $top?: boolean }>`
  width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center;
  font-size: 13px; font-weight: 600; color: #171817; background: ${({ $top }) => ($top ? '#FFF2BD' : 'transparent')};
`
const Card = styled(Link)`
  min-width: 0; color: ${projectsStudioColors.text}; text-decoration: none;
  &:focus-visible { outline: 2px solid ${projectsStudioColors.gold}; outline-offset: 2px; border-radius: 10px; }
`
const Identity = styled.div`
  display: flex; align-items: center; gap: 12px; min-width: 0;
`
const Logo = styled.img`
  width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; object-fit: contain;
  background: #F7F6F2;
`
const Initial = styled.span`
  width: 40px; height: 40px; flex: 0 0 40px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(244,196,48,.12); color: ${projectsStudioColors.gold}; font-weight: 800;
`
const Names = styled.div`
  min-width: 0; flex: 1;
  strong, span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  strong { font-size: 15px; line-height: 19px; }
  span { margin-top: 2px; color: ${projectsStudioColors.muted}; font-size: 12px; }
`
const Fact = styled.span`
  font-size: 13px; font-weight: 600; color: #171817; text-align: right; white-space: nowrap;
  max-width: 96px; overflow: hidden; text-overflow: ellipsis;
`
const SwapCta = styled(Link)`
  height: 34px; padding: 0 16px; border-radius: 10px; display: inline-flex; align-items: center;
  background: #FFF2BD !important; color: #171817 !important; font: 600 13px ${PR_FONT_BODY}; text-decoration: none;
  &:focus-visible { outline: 2px solid ${projectsStudioColors.gold}; outline-offset: 2px; }
`
const EmptyPanel = styled.div`
  padding: 22px 16px; border-radius: ${projectsStudioLayout.cardRadius};
  border: 1px solid ${projectsStudioColors.cardBorder}; color: ${projectsStudioColors.muted}; text-align: center;
`
const LoadMore = styled.button`
  display: block; margin: 16px auto 0; min-height: 44px; padding: 0 20px; border-radius: 12px;
  border: 1px solid ${projectsStudioColors.cardBorder}; background: ${projectsStudioColors.card};
  color: ${projectsStudioColors.text}; font: 700 13px ${PR_FONT_BODY}; cursor: pointer;
`

/** Fail closed: cards require a canonical contract and at least one indexed market fact. */
export function isMarketDiscoverableProject(project: ProjectPreviewCard): boolean {
  const address = project.contractAddress ?? project.contract
  if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) return false
  if (/^https?:\/\//i.test(project.name.trim()) || /^melega\s*dex$/i.test(project.name.trim())) return false
  return project.metrics.some((entry) => Boolean(entry.value && entry.value !== '—' && entry.value !== 'Unavailable'))
}

/** Row fact: verified price first, else the first known metric. Unknown values render "—", never "$0.00". */
const UNKNOWN_VALUES = new Set(['—', 'Unavailable', 'Price updating', '$0.00', '$0'])
function firstFact(project: ProjectPreviewCard): string | null {
  if (project.priceDisplay && !UNKNOWN_VALUES.has(project.priceDisplay)) return project.priceDisplay
  const MARKET_LABELS = new Set(['Liquidity', 'Volume', 'Volume 24h', 'FDV'])
  return (
    project.metrics.find((entry) => MARKET_LABELS.has(entry.label) && entry.value && !UNKNOWN_VALUES.has(entry.value))
      ?.value ?? null
  )
}

export const ProjectsGrid: React.FC = () => {
  const { projects, visibleProjects, loadMore, sort } = useProjectsRuntime()
  const realProjects = useMemo(() => projects.filter(isMarketDiscoverableProject), [projects])
  const realVisible = useMemo(() => realProjects.slice(0, Math.max(visibleProjects.length, 1)), [realProjects, visibleProjects.length])
  const hasRealMore = realVisible.length < realProjects.length

  useEffect(() => {
    try {
      const y = Number(sessionStorage.getItem(PROJECTS_SCROLL_KEY))
      if (Number.isFinite(y) && y > 0) window.requestAnimationFrame(() => window.scrollTo(0, y))
    } catch { /* storage unavailable */ }
  }, [])
  useEffect(() => {
    const onScroll = () => { try { sessionStorage.setItem(PROJECTS_SCROLL_KEY, String(window.scrollY)) } catch { /* ignore */ } }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <Wrap data-testid="projects-directory-list" data-projects-directory-view="premium-cards">
      <Head><Heading><h2>{sort === 'Trending' ? 'Trending' : 'Discover'}</h2><p>{realProjects.length} verified market {realProjects.length === 1 ? 'record' : 'records'}</p></Heading></Head>
      {realVisible.length === 0 ? <EmptyPanel>No verified projects match these filters.</EmptyPanel> : (
        <Grid>{realVisible.map((project, index) => {
          const fact = firstFact(project)
          const tradeHref = project.tradeHref && project.tradeHref.startsWith('/swap') ? project.tradeHref : null
          return <Row key={`${project.chainId ?? 0}:${project.contractAddress ?? project.id}`} data-testid="projects-directory-row">
            <Rank $top={index === 0}>{index + 1}</Rank>
            <Card href={project.projectHref ?? `/@${project.slug}`}>
              <Identity>
                {project.logoURI ? <Logo src={project.logoURI} alt="" loading="lazy" /> : <Initial>{project.symbol?.[0] ?? project.name[0]}</Initial>}
                <Names><strong>{project.name}</strong><span>{project.symbol ? `$${project.symbol}` : project.contractAddress?.slice(0, 10)}{project.featured ? ' · Featured' : ''}{project.boosted ? ' · Boosted' : ''}</span></Names>
              </Identity>
            </Card>
            <Fact title={fact ?? undefined}>{fact ?? '—'}</Fact>
            {tradeHref ? <SwapCta href={tradeHref} data-testid="projects-directory-swap">Swap</SwapCta> : <span />}
          </Row>
        })}</Grid>
      )}
      {hasRealMore ? <LoadMore type="button" onClick={loadMore} data-testid="projects-load-more">Load more</LoadMore> : null}
    </Wrap>
  )
}

export default ProjectsGrid
