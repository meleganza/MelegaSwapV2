/**
 * Explore Melega Ecosystem — dense equal-weight destination grid (6 in one desktop row).
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { IdCard, Gift, FlaskConical, Orbit, Radar, Landmark } from 'lucide-react'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'
import { ECOSYSTEM_DESTINATIONS } from './ecosystemDestinations'

const ICONS: Record<string, React.ComponentType<{ size?: number; color?: string; 'aria-hidden'?: boolean }>> = {
  passport: IdCard,
  smartdrop: Gift,
  labs: FlaskConical,
  space: Orbit,
  radar: Radar,
  maiora: Landmark,
}

const Shell = styled.section`
  min-width: 0;
  margin-top: 8px;
`

const Title = styled.h2`
  margin: 0 0 4px;
  font-size: 18px;
  line-height: 24px;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: ${uxRebuildColors.text};
`

const Sub = styled.p`
  margin: 0 0 12px;
  font-size: 13px;
  line-height: 18px;
  color: ${uxRebuildColors.muted};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 8px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 430px) {
    grid-template-columns: 1fr;
  }
`

const cardCss = `
  height: 72px;
  min-height: 72px;
  max-height: 72px;
  padding: 8px 10px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  grid-template-rows: auto auto;
  column-gap: 8px;
  row-gap: 2px;
  align-content: center;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  transition: border-color 160ms ease, transform 160ms ease;
  overflow: hidden;
`

const CardLink = styled(Link)`
  ${cardCss}
  &:hover {
    border-color: rgba(221, 185, 47, 0.5);
    transform: translateY(-1px);
  }
`

const CardExternal = styled.a`
  ${cardCss}
  &:hover {
    border-color: rgba(221, 185, 47, 0.5);
    transform: translateY(-1px);
  }
`

const CardStatic = styled.div`
  ${cardCss}
  opacity: 0.78;
  cursor: not-allowed;
`

const IconWrap = styled.span`
  grid-row: 1 / span 2;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(221, 185, 47, 0.12);
  border: 1px solid rgba(221, 185, 47, 0.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  align-self: center;
`

const CardTitle = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${uxRebuildColors.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const CardSub = styled.div`
  font-size: 10px;
  line-height: 13px;
  color: ${uxRebuildColors.muted};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Disabled = styled.span`
  grid-column: 2;
  font-size: 9px;
  font-weight: 750;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: ${uxRebuildColors.muted};
  white-space: nowrap;
`

export const ExploreMelegaEcosystem: React.FC = () => (
  <Shell data-testid="dex-home-ecosystem" data-home-section="ecosystem">
    <Title>Explore Melega Ecosystem</Title>
    <Sub>One product surface across identity, discovery, and growth tools.</Sub>
    <Grid>
      {ECOSYSTEM_DESTINATIONS.map((item) => {
        const Icon = ICONS[item.id] ?? Landmark
        const body = (
          <>
            <IconWrap>
              <Icon size={14} color={uxRebuildColors.gold} aria-hidden />
            </IconWrap>
            <CardTitle>
              {item.title}
              {item.disabled ? (
                <>
                  {' '}
                  <Disabled as="span">· {item.disabledLabel ?? 'Unavailable'}</Disabled>
                </>
              ) : null}
            </CardTitle>
            <CardSub>{item.subtitle}</CardSub>
          </>
        )

        if (item.disabled || !item.href) {
          return <CardStatic key={item.id}>{body}</CardStatic>
        }

        if (item.external) {
          return (
            <CardExternal key={item.id} href={item.href} target="_blank" rel="noopener noreferrer">
              {body}
            </CardExternal>
          )
        }

        return (
          <CardLink key={item.id} href={item.href}>
            {body}
          </CardLink>
        )
      })}
    </Grid>
  </Shell>
)

export default ExploreMelegaEcosystem
