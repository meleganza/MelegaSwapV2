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
  AnalyticsBody,
  AnalyticsDetails,
  AnalyticsSummary,
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Btn,
  Chip,
  DenseRow,
  DenseTable,
  ExtLink,
  Grid,
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
  gap: 14px;
  min-width: 0;

  @media (min-width: 900px) {
    grid-template-columns: minmax(0, 1.35fr) minmax(220px, 0.65fr);
    align-items: center;
  }
`

const HeroLeft = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const HeroRight = styled.div`
  min-width: 0;
  border-radius: 12px;
  border: 1px solid ${px.goldLine};
  background:
    radial-gradient(ellipse 80% 70% at 30% 20%, rgba(242, 200, 76, 0.14), transparent 60%),
    linear-gradient(165deg, #16140f 0%, #0c0c0c 100%);
  padding: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 96px;
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

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #c8c8c8;
  word-break: break-all;
`

const VisualLabel = styled.div`
  font-size: 12px;
  font-weight: 750;
  color: ${px.text};
  text-align: center;
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

export const PortfolioStudioScreen: React.FC = () => {
  const { model } = usePortfolioRuntime()
  const { disconnect } = useDisconnect()
  const [tab, setTab] = useState<PositionDomain>('liquidity')
  const [, startTransition] = useTransition()
  const wallet = model.wallet

  const onTab = (next: PositionDomain) => {
    startTransition(() => setTab(next))
  }

  return (
    <Page
      data-portfolio="v2"
      data-portfolio-surface={model.surfaceState}
      data-portfolio-wallet={wallet.connected ? 'connected' : 'disconnected'}
      data-testid="portfolio-studio-screen"
    >
      <PageMeta />
      <Stack>
        {/* HERO */}
        <Band data-portfolio-section="hero" data-testid="portfolio-section-hero">
          <HeroGrid>
            <HeroLeft>
              <BrandLabel>Portfolio</BrandLabel>
              <HeroTitle>{wallet.connected ? 'Your Portfolio' : 'Connect to view your portfolio'}</HeroTitle>
              <Mono data-testid="portfolio-wallet-address">
                {wallet.connected ? wallet.shortened : 'No wallet connected'}
              </Mono>
              <Row>
                {model.chainId != null ? <MelegaExploreChainBadge chainId={model.chainId} /> : null}
                <Chip $tone="mute">{chainLabel(model.chainId)}</Chip>
              </Row>
              <Muted>Assets, liquidity, farms, pools, and rewards — simple portfolio view.</Muted>
              <Row data-testid="portfolio-hero-ctas">
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
                  <Btn
                    as="button"
                    type="button"
                    $ghost
                    data-testid="portfolio-disconnect"
                    onClick={() => disconnect?.()}
                  >
                    Disconnect
                  </Btn>
                ) : null}
              </Row>
            </HeroLeft>
            <HeroRight data-testid="portfolio-visual">
              <MelegaLogoSvg size={48} />
              <VisualLabel>Portfolio</VisualLabel>
              <Chip $on={wallet.connected} $tone={wallet.connected ? 'ok' : 'mute'}>
                {wallet.connected ? 'Wallet connected' : 'Awaiting wallet'}
              </Chip>
            </HeroRight>
          </HeroGrid>
        </Band>

        {/* ASSETS */}
        <Band data-portfolio-section="assets" data-testid="portfolio-section-assets">
          <BandHead>
            <BandTitle>Assets</BandTitle>
            <BandMeta>{model.portfolioPartialValuation ? 'Partial valuation' : 'Factual sources'}</BandMeta>
          </BandHead>
          <Grid $cols={5}>
            {model.summary.map((m) => (
              <Metric
                key={m.id}
                label={m.label}
                value={m.value || '—'}
                source={m.source}
                tone={m.partial || m.status === 'partial' ? 'gold' : m.status === 'zero' ? 'mute' : undefined}
                testId={`portfolio-metric-${m.id}`}
              />
            ))}
          </Grid>
          {model.portfolioValueNote ? <Muted>{model.portfolioValueNote}</Muted> : null}
        </Band>

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

        {/* ANALYTICS — collapsed by default */}
        <AnalyticsDetails data-portfolio-section="analytics" data-testid="portfolio-section-analytics">
          <AnalyticsSummary>
            <span>Analytics</span>
            <BandMeta>Collapsed · expand for breakdown</BandMeta>
          </AnalyticsSummary>
          <AnalyticsBody>
            <Grid $cols={5}>
              {model.summary.map((m) => (
                <Metric
                  key={`analytics-${m.id}`}
                  label={m.label}
                  value={m.value || '—'}
                  source={m.source}
                  tone={m.partial || m.status === 'partial' ? 'gold' : m.status === 'zero' ? 'mute' : undefined}
                  testId={`portfolio-analytics-${m.id}`}
                />
              ))}
            </Grid>
            <Muted style={{ marginTop: 8 }}>
              Portfolio value is priced positions only. Unpriced holdings show —.
            </Muted>
          </AnalyticsBody>
        </AnalyticsDetails>
      </Stack>
    </Page>
  )
}

export default PortfolioStudioScreen
