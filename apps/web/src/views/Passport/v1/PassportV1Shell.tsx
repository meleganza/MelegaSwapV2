/**
 * MELEGA_DEX_V1_PASSPORT_ZERO_REBUILD — entirely new Passport surface.
 * One coherent personal identity + portfolio page. No Command Center.
 */
import React, { useState, useTransition } from 'react'
import styled from 'styled-components'
import { useDisconnect } from 'wagmi'
import { PageMeta } from 'components/Layout/Page'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { MelegaLogoSvg } from 'design-system/melega/components/BrandLockup/MelegaLogoSvg'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
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
  Grid,
  Muted,
  Page,
  Row,
  Stack,
  TabBtn,
  TabRow,
  px,
} from './theme'
import { Metric, UNAVAILABLE } from './Metric'
import { explorerAddressUrl, positionActionLinks } from './buildPassportV1Model'
import type { PositionDomain } from './buildPassportV1Model'
import { chainLabel, shortenAddress } from './helpers'
import { usePassportV1Runtime } from './usePassportV1Runtime'

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
    radial-gradient(ellipse 80% 70% at 30% 20%, rgba(242, 200, 76, 0.16), transparent 60%),
    linear-gradient(165deg, #16140f 0%, #0c0c0c 100%);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 140px;
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
  font-size: clamp(20px, 3.4vw, 28px);
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
  background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04));
  background-size: 200% 100%;
  animation: shimmer 1.2s linear infinite;
  @keyframes shimmer {
    0% { background-position: 100% 0; }
    100% { background-position: -100% 0; }
  }
`

const BenefitList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: grid;
  gap: 6px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  li {
    font-size: 12px;
    color: #d0d0d0;
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid ${px.line};
    background: rgba(255, 255, 255, 0.02);
  }

  strong {
    color: ${px.gold};
    font-weight: 750;
  }
`

function verificationTone(
  state: string,
): 'ok' | 'warn' | 'bad' | 'mute' {
  if (state === 'verified') return 'ok'
  if (state === 'pending' || state === 'review_required') return 'warn'
  if (state === 'not_verified') return 'bad'
  return 'mute'
}

export const PassportV1Shell: React.FC = () => {
  const { model, cacheKeys } = usePassportV1Runtime()
  const { disconnect } = useDisconnect()
  const [tab, setTab] = useState<PositionDomain>('liquidity')
  const [, startTransition] = useTransition()

  const onTab = (next: PositionDomain) => {
    startTransition(() => setTab(next))
  }

  const id = model.identity

  return (
    <Page
      data-passport-rebuild="zero-rebuild-v1"
      data-passport-nav="none"
      data-passport-command-center="removed"
      data-passport-surface-state={model.surfaceState}
      data-passport-wallet={id.walletConnected ? 'connected' : 'disconnected'}
      data-testid="passport-v1-shell"
    >
      <PageMeta />
      <Stack>
{/* SECTION 1 — PASSPORT HERO */}
        <Band data-passport-section="hero" data-testid="passport-section-hero">
          <HeroGrid>
            <HeroLeft>
              <BrandLabel>Portfolio</BrandLabel>
              <HeroTitle>
                {id.walletConnected
                  ? 'Your Portfolio'
                  : 'Connect to view your portfolio'}
              </HeroTitle>
              <Mono data-testid="passport-wallet-address">
                {id.walletConnected ? id.shortenedWallet : 'No wallet connected'}
              </Mono>
              <Row>
                <Chip $tone="mute">{chainLabel(model.chainId)}</Chip>
              </Row>
              <Muted>
                Total value, liquidity, farms, pools, and positions — simple portfolio view.
              </Muted>
              <Row data-testid="passport-hero-ctas">
                {!id.walletConnected ? (
                  <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
                ) : null}
                {model.heroCtas
                  .filter((c) => c.kind !== 'connect')
                  .map((cta) =>
                    cta.enabled && cta.href ? (
                      <Btn
                        key={cta.kind}
                        href={cta.href}
                        $primary={cta.primary}
                        data-cta={cta.kind}
                      >
                        {cta.label}
                      </Btn>
                    ) : (
                      <Btn
                        key={cta.kind}
                        as="span"
                        $primary={cta.primary}
                        $disabled
                        data-cta={cta.kind}
                        title={cta.reason}
                      >
                        {cta.label}
                      </Btn>
                    ),
                  )}
              </Row>
              {model.heroCtas.some((c) => c.reason && !c.enabled) ? (
                <Muted data-testid="passport-cta-reason">
                  {model.heroCtas.find((c) => c.reason && !c.enabled)?.reason}
                </Muted>
              ) : null}
            </HeroLeft>
            <HeroRight data-testid="passport-visual">
              <MelegaLogoSvg size={64} />
              <VisualLabel>Portfolio</VisualLabel>
              <Chip $on={id.walletConnected} $tone={id.walletConnected ? 'ok' : 'mute'}>
                {id.walletConnected ? 'Wallet connected' : 'Awaiting wallet'}
              </Chip>
            </HeroRight>
          </HeroGrid>
        </Band>

{/* SECTION 2 — PORTFOLIO SUMMARY */}
        <Band data-passport-section="portfolio" data-testid="passport-section-portfolio">
          <BandHead>
            <BandTitle>Portfolio Summary</BandTitle>
            <BandMeta>
              {model.portfolioPartialValuation ? 'Partial valuation' : 'Factual sources'}
            </BandMeta>
          </BandHead>
          <Grid $cols={6}>
            {model.summary.map((m) => (
              <Metric
                key={m.id}
                label={m.label}
                value={m.status === 'unavailable' && m.value === '—' ? UNAVAILABLE : m.value}
                source={m.source}
                tone={m.partial || m.status === 'partial' ? 'gold' : m.status === 'zero' ? 'mute' : undefined}
                testId={`passport-metric-${m.id}`}
              />
            ))}
          </Grid>
          {model.portfolioValueNote ? <Muted>{model.portfolioValueNote}</Muted> : null}
        </Band>

{/* SECTION 3 — MY POSITIONS */}
        <Band data-passport-section="positions" data-testid="passport-section-positions">
          <BandHead>
            <BandTitle>My Positions</BandTitle>
            <BandMeta>Domain-separated · local filter only</BandMeta>
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
              id.walletConnected ? (
                <Muted>No AMM LP positions for this wallet.</Muted>
              ) : (
                <Muted>Connect a wallet to load liquidity positions.</Muted>
              )
            ) : (
              <DenseTable data-position-domain="liquidity">
                {model.liquidity.map((pos) => {
                  const links = positionActionLinks('liquidity', pos.id)
                  return (
                    <DenseRow key={pos.id} data-testid="passport-liquidity-row">
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
                        <div>{pos.estimatedValue || UNAVAILABLE}</div>
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
                          Remove Liquidity
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
                {id.walletConnected
                  ? 'No MasterBuilder / MasterChef farm positions for this wallet.'
                  : 'Connect a wallet to load farm positions.'}
              </Muted>
            ) : (
              <DenseTable data-position-domain="farms">
                {model.farms.map((pos) => {
                  const links = positionActionLinks('farms')
                  const contract = explorerAddressUrl(pos.masterChef, pos.chainId)
                  return (
                    <DenseRow key={pos.positionId} data-testid="passport-farm-row">
                      <div>
                        <strong>
                          {pos.token0.symbol}/{pos.token1.symbol}
                        </strong>
                        <div style={{ color: px.mute2 }}>
                          Earn {pos.rewardToken.symbol} · {pos.statusLabel}
                        </div>
                      </div>
                      <div>
                        <div>Staked</div>
                        <div>{pos.stakedFormatted}</div>
                        <div style={{ color: px.mute2 }}>{pos.stakedValue || UNAVAILABLE}</div>
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
                              BscScan
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
                {id.walletConnected
                  ? 'No SmartChef pool positions for this wallet.'
                  : 'Connect a wallet to load pool positions.'}
              </Muted>
            ) : (
              <DenseTable data-position-domain="pools">
                {model.pools.map((pos) => {
                  const links = positionActionLinks('pools')
                  const contract = explorerAddressUrl(pos.poolContract, pos.chainId)
                  return (
                    <DenseRow key={pos.positionId} data-testid="passport-pool-row">
                      <div>
                        <strong>{pos.stakeToken.symbol}</strong>
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
                              BscScan
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

          {(model.surfaceState === 'LOADING_CURRENT_WALLET' ||
            model.summary.some((m) => m.status === 'loading')) &&
          model.liquidity.length + model.farms.length + model.pools.length === 0 ? (
            <div style={{ marginTop: 8 }} data-testid="passport-positions-skeleton">
              <Skeleton />
            </div>
          ) : null}
        </Band>

{/* SECTION 4 — CLAIMABLE REWARDS (mobile order via CSS; desktop after positions) */}
        <Band
          data-passport-section="claimables"
          data-testid="passport-section-claimables"
          style={{ order: undefined }}
        >
          <BandHead>
            <BandTitle>Claimable Rewards</BandTitle>
            <BandMeta>
              {model.claimables.length === 0
                ? 'None'
                : `${model.claimables.length} factual`}
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
                      <DenseRow key={row.id} data-testid="passport-claimable-row">
                        <div>
                          <strong>{row.source}</strong>
                          <div style={{ color: px.mute2 }}>{row.token}</div>
                        </div>
                        <div>{row.amount}</div>
                        <div>{row.estimatedUsd || UNAVAILABLE}</div>
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
                            UNAVAILABLE
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

{/* SECTION 5 — MY PROJECTS */}
        <Band data-passport-section="projects" data-testid="passport-section-projects">
          <BandHead>
            <BandTitle>My Projects</BandTitle>
            <BandMeta>Verified control only</BandMeta>
          </BandHead>
          {model.projects.length === 0 ? (
            <>
              <Muted data-testid="passport-projects-empty">
                No verified projects are controlled by this wallet.
              </Muted>
              <Row style={{ marginTop: 10 }}>
                <Btn href={model.claimProjectHref} $primary data-cta="claim-project">
                  Claim a Project
                </Btn>
                <Btn href={model.createProjectHref} data-cta="create-project">
                  Create a Project
                </Btn>
              </Row>
            </>
          ) : (
            <>
              <DenseTable>
                {model.projects.map((p) => (
                  <DenseRow key={p.id} data-testid="passport-project-row">
                    <div>
                      <strong>
                        {p.name} · {p.logoLabel}
                      </strong>
                      <div style={{ color: px.mute2 }}>
                        {p.status} · {p.role}
                      </div>
                    </div>
                    <div>{p.kpiLabel}</div>
                    <div>{p.kpiValue}</div>
                    <div>
                      <Btn href={p.actionHref} $primary>
                        {p.actionLabel || 'Manage Project'}
                      </Btn>
                    </div>
                    <div>
                      <Btn href={`/project-hq/${encodeURIComponent(p.id)}`} $ghost>
                        View Project Page
                      </Btn>
                    </div>
                  </DenseRow>
                ))}
              </DenseTable>
              <Row style={{ marginTop: 10 }}>
                <Btn href={model.claimProjectHref} data-cta="claim-project">
                  Claim a Project
                </Btn>
                <Btn href={model.createProjectHref} data-cta="create-project">
                  Create a Project
                </Btn>
              </Row>
            </>
          )}
        </Band>

{/* SECTION 6 — PORTFOLIO SUMMARY */}
        <Band data-passport-section="benefits" data-testid="passport-section-benefits">
          <BandHead>
            <BandTitle>Portfolio</BandTitle>
            <BandMeta>What you hold on Melega</BandMeta>
          </BandHead>
          <BenefitList>
            <li>
              <strong>Total value</strong> — wallet holdings when priced.
            </li>
            <li>
              <strong>Liquidity</strong> — LP positions across pairs.
            </li>
            <li>
              <strong>Farms</strong> — staked LP and pending rewards.
            </li>
            <li>
              <strong>Pools</strong> — staking pool positions.
            </li>
            <li>
              <strong>Positions</strong> — domain-separated, factual only.
            </li>
          </BenefitList>
        </Band>

{/* SECTION 7 — ACCOUNT */}
        <Band data-passport-section="account" data-testid="passport-section-account">
          <BandHead>
            <BandTitle>Account</BandTitle>
            <BandMeta>Wallet session</BandMeta>
          </BandHead>
          <Grid $cols={3}>
            <Metric
              label="Connected wallet"
              value={id.walletConnected ? id.shortenedWallet || shortenAddress(null) : 'Disconnected'}
              source="wagmi session"
            />
            <Metric label="Chain" value={chainLabel(model.chainId)} source="active chain id" />
            <Metric
              label="Positions"
              value={id.walletConnected ? 'Live when indexed' : 'Connect wallet'}
              source="Portfolio domains"
            />
          </Grid>
          <Row style={{ marginTop: 10 }}>
            {!id.walletConnected ? (
              <ConnectWalletButton>Connect Wallet</ConnectWalletButton>
            ) : (
              <Btn
                as="button"
                type="button"
                $ghost
                data-testid="passport-disconnect"
                onClick={() => disconnect?.()}
              >
                Disconnect wallet
              </Btn>
            )}
            <Btn href="/docs" $ghost>
              Privacy / verification info
            </Btn>
          </Row>
          <Muted style={{ marginTop: 8 }}>
            Cache scope keys include chain, wallet, and domain (
            {cacheKeys.identity.split(':').slice(0, 3).join(':')}…).
          </Muted>
        </Band>
      </Stack>
    </Page>
  )
}

export default PassportV1Shell
