import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ArrowRight, BadgePlus, FileBadge2, Rocket, Sparkles } from 'lucide-react'

const Shell = styled.section`
  margin-bottom: 18px;
  min-width: 0;
`
const Header = styled.div`
  display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 22px;
  h1 { margin: 0; color: #171817; font-size: clamp(32px, 4vw, 48px); line-height: 1; letter-spacing: -.045em; }
  p { margin: 8px 0 0; color: #72736e; font-size: 14px; }
  @media (max-width: 767px) { padding: 0 16px; }
`
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
  @media (max-width: 1023px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 639px) { grid-template-columns: 1fr; gap: 10px; padding: 0 12px; }
`
const Card = styled(Link)`
  min-width: 0; min-height: 176px; padding: 20px; border-radius: 20px;
  border: 1px solid #e5e2d9;
  background: #fff;
  color: #171817; text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
  box-shadow: 0 16px 44px rgba(23,24,23,.06);
  transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
  &:hover { transform: translateY(-2px); border-color: #e1bd2a; box-shadow: 0 20px 56px rgba(23,24,23,.1); }
  &:focus-visible { outline: 2px solid #f3c928; outline-offset: 2px; }
  @media (max-width: 639px) { min-height: 112px; padding: 16px; flex-direction: row; align-items: center; }
`
const Icon = styled.span`
  width: 46px; height: 46px; flex: 0 0 46px; display: grid; place-items: center;
  border-radius: 14px; background: #fff2bd; color: #171817;
  border: 1px solid #ead15f;
`
const Copy = styled.div`
  min-width: 0; flex: 1;
  h2 { margin: 0; font-size: 17px; line-height: 22px; }
  p { margin: 5px 0 0; color: #72736e; font-size: 12px; line-height: 17px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
`
const Cta = styled.span`
  min-height: 44px; display: flex; align-items: center; justify-content: space-between; gap: 8px;
  color: #8a6c00; font-size: 12px; font-weight: 800;
  @media (max-width: 639px) { width: 44px; flex: 0 0 44px; justify-content: center; span { display: none; } }
`

const SERVICES = [
  { title: 'Create Token', description: 'Launch through the canonical BNB factory.', cta: 'Create token', href: '/list?intent=create-token', Icon: BadgePlus },
  { title: 'Trend Boost', description: 'Promote a claimed project in Trending.', cta: 'Boost project', href: '/list?intent=claim-project#trend-boost', Icon: Rocket },
  { title: 'Featured Project', description: 'Apply for the verified Featured rotation.', cta: 'Get featured', href: '/list?intent=claim-project#featured', Icon: Sparkles },
  { title: 'Premium Project Page', description: 'Create or claim your official project page.', cta: 'Open service', href: '/list?intent=create-project', Icon: FileBadge2 },
] as const

export const ToolsServiceGrid: React.FC = () => (
  <Shell data-testid="tools-premium-services">
    <Header><div><h1>Tools</h1><p>Build and grow on Melega.</p></div></Header>
    <Grid>
      {SERVICES.map(({ title, description, cta, href, Icon: ServiceIcon }) => (
        <Card key={title} href={href} data-tool-service={title.toLowerCase().replaceAll(' ', '-')}>
          <Icon><ServiceIcon size={21} /></Icon>
          <Copy><h2>{title}</h2><p>{description}</p></Copy>
          <Cta><span>{cta}</span><ArrowRight size={17} /></Cta>
        </Card>
      ))}
    </Grid>
  </Shell>
)

export default ToolsServiceGrid
