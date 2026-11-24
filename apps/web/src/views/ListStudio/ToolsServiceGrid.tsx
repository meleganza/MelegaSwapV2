import React from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { ArrowRight, BadgePlus, Droplets, FileBadge2, Grid2X2, Info, Lock, Rocket, Send, ShieldCheck, Sparkles } from 'lucide-react'

const Shell = styled.section`
  margin-bottom: 18px;
  min-width: 0;
`
const Header = styled.div`
  display: flex; align-items: end; justify-content: space-between; gap: 16px; margin-bottom: 22px;
  h1 { margin: 0; color: #171817; font-size: clamp(32px, 4vw, 48px); line-height: 1; letter-spacing: -.045em; }
  p { margin: 8px 0 0; color: #72736E; font-size: 14px; line-height: 1.4; }
  @media (max-width: 767px) { padding: 0 16px; }
`
const Grid = styled.div`
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px;
  @media (max-width: 1023px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 639px) { grid-template-columns: 1fr; gap: 10px; padding: 0 12px; }
`
const AdditionalTitle = styled.h2`
  margin: 26px 0 12px; color: #171817; font-size: 18px; letter-spacing: -.02em;
  @media (max-width: 639px) { padding: 0 16px; }
`
const AdditionalGrid = styled.div`
  display: grid; grid-template-columns: repeat(6, minmax(0, 1fr)); gap: 10px;
  @media (max-width: 900px) { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  @media (max-width: 639px) { padding: 0 12px; }
`
const MiniCard = styled(Link)`
  min-height: 112px; padding: 14px 8px; border: 1px solid #eeeae1; border-radius: 18px;
  background: #fff; color: #171817; text-decoration: none; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px; text-align: center;
  span { font-size: 12px; font-weight: 780; line-height: 1.2; }
  small { color: #72736e; font-size: 10px; line-height: 1.25; }
  &:focus-visible { outline: 2px solid #f3c928; outline-offset: 2px; }
`
const Card = styled(Link)`
  min-width: 0; min-height: 176px; padding: 20px; border-radius: 20px;
  border: 1px solid #e5e2d9;
  background: #fff;
  color: #171817; text-decoration: none; display: flex; flex-direction: column; justify-content: space-between; gap: 18px;
  box-shadow: none;
  transition: border-color 140ms ease;
  &:hover { border-color: #e1bd2a; }
  &:focus-visible { outline: 2px solid #f3c928; outline-offset: 2px; }
  @media (max-width: 639px) {
    min-height: 88px; padding: 12px; flex-direction: row; align-items: center; gap: 12px;
    &:nth-child(1) { background: linear-gradient(110deg,#fff9df,#fff); }
    &:nth-child(2) { background: linear-gradient(110deg,#eef8ff,#fff); }
    &:nth-child(3) { background: linear-gradient(110deg,#f7f0ff,#fff); }
    &:nth-child(4) { background: linear-gradient(110deg,#eafff7,#fff); }
  }
`
const Icon = styled.span`
  width: 56px; height: 56px; flex: 0 0 56px; display: grid; place-items: center;
  border-radius: 16px; background: #fff2bd; color: #c88a00;
  border: 0;
  /* R035B: per-service tint as in the approved Tools mockup. */
  a:nth-child(2) > & { background: #e6f2ff; color: #1d5fe0; }
  a:nth-child(3) > & { background: #f1eaff; color: #6b3fd6; }
  a:nth-child(4) > & { background: #e2f7ee; color: #1f9a63; }
`
const Copy = styled.div`
  min-width: 0; flex: 1;
  h2 { margin: 0; font-size: 17px; line-height: 22px; }
  p { margin: 5px 0 0; color: #72736e; font-size: 13px; line-height: 18px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
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

const ADDITIONAL_SERVICES = [
  { title: 'Liquidity Building', description: 'Add or manage liquidity.', href: '/liquidity-studio', Icon: Droplets },
  { title: 'Batch Sender', description: 'Send tokens to multiple wallets.', href: '', Icon: Send },
  { title: 'Token Info', description: 'View charts, holders and details.', href: '/projects?sort=trending', Icon: Info },
  { title: 'Contract Audit', description: 'Verify your smart contract.', href: '/audit', Icon: ShieldCheck },
  { title: 'Lock Liquidity', description: 'Secure your LP tokens.', href: '/liquidity', Icon: Lock },
  { title: 'More Tools', description: 'Additional utilities.', href: '/list', Icon: Grid2X2 },
] as const

export const ToolsServiceGrid: React.FC = () => (
  <Shell data-testid="tools-premium-services">
    <Header><div><h1>Tools</h1><p>Build, grow and promote your project on MelegaDEX.</p></div></Header>
    <Grid>
      {SERVICES.map(({ title, description, cta, href, Icon: ServiceIcon }) => (
        <Card key={title} href={href} data-tool-service={title.toLowerCase().replaceAll(' ', '-')}>
          <Icon><ServiceIcon size={21} /></Icon>
          <Copy><h2>{title}</h2><p>{description}</p></Copy>
          <Cta><span>{cta}</span><ArrowRight size={17} /></Cta>
        </Card>
      ))}
    </Grid>
    <AdditionalTitle>Additional Tools</AdditionalTitle>
    <AdditionalGrid>
      {ADDITIONAL_SERVICES.map(({ title, description, href, Icon: ServiceIcon }) =>
        href ? (
          <MiniCard key={title} href={href}>
            <ServiceIcon size={25} strokeWidth={1.8} />
            <span>{title}</span>
            <small>{description}</small>
          </MiniCard>
        ) : (
          // No live route exists for this service yet: shown as unavailable instead of linking to a 404.
          <MiniCard key={title} as="div" aria-disabled="true" style={{ opacity: 0.55 }}>
            <ServiceIcon size={25} strokeWidth={1.8} />
            <span>{title}</span>
            <small>Not available yet</small>
          </MiniCard>
        ),
      )}
    </AdditionalGrid>
  </Shell>
)

export default ToolsServiceGrid
