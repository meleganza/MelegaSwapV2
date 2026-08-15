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
import { explorerAddressUrl, positionActionLinks, type PositionDomain } from './runtime/buildPortfolioViewModel'
import { chainLabel, parseUsdLoose } from './helpers'
import { usePortfolioRuntime } from './runtime/usePortfolioRuntime'
import { usePortfolioHistory, type PortfolioHistoryPoint } from './runtime/usePortfolioHistory'

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

  @media (min-width: 1100px) {
    grid-template-columns: minmax(390px, 1.15fr) minmax(0, 1.85fr);
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
  background: linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.025) 1px, transparent 1px),
    radial-gradient(ellipse 80% 90% at 45% 120%, rgba(221, 185, 47, 0.14), transparent 68%), #090909;
  background-size: 100% 33.333%, 16.666% 100%, 100% 100%, 100% 100%;
  display: grid;
  place-items: center;
  padding: 22px;
  text-align: center;
`

const HistorySvg = styled.svg`
  position: absolute;
  inset: 14px;
  width: calc(100% - 28px);
  height: calc(100% - 28px);
  overflow: visible;
`

const ChartLegend = styled.div`
  position: absolute;
  top: 12px;
  right: 14px;
  z-index: 2;
  display: flex;
  gap: 12px;
  color: ${px.mute};
  font-size: 10px;
  span::before {
    content: '';
    width: 7px;
    height: 7px;
    margin-right: 5px;
    display: inline-block;
    border-radius: 50%;
    background: ${px.gold};
  }
  span:last-child::before {
    background: ${px.ok};
  }
`

const DonutGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`

const DonutCard = styled(Band)`
  min-height: 174px;
`

const DonutLayout = styled.div`
  display: grid;
  grid-template-columns: 94px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 122px;
`

const Donut = styled.div<{ $gradient: string }>`
  width: 94px;
  aspect-ratio: 1;
  border-radius: 50%;
  background: ${({ $gradient }) => $gradient};
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 20px;
    border-radius: 50%;
    background: #0c0c0c;
    border: 1px solid rgba(255, 255, 255, 0.06);
  }
`

const DonutCenter = styled.div`
  position: absolute;
  inset: 0;
  z-index: 1;
  display: grid;
  place-items: center;
  padding: 27px;
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

  strong {
    color: ${px.text};
    font-variant-numeric: tabular-nums;
  }
`

const Dot = styled.span<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $color }) => $color};
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

function polyline(points: PortfolioHistoryPoint[], field: 'portfolioUsd' | 'rewardsUsd'): string {
  if (points.length < 2) return ''
  const values = points.map((point) => point[field])
  const min = Math.min(...values)
  const max = Math.max(...values)
  const spread = Math.max(max - min, max * 0.01, 0.01)
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 100
      const y = 92 - ((point[field] - min) / spread) * 78
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
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
  const portfolioUsd = parseUsdLoose(estimatedValue)
  const rewardsUsd = model.claimables.reduce((sum, row) => sum + (parseUsdLoose(row.estimatedUsd) || 0), 0)
  const history = usePortfolioHistory({
    wallet: wallet.address,
    chainId: model.chainId,
    portfolioUsd,
    rewardsUsd,
  })
  const historyReady = history.length >= 2
  const firstPoint = history[0]
  const lastPoint = history[history.length - 1]
  const pnl = historyReady && firstPoint && lastPoint ? lastPoint.portfolioUsd - firstPoint.portfolioUsd : null

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
              <HeroMetricValue $muted={pnl == null}>
                {pnl == null ? '—' : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}`}
              </HeroMetricValue>
              <BandMeta>{historyReady ? 'Verified browser snapshots' : 'Indexing starts now'}</BandMeta>
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
              <HeroMetricValue style={{ fontSize: 24 }} $muted={estimatedValue === '—'}>
                {estimatedValue}
              </HeroMetricValue>
              <Chip $tone={pnl == null ? 'mute' : pnl >= 0 ? 'ok' : 'bad'}>
                {pnl == null ? 'Collecting history' : `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toFixed(2)}`}
              </Chip>
            </Row>
            <ChartCanvas data-testid={historyReady ? 'portfolio-history-chart' : 'portfolio-history-indexing'}>
              {historyReady ? (
                <>
                  <ChartLegend>
                    <span>Portfolio</span>
                    <span>Rewards</span>
                  </ChartLegend>
                  <HistorySvg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    role="img"
                    aria-label="Portfolio and rewards history"
                  >
                    <polyline
                      points={polyline(history, 'portfolioUsd')}
                      fill="none"
                      stroke={px.gold}
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                    <polyline
                      points={polyline(history, 'rewardsUsd')}
                      fill="none"
                      stroke={px.ok}
                      strokeWidth="1.6"
                      vectorEffect="non-scaling-stroke"
                    />
                  </HistorySvg>
                </>
              ) : (
                <div>
                  <MelegaLogoSvg size={32} />
                  <Muted style={{ marginTop: 8 }}>
                    Verified portfolio history starts with this live wallet snapshot.
                  </Muted>
                  <BandMeta>No synthetic historical values are generated.</BandMeta>
                </div>
              )}
            </ChartCanvas>
          </ChartCard>

          <DonutGrid data-testid="portfolio-four-donuts">
            {(['liquidity', 'farms', 'pools'] as const).map((domain) => {
              const breakdown = model.analytics.domainBreakdowns[domain]
              return (
                <DonutCard key={domain} data-testid={`portfolio-donut-${domain}`}>
                  <BandHead>
                    <BandTitle>{breakdown.label}</BandTitle>
                    <BandMeta>
                      {breakdown.count} {breakdown.count === 1 ? 'position' : 'positions'}
                    </BandMeta>
                  </BandHead>
                  <DonutLayout>
                    <Donut $gradient={donutGradient(breakdown.items)}>
                      <DonutCenter>
                        {breakdown.portfolioPercentage == null
                          ? `${breakdown.count}`
                          : `${breakdown.portfolioPercentage.toFixed(1)}%`}
                      </DonutCenter>
                    </Donut>
                    <Legend>
                      {breakdown.items.length ? (
                        breakdown.items.slice(0, 4).map((item) => (
                          <LegendRow key={item.id}>
                            <Dot $color={item.color} />
                            <span>
                              {item.label}
                              <br />
                              <BandMeta>{item.value}</BandMeta>
                            </span>
                            <strong>{item.percentage.toFixed(1)}%</strong>
                          </LegendRow>
                        ))
                      ) : (
                        <Muted>No indexed positions.</Muted>
                      )}
                    </Legend>
                  </DonutLayout>
                </DonutCard>
              )
            })}
            <DonutCard data-testid="portfolio-donut-chains">
              <BandHead>
                <BandTitle>By Chain</BandTitle>
                <BandMeta>Indexed capital</BandMeta>
              </BandHead>
              <DonutLayout>
                <Donut $gradient={donutGradient(model.analytics.chains)}>
                  <DonutCenter>{model.analytics.indexedValue}</DonutCenter>
                </Donut>
                <Legend>
                  {model.analytics.chains.length ? (
                    model.analytics.chains.slice(0, 4).map((item) => (
                      <LegendRow key={item.id}>
                        <Dot $color={item.color} />
                        <span>
                          {item.label}
                          <br />
                          <BandMeta>{item.value}</BandMeta>
                        </span>
                        <strong>{item.percentage.toFixed(1)}%</strong>
                      </LegendRow>
                    ))
                  ) : (
                    <Muted>Chain valuation unavailable.</Muted>
                  )}
                </Legend>
              </DonutLayout>
            </DonutCard>
          </DonutGrid>
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
                {wallet.connected ? 'No farm positions for this wallet.' : 'Connect a wallet to load farm positions.'}
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
                {wallet.connected ? 'No pool positions for this wallet.' : 'Connect a wallet to load pool positions.'}
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
            <BandMeta>{model.claimables.length === 0 ? 'None' : `${model.claimables.length} claimable`}</BandMeta>
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
