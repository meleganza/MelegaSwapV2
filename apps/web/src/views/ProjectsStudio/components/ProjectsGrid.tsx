import React, { useEffect, useMemo } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ArrowUpRight } from 'lucide-react'
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
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
  @media (max-width: 1023px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 639px) { grid-template-columns: 1fr; gap: 10px; }
`
const Card = styled(Link)`
  min-width: 0; min-height: 136px; padding: 16px;
  border: 1px solid ${projectsStudioColors.cardBorder}; border-radius: ${projectsStudioLayout.cardRadius};
  background: linear-gradient(145deg, rgba(24,24,22,.98), rgba(11,11,11,.98));
  color: ${projectsStudioColors.text}; text-decoration: none;
  display: flex; flex-direction: column; justify-content: space-between; gap: 16px;
  transition: border-color 140ms ease, transform 140ms ease;
  &:hover { border-color: rgba(244,196,48,.42); transform: translateY(-2px); }
  &:focus-visible { outline: 2px solid ${projectsStudioColors.gold}; outline-offset: 2px; }
`
const Identity = styled.div`
  display: flex; align-items: center; gap: 12px; min-width: 0;
`
const Logo = styled.img`
  width: 44px; height: 44px; flex: 0 0 44px; border-radius: 50%; object-fit: contain;
  background: #090909; border: 1px solid rgba(255,255,255,.1);
`
const Initial = styled.span`
  width: 44px; height: 44px; flex: 0 0 44px; border-radius: 50%; display: grid; place-items: center;
  background: rgba(244,196,48,.12); border: 1px solid rgba(244,196,48,.28);
  color: ${projectsStudioColors.gold}; font-weight: 850;
`
const Names = styled.div`
  min-width: 0; flex: 1;
  strong, span { display: block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  strong { font-size: 16px; line-height: 20px; }
  span { margin-top: 3px; color: ${projectsStudioColors.muted}; font-size: 12px; }
`
const Open = styled.span`
  width: 44px; height: 44px; flex: 0 0 44px; display: grid; place-items: center;
  border-radius: 12px; border: 1px solid rgba(255,255,255,.1);
`
const Facts = styled.div`
  display: flex; align-items: center; gap: 8px 16px; flex-wrap: wrap;
  color: ${projectsStudioColors.secondary}; font-size: 12px;
  span:first-child { color: ${projectsStudioColors.gold}; font-weight: 750; }
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

function firstFact(project: ProjectPreviewCard): string | null {
  return project.metrics.find((entry) => entry.value && entry.value !== '—' && entry.value !== 'Unavailable')?.value ?? null
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
        <Grid>{realVisible.map((project) => {
          const fact = firstFact(project)
          return <Card key={`${project.chainId ?? 0}:${project.contractAddress ?? project.id}`} href={project.projectHref ?? `/@${project.slug}`}>
            <Identity>
              {project.logoURI ? <Logo src={project.logoURI} alt="" loading="lazy" /> : <Initial>{project.symbol?.[0] ?? project.name[0]}</Initial>}
              <Names><strong>{project.name}</strong><span>{project.symbol ? `$${project.symbol}` : project.contractAddress?.slice(0, 10)}</span></Names>
              <Open aria-hidden="true"><ArrowUpRight size={18} /></Open>
            </Identity>
            <Facts><span>{project.chains[0] ?? 'Verified'}</span>{fact ? <span>{fact}</span> : null}{project.featured ? <span>Featured</span> : null}{project.boosted ? <span>Boosted</span> : null}</Facts>
          </Card>
        })}</Grid>
      )}
      {hasRealMore ? <LoadMore type="button" onClick={loadMore} data-testid="projects-load-more">Load more</LoadMore> : null}
    </Wrap>
  )
}

export default ProjectsGrid
