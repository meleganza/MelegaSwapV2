/**
 * Home Featured Projects — four rotating premium cards (presentation / future monetization).
 * Eligibility is project-page owned later; today rotates listed registry projects.
 */
import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { getAllProjects } from 'registry/projects/getAllProjects'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

const ROTATE_MS = 8000

const Shell = styled.section`
  min-width: 0;
`

const Head = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`

const Title = styled.h2`
  margin: 0;
  font-size: 18px;
  line-height: 24px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${uxRebuildColors.text};
`

const Hint = styled.span`
  font-size: 12px;
  color: ${uxRebuildColors.muted};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1199px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const fade = keyframes`
  from { opacity: 0.55; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`

const Card = styled(Link)`
  min-height: 118px;
  padding: 16px;
  border-radius: ${uxRebuildRadius.card};
  background:
    radial-gradient(ellipse 80% 70% at 100% 0%, rgba(221, 185, 47, 0.1), transparent 55%),
    ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.22);
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-sizing: border-box;
  animation: ${fade} 420ms ease;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: rgba(221, 185, 47, 0.5);
    transform: translateY(-1px);
  }
`

const Eyebrow = styled.div`
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${uxRebuildColors.gold};
`

const Name = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${uxRebuildColors.text};
  line-height: 22px;
`

const Meta = styled.div`
  margin-top: auto;
  font-size: 12px;
  color: ${uxRebuildColors.muted};
  line-height: 16px;
`

export const FeaturedProjectsRail: React.FC = () => {
  const catalog = useMemo(
    () =>
      getAllProjects()
        .filter((p) => p.slug && p.slug !== 'melega-dex')
        .map((p) => ({
          id: p.slug,
          name: p.displayName || p.slug,
          meta: p.resources?.tokens?.[0]?.symbol || 'Listed project',
          href: `/@${p.slug}`,
        })),
    [],
  )
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    if (catalog.length <= 4) return undefined
    const id = window.setInterval(() => {
      setOffset((o) => (o + 4) % catalog.length)
    }, ROTATE_MS)
    return () => window.clearInterval(id)
  }, [catalog.length])

  const visible = useMemo(() => {
    if (catalog.length === 0) return []
    if (catalog.length <= 4) return catalog
    const out = []
    for (let i = 0; i < 4; i += 1) {
      out.push(catalog[(offset + i) % catalog.length])
    }
    return out
  }, [catalog, offset])

  if (visible.length === 0) return null

  return (
    <Shell data-testid="dex-home-featured-projects" data-home-section="featured-projects">
      <Head>
        <Title>Featured Projects</Title>
        <Hint>Rotating · Project Pages own eligibility</Hint>
      </Head>
      <Grid>
        {visible.map((p) => (
          <Card key={`${p.id}-${offset}`} href={p.href}>
            <Eyebrow>Featured</Eyebrow>
            <Name>{p.name}</Name>
            <Meta>{p.meta}</Meta>
          </Card>
        ))}
      </Grid>
    </Shell>
  )
}

export default FeaturedProjectsRail
