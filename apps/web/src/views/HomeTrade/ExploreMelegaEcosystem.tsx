/**
 * Explore Melega Ecosystem — premium equal-weight grid before Home footer/trust.
 */
import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import {
  IdCard,
  Gift,
  FlaskConical,
  Orbit,
  Radar,
  Landmark,
} from 'lucide-react'
import { uxRebuildColors, uxRebuildRadius } from 'design-system/melega/tokens/uxRebuild'

type EcoItem = {
  id: string
  title: string
  subtitle: string
  href?: string
  comingSoon?: boolean
  Icon: React.ComponentType<{ size?: number; color?: string; 'aria-hidden'?: boolean }>
}

const ITEMS: EcoItem[] = [
  {
    id: 'passport',
    title: 'PASSPORT',
    subtitle: 'Identity and portfolio hub.',
    href: '/passport',
    Icon: IdCard,
  },
  {
    id: 'smartdrop',
    title: 'SMARTDROP',
    subtitle: 'Acquire active holders.',
    comingSoon: true,
    Icon: Gift,
  },
  {
    id: 'labs',
    title: 'LABS',
    subtitle: 'Trade narratives before listing.',
    comingSoon: true,
    Icon: FlaskConical,
  },
  {
    id: 'space',
    title: 'SPACE',
    subtitle: 'Increase project visibility.',
    comingSoon: true,
    Icon: Orbit,
  },
  {
    id: 'radar',
    title: 'RADAR',
    subtitle: 'Discover trends and claim profiles.',
    href: '/radar',
    Icon: Radar,
  },
  {
    id: 'maiora',
    title: 'MAIORA',
    subtitle: 'Melega strategic layer.',
    comingSoon: true,
    Icon: Landmark,
  },
]

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
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 18px;
  color: ${uxRebuildColors.muted};
`

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 1023px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 767px) {
    grid-template-columns: 1fr;
  }
`

const cardCss = `
  min-height: 128px;
  padding: 18px 16px;
  border-radius: ${uxRebuildRadius.card};
  background: ${uxRebuildColors.card};
  border: 1px solid ${uxRebuildColors.border};
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.24);
  display: flex;
  flex-direction: column;
  gap: 10px;
  box-sizing: border-box;
  text-decoration: none;
  color: inherit;
  transition: border-color 160ms ease, transform 160ms ease;
`

const CardLink = styled(Link)`
  ${cardCss}
  &:hover {
    border-color: rgba(221, 185, 47, 0.5);
    transform: translateY(-1px);
  }
`

const CardStatic = styled.div`
  ${cardCss}
  opacity: 0.92;
`

const IconWrap = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(221, 185, 47, 0.12);
  border: 1px solid rgba(221, 185, 47, 0.28);
  display: inline-flex;
  align-items: center;
  justify-content: center;
`

const CardTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0.04em;
  color: ${uxRebuildColors.text};
`

const CardSub = styled.div`
  font-size: 12px;
  line-height: 16px;
  color: ${uxRebuildColors.muted};
`

const Soon = styled.span`
  margin-top: auto;
  width: fit-content;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${uxRebuildColors.gold};
`

export const ExploreMelegaEcosystem: React.FC = () => (
  <Shell data-testid="dex-home-ecosystem" data-home-section="ecosystem">
    <Title>Explore Melega Ecosystem</Title>
    <Sub>One product surface across identity, discovery, and growth tools.</Sub>
    <Grid>
      {ITEMS.map((item) => {
        const body = (
          <>
            <IconWrap>
              <item.Icon size={18} color={uxRebuildColors.gold} aria-hidden />
            </IconWrap>
            <CardTitle>{item.title}</CardTitle>
            <CardSub>{item.subtitle}</CardSub>
            {item.comingSoon ? <Soon>Coming soon</Soon> : null}
          </>
        )
        if (item.href && !item.comingSoon) {
          return (
            <CardLink key={item.id} href={item.href}>
              {body}
            </CardLink>
          )
        }
        return <CardStatic key={item.id}>{body}</CardStatic>
      })}
    </Grid>
  </Shell>
)

export default ExploreMelegaEcosystem
