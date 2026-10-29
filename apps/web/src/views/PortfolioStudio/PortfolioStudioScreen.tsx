import React, { useMemo, useState, useTransition } from 'react'
import styled from 'styled-components'
import { useDisconnect } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import { Band, BandHead, BandMeta, BandTitle, Btn, Chip, DenseRow, DenseTable, ExtLink, Grid, Muted, Page, Row, Stack, TabBtn, TabRow, px } from './theme'
import { Metric } from './Metric'
import { explorerAddressUrl, positionActionLinks, type PositionDomain } from './runtime/buildPortfolioViewModel'
import { chainLabel } from './helpers'
import { usePortfolioRuntime } from './runtime/usePortfolioRuntime'

const TERMINATED_CHAIN_IDS = new Set([1, 137, 8453])

const Hero = styled(Band)`
  padding: 8px 0;
  border: 0;
  background: transparent;
`
const HeroRow = styled.div`
  display: flex; align-items: flex-end; justify-content: space-between; gap: 20px; min-width: 0;
  @media (max-width: 767px) { align-items: stretch; flex-direction: column; gap: 16px; }
`
const Identity = styled.div`display: flex; flex-direction: column; gap: 7px; min-width: 0;`
const Eyebrow = styled.span`color: ${px.gold}; font-size: 10px; font-weight: 850; letter-spacing: .1em; text-transform: uppercase;`
const Title = styled.h1`margin: 0; color: ${px.text}; font-size: clamp(30px,4vw,44px); line-height: 1; letter-spacing: -.045em;`
const Address = styled.code`color: ${px.mute}; font-family: ui-monospace,SFMono-Regular,Menlo,monospace; font-size: 12px; word-break: break-all;`
const HeroActions = styled(Row)`
  justify-content: flex-end;
  button, a { min-height: 44px; }
  @media (max-width: 767px) { justify-content: stretch; > * { flex: 1 1 auto; } }
`
const ValueBand = styled(Band)`
  display: grid; grid-template-columns: minmax(0,1.2fr) minmax(0,2fr); gap: 20px; align-items: center;
  @media (max-width: 767px) { grid-template-columns: 1fr; gap: 12px; }
`
const ValueLabel = styled.span`color: ${px.mute2}; font-size: 11px; font-weight: 750; letter-spacing: .06em; text-transform: uppercase;`
const Value = styled.div`margin-top: 4px; color: ${px.text}; font-size: clamp(30px,5vw,48px); font-weight: 850; line-height: 1; font-variant-numeric: tabular-nums;`
const StateBox = styled.div`
  display: flex; flex-direction: column; align-items: flex-start; gap: 10px; padding: 18px;
  border: 1px solid ${px.line}; border-radius: 12px; background: rgba(255,255,255,.025);
`
const Skeleton = styled.div`
  width: 100%; height: 14px; border-radius: 6px;
  background: linear-gradient(90deg,rgba(255,255,255,.04),rgba(255,255,255,.1),rgba(255,255,255,.04));
  background-size: 200% 100%; animation: portfolio-shimmer 1.2s linear infinite;
  @keyframes portfolio-shimmer { to { background-position: -200% 0; } }
`

export const PortfolioStudioScreen: React.FC = () => {
  const { model } = usePortfolioRuntime()
  const { disconnect } = useDisconnect()
  const [earnTab, setEarnTab] = useState<Exclude<PositionDomain, 'liquidity'>>('farms')
  const [, startTransition] = useTransition()
  const { wallet } = model
  const activeFarms = useMemo(() => model.farms.filter((p) => !TERMINATED_CHAIN_IDS.has(p.chainId ?? 0)), [model.farms])
  const activePools = useMemo(() => model.pools.filter((p) => !TERMINATED_CHAIN_IDS.has(p.chainId ?? 0)), [model.pools])
  const terminatedFarms = useMemo(() => model.farms.filter((p) => TERMINATED_CHAIN_IDS.has(p.chainId ?? 0)), [model.farms])
  const terminatedPools = useMemo(() => model.pools.filter((p) => TERMINATED_CHAIN_IDS.has(p.chainId ?? 0)), [model.pools])
  const portfolioMetric = model.summary.find((metric) => metric.id === 'portfolio')
  const assetMetrics = model.summary.filter((metric) => metric.id !== 'portfolio')

  return (
    <Page data-portfolio="premium-v3" data-portfolio-surface={model.surfaceState} data-portfolio-wallet={wallet.connected ? 'connected' : 'disconnected'} data-testid="portfolio-studio-screen">
      <PageMeta />
      <Stack>
        <Hero data-portfolio-section="hero" data-testid="portfolio-section-hero">
          <HeroRow>
            <Identity>
              <Title>Portfolio</Title>
            </Identity>
            <HeroActions data-testid="portfolio-hero-ctas">
              {!wallet.connected ? <ConnectWalletButton>Connect Wallet</ConnectWalletButton> : null}
            </HeroActions>
          </HeroRow>
        </Hero>

        {!wallet.connected ? (
          <StateBox data-testid="portfolio-disconnected-state">
            <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
          </StateBox>
        ) : (
          <>
            <ValueBand data-portfolio-section="assets" data-testid="portfolio-section-assets">
              <div>
                <ValueLabel>Total Value</ValueLabel>
                <Value data-testid="portfolio-value">{portfolioMetric?.value || '—'}</Value>
                <Muted>{portfolioMetric?.source || 'Valuation unavailable'}</Muted>
              </div>
              <Grid $cols={4}>
                {assetMetrics.map((metric) => <Metric key={metric.id} label={metric.label} value={metric.value || '—'} source={metric.source} tone={metric.partial || metric.status === 'partial' ? 'gold' : metric.status === 'zero' ? 'mute' : undefined} testId={`portfolio-metric-${metric.id}`} />)}
              </Grid>
            </ValueBand>

            <Band data-portfolio-section="positions" data-testid="portfolio-section-positions">
              <BandHead><BandTitle>Earn</BandTitle><BandMeta>BNB Chain</BandMeta></BandHead>
              <TabRow role="tablist" aria-label="Earn positions">
                <TabBtn type="button" role="tab" $active={earnTab === 'farms'} aria-selected={earnTab === 'farms'} onClick={() => startTransition(() => setEarnTab('farms'))}>Farms ({activeFarms.length})</TabBtn>
                <TabBtn type="button" role="tab" $active={earnTab === 'pools'} aria-selected={earnTab === 'pools'} onClick={() => startTransition(() => setEarnTab('pools'))}>Pools ({activePools.length})</TabBtn>
              </TabRow>
              {model.surfaceState === 'LOADING' ? <Skeleton data-testid="portfolio-positions-skeleton" /> : null}
              {earnTab === 'farms' && model.surfaceState !== 'LOADING' ? (activeFarms.length === 0 ? <Muted>No active farm positions.</Muted> : (
                <DenseTable data-position-domain="farms">{activeFarms.map((p) => { const links = positionActionLinks('farms'); return (
                  <DenseRow key={p.positionId} data-testid="portfolio-farm-row">
                    <div><Row><MelegaExploreChainBadge chainId={p.chainId} /><strong>{p.token0.symbol}/{p.token1.symbol}</strong></Row></div>
                    <div><div>Staked</div><strong>{p.stakedFormatted}</strong></div><div><div>Rewards</div><strong>{p.pendingFormatted}</strong></div>
                    <div><Btn href={links.harvestHref || links.manageHref} $primary>Harvest</Btn></div><div><Btn href={links.manageHref} $ghost>Manage</Btn></div>
                  </DenseRow>) })}</DenseTable>
              )) : null}
              {earnTab === 'pools' && model.surfaceState !== 'LOADING' ? (activePools.length === 0 ? <Muted>No active pool positions.</Muted> : (
                <DenseTable data-position-domain="pools">{activePools.map((p) => { const links = positionActionLinks('pools'); return (
                  <DenseRow key={p.positionId} data-testid="portfolio-pool-row">
                    <div><Row><MelegaExploreChainBadge chainId={p.chainId} /><strong>{p.stakeToken.symbol}</strong></Row></div>
                    <div><div>Staked</div><strong>{p.stakedFormatted}</strong></div><div><div>Rewards</div><strong>{p.claimableFormatted}</strong></div>
                    <div><Btn href={links.claimHref || links.manageHref} $primary>Claim</Btn></div><div><Btn href={links.manageHref} $ghost>Manage</Btn></div>
                  </DenseRow>) })}</DenseTable>
              )) : null}
            </Band>

            {model.liquidity.length > 0 ? (
              <Band data-portfolio-section="liquidity" data-testid="portfolio-section-liquidity">
                <BandHead><BandTitle>Liquidity</BandTitle><BandMeta>{model.liquidity.length} positions</BandMeta></BandHead>
                <DenseTable data-position-domain="liquidity">{model.liquidity.map((p) => { const links = positionActionLinks('liquidity', p.id); return (
                  <DenseRow key={p.id} data-testid="portfolio-liquidity-row">
                    <div><Row><MelegaTokenAvatar symbol={p.token0Symbol} size={22} /><MelegaTokenAvatar symbol={p.token1Symbol} size={22} /><strong>{p.pairLabel}</strong></Row></div>
                    <div><div>Value</div><strong>{p.estimatedValue || '—'}</strong></div><div><div>Share</div><strong>{p.sharePrimary}</strong></div>
                    <div><Btn href={links.manageHref} $ghost>Manage</Btn></div><div><Btn href={links.removeHref || links.manageHref} $ghost>Remove</Btn></div>
                  </DenseRow>) })}</DenseTable>
              </Band>
            ) : null}

            {model.claimables.length > 0 ? (
              <Band data-portfolio-section="rewards" data-testid="portfolio-section-rewards">
                <BandHead><BandTitle>Earn</BandTitle><BandMeta>{model.claimables.length} claimable</BandMeta></BandHead>
                <DenseTable>{model.claimables.map((reward) => (
                  <DenseRow key={reward.id} data-testid="portfolio-claimable-row">
                    <div><strong>{reward.source}</strong><div>{reward.token}</div></div><div><strong>{reward.amount}</strong></div><div><strong>{reward.estimatedUsd || '—'}</strong></div>
                    <div><Btn href={reward.actionHref} $primary>{reward.actionLabel}</Btn></div><div>{reward.contractHref ? <ExtLink href={reward.contractHref} target="_blank" rel="noreferrer">Contract</ExtLink> : null}</div>
                  </DenseRow>
                ))}</DenseTable>
              </Band>
            ) : null}

            {terminatedFarms.length + terminatedPools.length > 0 ? (
              <Band data-portfolio-section="terminated" data-testid="portfolio-section-terminated">
                <BandHead><BandTitle>Finished</BandTitle><BandMeta>Exit only</BandMeta></BandHead>
                <DenseTable>
                  {terminatedFarms.map((p) => { const links = positionActionLinks('farms'); const contract = explorerAddressUrl(p.masterChef, p.chainId); return (
                    <DenseRow key={p.positionId} data-testid="portfolio-terminated-farm-row">
                      <div><Row><MelegaExploreChainBadge chainId={p.chainId} /><strong>{p.token0.symbol}/{p.token1.symbol}</strong></Row></div><div><div>Staked</div><strong>{p.stakedFormatted}</strong></div><div><div>Rewards</div><strong>{p.pendingFormatted}</strong></div>
                      <div><Btn href={links.manageHref} $primary>Exit options</Btn></div><div>{contract ? <ExtLink href={contract} target="_blank" rel="noreferrer">Contract</ExtLink> : null}</div>
                    </DenseRow>) })}
                  {terminatedPools.map((p) => { const links = positionActionLinks('pools'); const contract = explorerAddressUrl(p.poolContract, p.chainId); return (
                    <DenseRow key={p.positionId} data-testid="portfolio-terminated-pool-row">
                      <div><Row><MelegaExploreChainBadge chainId={p.chainId} /><strong>{p.stakeToken.symbol}</strong></Row></div><div><div>Staked</div><strong>{p.stakedFormatted}</strong></div><div><div>Rewards</div><strong>{p.claimableFormatted}</strong></div>
                      <div><Btn href={links.manageHref} $primary>Exit options</Btn></div><div>{contract ? <ExtLink href={contract} target="_blank" rel="noreferrer">Contract</ExtLink> : null}</div>
                    </DenseRow>) })}
                </DenseTable>
              </Band>
            ) : null}
          </>
        )}
      </Stack>
    </Page>
  )
}

export default PortfolioStudioScreen
