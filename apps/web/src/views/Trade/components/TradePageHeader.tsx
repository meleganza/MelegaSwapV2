import React, { useMemo } from 'react'
import Link from 'next/link'
import styled, { keyframes } from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { resolveFounderFeaturedProjects } from 'views/HomeTrade/featuredProjectsCatalog'
import {
  formatFeaturedChange,
  formatFeaturedLiquidity,
  formatFeaturedPrice,
  formatFeaturedVolume,
  useFeaturedProjectMarkets,
} from 'views/HomeTrade/useFeaturedProjectMarkets'

const halo = keyframes`0%,100%{box-shadow:0 0 12px rgba(244,196,48,.10)}50%{box-shadow:0 0 24px rgba(244,196,48,.24)}`
const Hero = styled.section`
  min-height: 260px; padding: 24px; display: grid; grid-template-columns: minmax(260px,.42fr) minmax(0,1fr);
  gap: 22px; align-items: stretch; border: 1px solid rgba(244,196,48,.25); border-radius: 20px;
  background: radial-gradient(circle at 16% 50%,rgba(244,196,48,.12),transparent 45%),#0c0c0c;
  @media(max-width:1023px){grid-template-columns:1fr} @media(max-width:767px){padding:18px}
`
const Copy = styled.div`display:flex;flex-direction:column;justify-content:center`
const Eyebrow = styled.div`color:#f4c430;font-size:11px;font-weight:850;letter-spacing:.12em;text-transform:uppercase`
const Title = styled.h1`margin:8px 0 12px;font-size:clamp(42px,5vw,64px);line-height:1;letter-spacing:-.04em`
const Description = styled.p`margin:0;max-width:390px;color:rgba(255,255,255,.65);font-size:15px;line-height:1.5`
const Grid = styled.div`display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;@media(max-width:720px){grid-template-columns:repeat(2,minmax(0,1fr))}`
const Card = styled.article`
  min-width:0;padding:11px;border:1px solid rgba(255,255,255,.09);border-radius:14px;background:#090909;
  display:flex;flex-direction:column;align-items:center;gap:7px;animation:${halo} 2.8s ease-in-out infinite;
`
const Label = styled.div`color:#f4c430;font-size:9px;font-weight:850;letter-spacing:.08em;text-transform:uppercase`
const Name = styled.div`max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;font-weight:800`
const Facts = styled.div`width:100%;display:grid;grid-template-columns:1fr 1fr;gap:5px`
const Fact = styled.div`min-width:0;text-align:center;color:rgba(255,255,255,.55);font-size:8px;text-transform:uppercase`
const Value = styled.div`margin-top:2px;color:#fff;font-size:9px;font-weight:800;text-transform:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap`
const Actions = styled.div`width:100%;display:grid;grid-template-columns:1fr 1fr;gap:5px;margin-top:auto`
const Action = styled(Link)<{$primary?:boolean}>`
  min-height:28px;display:flex;align-items:center;justify-content:center;border-radius:8px;text-decoration:none;
  border:1px solid ${({$primary})=>$primary?'#f4c430':'rgba(255,255,255,.15)'};background:${({$primary})=>$primary?'#f4c430':'transparent'};
  color:${({$primary})=>$primary?'#111':'#fff'};font-size:9px;font-weight:850;
`

export const TradePageHeader: React.FC = () => {
  const projects = useMemo(() => resolveFounderFeaturedProjects().slice(0, 4), [])
  const { rowsBySlug } = useFeaturedProjectMarkets()
  return (
    <Hero data-testid="trade-featured-hero">
      <Copy><Eyebrow>Melega DEX Trading</Eyebrow><Title>Swap</Title><Description>Trade with the best available multichain route and move directly into verified featured markets.</Description></Copy>
      <Grid>{projects.map((project) => {
        const row = rowsBySlug[project.slug]
        const change = formatFeaturedChange(row)
        const query = new URLSearchParams({ inputCurrency: 'BNB', outputCurrency: project.address || '' })
        return <Card key={project.slug}>
          <Label>Featured Project</Label>
          <MelegaTokenAvatar name={project.displayName} symbol={project.symbol} address={project.address} chainId={project.chainId} logoURI={project.logoUrl} size={36}/>
          <Name>{project.displayName}</Name>
          <Facts><Fact>Price<Value>{formatFeaturedPrice(row)}</Value></Fact><Fact>TVL<Value>{formatFeaturedLiquidity(row)}</Value></Fact><Fact>24H<Value>{change.text}</Value></Fact><Fact>Volume<Value>{formatFeaturedVolume(row)}</Value></Fact></Facts>
          <Actions><Action $primary href={`/swap?${query.toString()}`} prefetch={false}>Trade</Action><Action href={project.href} prefetch={false}>View Project</Action></Actions>
        </Card>
      })}</Grid>
    </Hero>
  )
}

export default TradePageHeader
