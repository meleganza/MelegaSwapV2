/**
 * Portfolio Studio — complete redesign.
 * Same visual language as Project Pages / Farms / Pools.
 * Product surface only: assets, positions, rewards, activity, analytics.
 */
import React, { useState, useTransition } from 'react'
import styled from 'styled-components'
import { useDisconnect } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import {
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Btn,
  Chip,
  DenseRow,
  DenseTable,
  ExtLink,
  Muted,
  Page,
  Row,
  Stack,
  TabBtn,
  TabRow,
  px,
} from './theme'
import { Metric } from './Metric'
import { explorerAddressUrl, positionActionLinks, type PositionDomain } from './runtime/buildPortfolioViewModel'
import { chainLabel } from './helpers'
import { usePortfolioRuntime } from './runtime/usePortfolioRuntime'

const HeroGrid = styled.div`
  display: grid;
  gap: 18px;
  min-width: 0;

  @media (min-width: 900px) {
    grid-template-columns: minmax(280px, 1fr) minmax(180px, 0.45fr) minmax(210px, 0.55fr) auto;
    align-items: center;
  }
`

const HeroLeft = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const HeroValue = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
`

const BrandLabel = styled.div`
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${px.gold};
`

const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(18px, 2.8vw, 24px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.15;
  color: #fff;
`

const HeroMetricLabel = styled.div`
  color: ${px.mute2};
  font-size: 11px;
  font-weight: 700;
`

const HeroMetricValue = styled.div<{ $muted?: boolean }>`
  color: ${({ $muted }) => ($muted ? px.mute : '#fff')};
  font-size: clamp(22px, 3vw, 34px);
  font-weight: 850;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #c8c8c8;
  word-break: break-all;
`

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;
`

const AnalyticsGrid = styled.div`
  display: grid;
  gap: 10px;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.45fr) minmax(240px, 0.85fr) minmax(240px, 0.85fr) minmax(170px, 0.55fr);
  }
`

const ChartCard = styled(Band)`
  min-height: 248px;
`

const ChartCanvas = styled.div`
  position: relative;
  min-height: 164px;
  margin-top: 8px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.05);
  background:
    linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px),
    radial-gradient(ellipse 80% 90% at 45% 120%, rgba(221,185,47,.14), transparent 68%),
    #090909;
  background-size: 100% 33.333%, 16.666% 100%, 100% 100%, 100% 100%;
  display: grid;
  place-items: center;
  padding: 22px;
  text-align: center;
`

const DonutLayout = styled.div`
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  min-height: 175px;
`

const Donut = styled.div<{ $gradient: string }>`
  width: 112px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: ${({ $gradient }) => $gradient};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 24px;
    border-radius: 50%;
    background: #0c0c0c;
    border: 1px solid rgba(255,255,255,.06);
  }
`

const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 32px;
  text-align: center;
  font-size: 11px;
  font-weight: 800;
  line-height: 1.2;
`

const Legend = styled.div`
  display: grid;
  gap: 8px;
  min-width: 0;
`

const LegendRow = styled.div`
  display: grid;
  grid-template-columns: 8px minmax(0, 1fr) auto;
  gap: 7px;
  align-items: center;
  font-size: 11px;
  color: ${px.mute};

  strong { color: ${px.text}; font-variant-numeric: tabular-nums; }
`

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
`

const KpiStack = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (min-width: 900px) {
    grid-template-columns: 1fr;
  }
`

const Kpi = styled(Band)`
  min-height: 76px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const Skeleton = styled.div`
  height: 14px;
  border-radius: 6px;
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.04));
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
  @keyframes shimmer {
    0% {
      background-position: 100% 0;
    }
    100% {
      background-position: -100% 0;
    }
  }
`

function donutGradient(items: Array<{ percentage: number; color: string }>): string {
  if (!items.length) return 'conic-gradient(rgba(255,255,255,.08) 0 100%)'
  let cursor = 0
  const stops = items.map((item) => {
    const start = cursor
    cursor += item.percentage
    return `${item.color} ${start}% ${cursor}%`
  })
  return `conic-gradient(${stops.join(', ')})`
}

export const PortfolioStudioScreen: React.FC = () => {
  const { model } = usePortfolioRuntime()
  const { disconnect } = useDisconnect()
  const [tab, setTab] = useState<PositionDomain>('liquidity')
  const [, startTransition] = useTransition()
  const wallet = model.wallet

  const onTab = (next: PositionDomain) => {
    startTransition(() => setTab(next))
  }

  const estimatedValue = model.summary.find((metric) => metric.id === 'portfolio')?.value || '—'
  const liquidityMetric = model.summary.find((metric) => metric.id === 'liquidity')
  const farmsMetric = model.summary.find((metric) => metric.id === 'farms')
  const poolsMetric = model.summary.find((metric) => metric.id === 'pools')
  const rewardsMetric = model.summary.find((metric) => metric.id === 'rewards')

  return (
    <Page
      data-portfolio="v2"
      data-portfolio-surface={model.surfaceState}
      data-portfolio-wallet={wallet.connected ? 'connected' : 'disconnected'}
      data-testid="portfolio-studio-screen"
    >
      <PageMeta />
      <Stack>
        {/* HERO — canonical dense portfolio summary */}
        <Band data-portfolio-section="hero" data-testid="portfolio-section-hero">
          <HeroGrid>
            <HeroLeft>
              <BrandLabel>Melega DEX Portfolio</BrandLabel>
              <HeroTitle>{wallet.connected ? 'Your Portfolio' : 'Connect to view your portfolio'}</HeroTitle>
              <Row>
                <Mono data-testid="portfolio-wallet-address">
                  {wallet.connected ? wallet.shortened : 'No wallet connected'}
                </Mono>
                {model.chainId != null ? <MelegaExploreChainBadge chainId={model.chainId} /> : null}
                <Chip $tone="mute">{chainLabel(model.chainId)}</Chip>
              </Row>
            </HeroLeft>
            <HeroValue>
              <HeroMetricLabel>Estimated indexed value</HeroMetricLabel>
              <HeroMetricValue $muted={estimatedValue === '—'}>{estimatedValue}</HeroMetricValue>
              <BandMeta>{model.portfolioPartialValuation ? 'Partial valuation' : 'Wallet positions'}</BandMeta>
            </HeroValue>
            <HeroValue>
              <HeroMetricLabel>24h P&amp;L</HeroMetricLabel>
              <HeroMetricValue $muted>—</HeroMetricValue>
              <BandMeta>Historical series unavailable</BandMeta>
            </HeroValue>
            <HeroActions data-testid="portfolio-hero-ctas">
              {!wallet.connected ? <ConnectWalletButton>Connect Wallet</ConnectWalletButton> : null}
              {model.heroCtas
                .filter((c) => c.kind !== 'connect')
                .map((cta) =>
                  cta.enabled && cta.href ? (
                    <Btn key={cta.kind} href={cta.href} $primary={cta.primary} data-cta={cta.kind}>
                      {cta.label}
                    </Btn>
                  ) : null,
                )}
              {wallet.connected ? (
                <Btn as="button" type="button" $ghost data-testid="portfolio-disconnect" onClick={() => disconnect?.()}>
                  Disconnect
                </Btn>
              ) : null}
            </HeroActions>
          </HeroGrid>
        </Band>

        {/* ANALYTICS — real indexed values only */}
        <AnalyticsGrid data-portfolio-section="assets" data-testid="portfolio-section-assets">
          <ChartCard>
            <BandHead>
              <BandTitle>Portfolio Performance</BandTitle>
              <BandMeta>24H · 7D · 30D · ALL</BandMeta>
            </BandHead>
            <Row>
              <HeroMetricValue style={{ fontSize: 24 }} $muted={estimatedValue === '—'}>{estimatedValue}</HeroMetricValue>
              <Chip $tone="mute">P&amp;L unavailable</Chip>
            </Row>
            <ChartCanvas data-testid="portfolio-history-unavailable">
              <div>
                <MelegaLogoSvg size={32} />
                <Muted style={{ marginTop: 8 }}>Historical portfolio series not indexed.</Muted>
                <BandMeta>Current value remains available from live wallet positions.</BandMeta>
              </div>
            </ChartCanvas>
          </ChartCard>

          <Band>
            <BandHead>
              <BandTitle>Allocation</BandTitle>
              <BandMeta>{model.analytics.allocationMode === 'value' ? 'By value' : 'By positions'}</BandMeta>
            </BandHead>
            <DonutLayout>
              <Donut $gradient={donutGradient(model.analytics.allocation)}>
                <DonutCenter>{model.analytics.indexedValue}</DonutCenter>
              </Donut>
              <Legend>
                {model.analytics.allocation.length ? model.analytics.allocation.map((item) => (
                  <LegendRow key={item.id}>
                    <Dot $color={item.color} />
                    <span>{item.label}<br /><BandMeta>{item.value}</BandMeta></span>
                    <strong>{item.percentage.toFixed(1)}%</strong>
                  </LegendRow>
                )) : <Muted>No indexed positions.</Muted>}
              </Legend>
            </DonutLayout>
          </Band>

          <Band>
            <BandHead>
              <BandTitle>By Chain</BandTitle>
              <BandMeta>Priced positions</BandMeta>
            </BandHead>
            <DonutLayout>
              <Donut $gradient={donutGradient(model.analytics.chains)}>
                <DonutCenter>{model.analytics.indexedValue}</DonutCenter>
              </Donut>
              <Legend>
                {model.analytics.chains.length ? model.analytics.chains.map((item) => (
                  <LegendRow key={item.id}>
                    <Dot $color={item.color} />
                    <span>{item.label}<br /><BandMeta>{item.value}</BandMeta></span>
                    <strong>{item.percentage.toFixed(1)}%</strong>
                  </LegendRow>
                )) : <Muted>Chain valuation unavailable.</Muted>}
              </Legend>
            </DonutLayout>
          </Band>

          <KpiStack>
            {[liquidityMetric, farmsMetric, poolsMetric, rewardsMetric].map((metric) => metric ? (
              <Kpi key={metric.id}>
                <Metric
                  label={metric.label}
                  value={metric.value || '—'}
                  source={metric.source}
                  tone={metric.partial || metric.status === 'partial' ? 'gold' : metric.status === 'zero' ? 'mute' : undefined}
                  testId={`portfolio-metric-${metric.id}`}
                />
              </Kpi>
            ) : null)}
          </KpiStack>
        </AnalyticsGrid>
        {model.portfolioValueNote ? <Muted>{model.portfolioValueNote}</Muted> : null}

        {/* POSITIONS — Liquidity / Farms / Pools */}
        <Band data-portfolio-section="positions" data-testid="portfolio-section-positions">
          <BandHead>
            <BandTitle>Positions</BandTitle>
            <BandMeta>Liquidity · Farms · Pools</BandMeta>
          </BandHead>
          <TabRow role="tablist" aria-label="Position domains">
            {(
              [
                ['liquidity', 'Liquidity', model.liquidity.length],
                ['farms', 'Farms', model.farms.length],
                ['pools', 'Pools', model.pools.length],
              ] as const
            ).map(([key, label, count]) => (
              <TabBtn
                key={key}
                type="button"
                role="tab"
                $active={tab === key}
                aria-selected={tab === key}
                data-position-tab={key}
                onClick={() => onTab(key)}
              >
                {label} ({count})
              </TabBtn>
            ))}
          </TabRow>

          {tab === 'liquidity' ? (
            model.liquidity.length === 0 ? (
              <Muted>
                {wallet.connected
                  ? 'No AMM LP positions for this wallet.'
                  : 'Connect a wallet to load liquidity positions.'}
              </Muted>
            ) : (
              <DenseTable data-position-domain="liquidity">
                {model.liquidity.map((pos) => {
                  const links = positionActionLinks('liquidity', pos.id)
                  return (
                    <DenseRow key={pos.id} data-testid="portfolio-liquidity-row">
                      <div>
                        <Row>
                          <MelegaTokenAvatar symbol={pos.token0Symbol} size={22} />
                          <MelegaTokenAvatar symbol={pos.token1Symbol} size={22} />
                          <strong>{pos.pairLabel}</strong>
                        </Row>
                        <div style={{ color: px.mute2, marginTop: 2 }}>
                          {pos.type} · {pos.status}
                        </div>
                      </div>
                      <div>
                        <div>Value</div>
                        <div>{pos.estimatedValue || '—'}</div>
                      </div>
                      <div>
                        <div>Share</div>
                        <div>{pos.sharePrimary}</div>
                      </div>
                      <div>
                        <Btn href={links.manageHref} $ghost>
                          Manage
                        </Btn>
                      </div>
                      <div>
                        <Btn href={links.removeHref || links.manageHref} $ghost>
                          Remove
                        </Btn>
                      </div>
                    </DenseRow>
                  )
                })}
              </DenseTable>
            )
          ) : null}

          {tab === 'farms' ? (
            model.farms.length === 0 ? (
              <Muted>
                {wallet.connected
                  ? 'No farm positions for this wallet.'
                  : 'Connect a wallet to load farm positions.'}
              </Muted>
            ) : (
              <DenseTable data-position-domain="farms">
                {model.farms.map((pos) => {
                  const links = positionActionLinks('farms')
                  const contract = explorerAddressUrl(pos.masterChef, pos.chainId)
                  return (
                    <DenseRow key={pos.positionId} data-testid="portfolio-farm-row">
                      <div>
                        <Row>
                          {pos.chainId != null ? <MelegaExploreChainBadge chainId={pos.chainId} /> : null}
                          <strong>
                            {pos.token0.symbol}/{pos.token1.symbol}
                          </strong>
                        </Row>
                        <div style={{ color: px.mute2 }}>
                          Earn {pos.rewardToken.symbol} · {pos.statusLabel}
                        </div>
                      </div>
                      <div>
                        <div>Staked</div>
                        <div>{pos.stakedFormatted}</div>
                        <div style={{ color: px.mute2 }}>{pos.stakedValue || '—'}</div>
                      </div>
                      <div>
                        <div>Claimable</div>
                        <div>{pos.pendingFormatted}</div>
                      </div>
                      <div>
                        <Btn href={links.harvestHref || links.manageHref} $primary>
                          Harvest
                        </Btn>
                      </div>
                      <div>
                        <Row>
                          <Btn href={links.manageHref} $ghost>
                            Manage
                          </Btn>
                          {contract ? (
                            <ExtLink href={contract} target="_blank" rel="noreferrer">
                              Explorer
                            </ExtLink>
                          ) : null}
                        </Row>
                      </div>
                    </DenseRow>
                  )
                })}
              </DenseTable>
            )
          ) : null}

          {tab === 'pools' ? (
            model.pools.length === 0 ? (
              <Muted>
                {wallet.connected
                  ? 'No pool positions for this wallet.'
                  : 'Connect a wallet to load pool positions.'}
              </Muted>
            ) : (
              <DenseTable data-position-domain="pools">
                {model.pools.map((pos) => {
                  const links = positionActionLinks('pools')
                  const contract = explorerAddressUrl(pos.poolContract, pos.chainId)
                  return (
                    <DenseRow key={pos.positionId} data-testid="portfolio-pool-row">
                      <div>
                        <Row>
                          {pos.chainId != null ? <MelegaExploreChainBadge chainId={pos.chainId} /> : null}
                          <strong>{pos.stakeToken.symbol}</strong>
                        </Row>
                        <div style={{ color: px.mute2 }}>
                          Reward {pos.rewardToken.symbol} · {pos.statusLabel}
                        </div>
                      </div>
                      <div>
                        <div>Principal</div>
                        <div>{pos.stakedFormatted}</div>
                      </div>
                      <div>
                        <div>Claimable</div>
                        <div>{pos.claimableFormatted}</div>
                      </div>
                      <div>
                        <Btn href={links.claimHref || links.manageHref} $primary>
                          Claim
                        </Btn>
                      </div>
                      <div>
                        <Row>
                          <Btn href={links.manageHref} $ghost>
                            Manage
                          </Btn>
                          {contract ? (
                            <ExtLink href={contract} target="_blank" rel="noreferrer">
                              Explorer
                            </ExtLink>
                          ) : null}
                        </Row>
                      </div>
                    </DenseRow>
                  )
                })}
              </DenseTable>
            )
          ) : null}

          {(model.surfaceState === 'LOADING' || model.summary.some((m) => m.status === 'loading')) &&
          model.liquidity.length + model.farms.length + model.pools.length === 0 ? (
            <div style={{ marginTop: 8 }} data-testid="portfolio-positions-skeleton">
              <Skeleton />
            </div>
          ) : null}
        </Band>

        {/* REWARDS */}
        <Band data-portfolio-section="rewards" data-testid="portfolio-section-rewards">
          <BandHead>
            <BandTitle>Rewards</BandTitle>
            <BandMeta>
              {model.claimables.length === 0 ? 'None' : `${model.claimables.length} claimable`}
            </BandMeta>
          </BandHead>
          {model.claimables.length === 0 ? (
            <Muted>No non-zero claimable rewards for this wallet.</Muted>
          ) : (
            <DenseTable>
              {(['Farms', 'Pools', 'Other'] as const).map((group) => {
                const rows = model.claimables.filter((r) => r.group === group)
                if (!rows.length) return null
                return (
                  <React.Fragment key={group}>
                    <BandMeta style={{ margin: '8px 0 4px' }}>{group}</BandMeta>
                    {rows.map((row) => (
                      <DenseRow key={row.id} data-testid="portfolio-claimable-row">
                        <div>
                          <strong>{row.source}</strong>
                          <div style={{ color: px.mute2 }}>{row.token}</div>
                        </div>
                        <div>{row.amount}</div>
                        <div>{row.estimatedUsd || '—'}</div>
                        <div>
                          <Btn href={row.actionHref} $ghost>
                            {row.actionLabel}
                          </Btn>
                        </div>
                        <div>
                          {row.contractHref ? (
                            <ExtLink href={row.contractHref} target="_blank" rel="noreferrer">
                              Contract
                            </ExtLink>
                          ) : (
                            '—'
                          )}
                        </div>
                      </DenseRow>
                    ))}
                  </React.Fragment>
                )
              })}
            </DenseTable>
          )}
        </Band>

        {/* RECENT ACTIVITY */}
        <Band data-portfolio-section="activity" data-testid="portfolio-section-activity">
          <BandHead>
            <BandTitle>Recent Activity</BandTitle>
            <BandMeta>Indexed when available</BandMeta>
          </BandHead>
          <Muted data-testid="portfolio-activity-empty">{model.activityNote}</Muted>
        </Band>

      </Stack>
    </Page>
  )
}

export default PortfolioStudioScreen
