/**
 * MELEGA_DEX_V1_PROJECT_PAGE_ZERO_REBUILD — entirely new Project Page.
 * One long dense page. No tabs. No anchors. No archived consumer UI.
 */
import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import dynamic from 'next/dynamic'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectEvidencePack } from 'registry/projects/identity/evidence/types'
import type { ProjectReadinessDocument } from 'registry/projects/identity/readiness/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import type { ProjectParticipationDocument } from 'registry/projects/identity/participation'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectUpdatesDocument } from 'registry/projects/identity/updates'
import type { ProjectEcosystemDocument } from 'registry/projects/identity/ecosystem'
import type { ProjectDeveloperDocument } from 'registry/projects/identity/developer'
import type { ProjectGovernanceDocument } from 'registry/projects/identity/governance'
import type { ProjectGrowthDocument } from 'registry/projects/identity/growth'
import type { ProjectMachineDocument } from 'registry/projects/identity/machine'
import type { ProjectTokenomicsDocument } from 'registry/projects/identity/tokenomics/schema'
import type { ProjectRoadmapDocument } from 'registry/projects/identity/roadmap/schema'
import { shortenAddress, humanEnumLabel, formatRelativeTime } from '../presentation/humanLabels'
import {
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Btn,
  Chip,
  DenseRow,
  DenseTable,
  Grid,
  List,
  Muted,
  Page,
  Prose,
  Row,
  Split,
  pp,
} from './theme'
import { Metric, indexed, live, UNAVAILABLE } from './Metric'
import {
  explorerUrlFor,
  getPreferredBuyHref,
  getPrimaryAsset,
  getPrimaryChainId,
  getPrimaryChainLabel,
  getSocialResources,
  getTradeHref,
} from './helpers'
import { useProjectLiveMarket } from './useProjectLiveMarket'
import ProjectTradingEmbed from './ProjectTradingEmbed'
import ProjectCharts from './ProjectCharts'

const ProjectMachineSection = dynamic(() => import('../ProjectMachineSection'), {
  ssr: false,
  loading: () => null,
})

const LogoWrap = styled.div`
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${pp.line};
  background: #111;
`

const HeroName = styled.h1`
  margin: 0;
  font-size: clamp(22px, 4vw, 32px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #fff;
`

const Ticker = styled.span`
  font-size: 15px;
  font-weight: 750;
  color: ${pp.gold};
`

const HeroSub = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  font-size: 12px;
  color: ${pp.mute};
  font-variant-numeric: tabular-nums;
`

const CopyBtn = styled.button`
  appearance: none;
  cursor: pointer;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 7px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.04);
  color: ${pp.text};
  font-size: 11px;
  font-weight: 700;
`

const PromoPrice = styled.div`
  font-size: 28px;
  font-weight: 850;
  color: ${pp.gold};
  letter-spacing: -0.02em;
`

const PayChip = styled.button<{ $on?: boolean }>`
  appearance: none;
  cursor: pointer;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid ${({ $on }) => ($on ? pp.goldLine : pp.line)};
  background: ${({ $on }) => ($on ? pp.goldDim : 'rgba(255,255,255,0.03)')};
  color: ${({ $on }) => ($on ? pp.gold : pp.text)};
  font-size: 12px;
  font-weight: 750;
`

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  padding: 0 14px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 750;
  cursor: pointer;
  border: 1px solid ${pp.goldLine};
  background: linear-gradient(180deg, #f2c84c 0%, #d4a017 100%);
  color: #111;
`

interface Props {
  document: CanonicalProjectDocument
  evidencePack: ProjectEvidencePack
  readinessDocument: ProjectReadinessDocument
  marketsDocument: ProjectMarketsDocument
  participationDocument: ProjectParticipationDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
  updatesDocument: ProjectUpdatesDocument
  ecosystemDocument: ProjectEcosystemDocument
  developerDocument: ProjectDeveloperDocument
  governanceDocument: ProjectGovernanceDocument
  growthDocument: ProjectGrowthDocument
  machineDocument: ProjectMachineDocument
  tokenomicsDocument?: ProjectTokenomicsDocument | null
  roadmapDocument?: ProjectRoadmapDocument | null
}

const PAYMENTS = ['BNB', 'USDT', 'USDC', 'MARCO'] as const

export const ProjectPageV1Shell: React.FC<Props> = ({
  document,
  evidencePack,
  readinessDocument,
  marketsDocument,
  participationDocument,
  liquidityBuildingDocument,
  developerDocument,
  governanceDocument,
  growthDocument,
  machineDocument,
  tokenomicsDocument = null,
  roadmapDocument = null,
}) => {
  const primary = getPrimaryAsset(document)
  const symbol = primary?.symbol?.value ?? null
  const chainLabel = getPrimaryChainLabel(document)
  const chainId = getPrimaryChainId(document)
  const contract =
    primary?.contractAddress && /^0x[a-fA-F0-9]{40}$/.test(primary.contractAddress)
      ? primary.contractAddress
      : null
  const verified =
    document.identity.verificationState?.meta?.availability === 'AVAILABLE'
      ? humanEnumLabel(document.identity.verificationState.value)
      : 'Unavailable'
  const logoUrl =
    document.identity.logoUrl?.meta?.availability === 'AVAILABLE'
      ? document.identity.logoUrl.value
      : undefined
  const socials = getSocialResources(document)
  const website = document.resources.find((r) => r.resourceType === 'website')
  const github = document.resources.find((r) => r.resourceType === 'github')
  const buyHref = getPreferredBuyHref(marketsDocument) ?? '/trade'
  const tradeHref = getTradeHref(marketsDocument)
  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length)
  const [pay, setPay] = useState<(typeof PAYMENTS)[number]>('BNB')
  const [copied, setCopied] = useState(false)

  const onCopy = useCallback(async () => {
    if (!contract) return
    try {
      await navigator.clipboard.writeText(contract)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }, [contract])

  const ownerLabel = useMemo(() => {
    const g = governanceDocument as { ownership?: { status?: string }; owner?: { label?: string } }
    return g?.owner?.label || g?.ownership?.status || 'Unavailable'
  }, [governanceDocument])

  const launchDate = useMemo(() => {
    const d = document.identity.updatedAt
    return d ? new Date(d).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unavailable'
  }, [document.identity.updatedAt])

  const description =
    document.identity.description?.meta?.availability === 'AVAILABLE'
      ? document.identity.description.value
      : document.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
        ? document.identity.shortPurpose.value
        : 'Unavailable'

  const utilities =
    (document.identity.tags?.length ? document.identity.tags : document.identity.categories) ?? []

  const largestPool = participationDocument.pools[0] ?? null
  const readinessUpdated = formatRelativeTime(readinessDocument.generatedAt)

  return (
    <Page
      id="project-page-v1"
      data-testid="project-page-v1"
      data-project-rebuild="zero-rebuild-v1"
      data-project-nav="none"
      data-project-layout="dense-long-page"
    >
      {/* SECTION 1 — Identity Hero */}
      <Band aria-labelledby="pp-v1-identity" data-project-section="identity-hero">
        <Row style={{ alignItems: 'flex-start', gap: 12 }}>
          <LogoWrap>
            <MelegaTokenAvatar
              logoURI={logoUrl}
              symbol={symbol ?? document.identity.displayName.slice(0, 2)}
              address={contract ?? undefined}
              chainId={chainId ?? 56}
              size={56}
            />
          </LogoWrap>
          <div style={{ minWidth: 0, flex: 1 }}>
            <HeroName id="pp-v1-identity">{document.identity.displayName}</HeroName>
            <HeroSub>
              {symbol ? <Ticker>${symbol}</Ticker> : null}
              <Chip $on>{chainLabel}</Chip>
              <Chip $on={/verif/i.test(verified)}>{verified}</Chip>
              <Chip>{market.status === 'LIVE' ? 'Live market' : market.status}</Chip>
            </HeroSub>
            <ContractRow>
              <span>Contract</span>
              <strong style={{ color: pp.text }}>
                {contract ? shortenAddress(contract) : 'Unavailable'}
              </strong>
              {contract ? (
                <>
                  <CopyBtn type="button" onClick={onCopy} data-testid="project-v1-copy-contract">
                    {copied ? 'Copied' : 'Copy'}
                  </CopyBtn>
                  <Btn $ghost href={explorerUrlFor(contract, chainId)} target="_blank" rel="noreferrer">
                    BscScan
                  </Btn>
                </>
              ) : null}
              {website ? (
                <Btn $ghost href={website.url} target="_blank" rel="noreferrer">
                  Website
                </Btn>
              ) : null}
            </ContractRow>
            <HeroSub style={{ marginTop: 8 }}>
              {socials
                .filter((s) => s.resourceType === 'social')
                .slice(0, 6)
                .map((s) => (
                  <Btn key={s.url} $ghost href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </Btn>
                ))}
            </HeroSub>
            <Grid $cols={4} style={{ marginTop: 10 }}>
              <Metric label="Launch date" value={launchDate} provenance={indexed('project-registry')} />
              <Metric label="Owner" value={String(ownerLabel)} provenance={indexed('governance-registry')} />
              <Metric
                label="Market status"
                value={market.status}
                provenance={market.row ? live(market.source, market.lastUpdate) : UNAVAILABLE}
              />
              <Metric
                label="Readiness"
                value={
                  document.identity.readiness?.value?.label
                    ? humanEnumLabel(document.identity.readiness.value.label)
                    : 'Unavailable'
                }
                provenance={indexed('readiness', readinessUpdated)}
              />
            </Grid>
            <Row style={{ marginTop: 12 }}>
              <Btn $primary href={buyHref} data-testid="project-v1-buy">
                Buy{symbol ? ` ${symbol}` : ''}
              </Btn>
              <Btn href={tradeHref} data-testid="project-v1-trade">
                Trade
              </Btn>
            </Row>
          </div>
        </Row>
      </Band>

      {/* SECTION 2 — Live Market */}
      <Band aria-labelledby="pp-v1-market" data-project-section="live-market">
        <BandHead>
          <BandTitle id="pp-v1-market">Live Market</BandTitle>
          <BandMeta>{market.loading ? 'loading…' : market.lastUpdate ?? 'no recent trade'}</BandMeta>
        </BandHead>
        <Grid $cols={4}>
          <Metric label="Price USD" value={market.priceUsd} provenance={UNAVAILABLE} />
          <Metric
            label="Price BNB"
            value={market.priceBnb}
            tone="gold"
            provenance={market.priceBnb !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Market Cap"
            value={market.marketCap}
            provenance={market.marketCap !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric label="FDV" value={market.fdv} provenance={UNAVAILABLE} />
          <Metric
            label="Liquidity"
            value={market.liquidity}
            provenance={market.liquidity !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="24H Volume"
            value={market.volume24h}
            provenance={market.volume24h !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="24H Swaps"
            value={market.swaps24h}
            provenance={market.swaps24h !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric label="Holders" value={market.holders} provenance={UNAVAILABLE} />
          <Metric
            label="Markets"
            value={market.markets}
            provenance={
              market.markets !== 'Unavailable' ? indexed('venue-registry') : UNAVAILABLE
            }
          />
          <Metric
            label="Trend"
            value={market.trend}
            tone={market.trendPositive === true ? 'ok' : market.trendPositive === false ? 'bad' : 'mute'}
            provenance={market.trend !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric label="ATH" value={market.ath} provenance={UNAVAILABLE} />
          <Metric label="ATL" value={market.atl} provenance={UNAVAILABLE} />
        </Grid>
      </Band>

      {/* SECTION 3 — Trading */}
      <ProjectTradingEmbed slug={document.slug} marketsDocument={marketsDocument} />

      {/* SECTION 4 — Charts */}
      <ProjectCharts slug={document.slug} marketsDocument={marketsDocument} />

      {/* SECTION 5 — Project */}
      <Band aria-labelledby="pp-v1-project" data-project-section="project">
        <BandHead>
          <BandTitle id="pp-v1-project">Project</BandTitle>
          <BandMeta>registry</BandMeta>
        </BandHead>
        <Split>
          <div>
            <Prose style={{ marginBottom: 10 }}>{description}</Prose>
            <Muted style={{ marginBottom: 6 }}>
              Category:{' '}
              {document.identity.categories?.length
                ? document.identity.categories.join(' · ')
                : 'Unavailable'}
            </Muted>
            {utilities.length ? (
              <Row style={{ marginBottom: 10 }}>
                {utilities.slice(0, 8).map((u) => (
                  <Chip key={u}>{u}</Chip>
                ))}
              </Row>
            ) : (
              <Muted style={{ marginBottom: 10 }}>Utilities: Unavailable</Muted>
            )}
            <BandTitle as="h3" style={{ marginBottom: 6 }}>
              Roadmap
            </BandTitle>
            {roadmapDocument?.milestones?.length ? (
              <List>
                {roadmapDocument.milestones.slice(0, 8).map((m, i) => (
                  <li key={`${m.title ?? i}`}>
                    {m.title ?? 'Milestone'}
                    {m.status ? ` — ${humanEnumLabel(m.status)}` : ''}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>Unavailable</Muted>
            )}
          </div>
          <div>
            <BandTitle as="h3" style={{ marginBottom: 6 }}>
              Tokenomics
            </BandTitle>
            {tokenomicsDocument?.allocationCategories?.length ? (
              <List>
                {tokenomicsDocument.allocationCategories.slice(0, 10).map((c) => (
                  <li key={c.id}>
                    {c.label}
                    {c.percent != null ? ` — ${c.percent}%` : ''}
                  </li>
                ))}
              </List>
            ) : (
              <Muted>Unavailable</Muted>
            )}
            <BandTitle as="h3" style={{ margin: '12px 0 6px' }}>
              Links
            </BandTitle>
            <Row>
              {document.resources.slice(0, 10).map((r) => (
                <Btn key={r.url} $ghost href={r.url} target="_blank" rel="noreferrer">
                  {r.label}
                </Btn>
              ))}
              {!document.resources.length ? <Muted>Unavailable</Muted> : null}
            </Row>
          </div>
        </Split>
      </Band>

      {/* SECTION 6 — Liquidity */}
      <Band aria-labelledby="pp-v1-liquidity" data-project-section="liquidity">
        <BandHead>
          <BandTitle id="pp-v1-liquidity">Liquidity</BandTitle>
          <BandMeta>{participationDocument.summary.liquidityPoolCount} pools</BandMeta>
        </BandHead>
        <Grid $cols={4} style={{ marginBottom: 8 }}>
          <Metric
            label="Pools"
            value={String(participationDocument.summary.liquidityPoolCount)}
            provenance={indexed('venue-registry', participationDocument.generatedAt)}
          />
          <Metric
            label="Liquidity"
            value={market.liquidity}
            provenance={market.liquidity !== 'Unavailable' ? indexed(market.source) : UNAVAILABLE}
          />
          <Metric label="LP Holders" value="Unavailable" provenance={UNAVAILABLE} />
          <Metric
            label="Largest Pool"
            value={largestPool?.displayLabel ?? 'Unavailable'}
            provenance={largestPool ? indexed('venue-registry') : UNAVAILABLE}
          />
        </Grid>
        <DenseTable>
          {participationDocument.pools.length ? (
            participationDocument.pools.slice(0, 6).map((p) => (
              <DenseRow key={p.participationId}>
                <strong>{p.displayLabel}</strong>
                <span>{humanEnumLabel(p.status)}</span>
                <span>{humanEnumLabel(p.availability)}</span>
                {p.destination?.href ? (
                  <Btn $ghost href={p.destination.href}>
                    Open
                  </Btn>
                ) : (
                  <span>Unavailable</span>
                )}
              </DenseRow>
            ))
          ) : (
            <Muted>No liquidity pools registered for this project.</Muted>
          )}
        </DenseTable>
        <Row style={{ marginTop: 10 }}>
          <Btn href="/liquidity-studio">Create LP</Btn>
          {liquidityBuildingDocument ? (
            <Chip>
              LB:{' '}
              {(liquidityBuildingDocument as { summary?: { status?: string } }).summary?.status ??
                'indexed'}
            </Chip>
          ) : null}
        </Row>
      </Band>

      {/* SECTION 7 — Farms */}
      <Band aria-labelledby="pp-v1-farms" data-project-section="farms">
        <BandHead>
          <BandTitle id="pp-v1-farms">Farms</BandTitle>
          <BandMeta>{participationDocument.summary.farmCount} active</BandMeta>
        </BandHead>
        <DenseTable>
          {participationDocument.farms.length ? (
            participationDocument.farms.slice(0, 8).map((f) => (
              <DenseRow key={f.participationId}>
                <strong>{f.displayLabel}</strong>
                <span>APR Unavailable</span>
                <span>{f.farmPid != null ? `PID ${f.farmPid}` : 'Rewards indexed'}</span>
                {f.destination?.href ? (
                  <Btn $ghost href={f.destination.href}>
                    Stake
                  </Btn>
                ) : (
                  <span>Unavailable</span>
                )}
              </DenseRow>
            ))
          ) : (
            <Muted>No active farms registered for this project.</Muted>
          )}
        </DenseTable>
      </Band>

      {/* SECTION 8 — Pools */}
      <Band aria-labelledby="pp-v1-pools" data-project-section="pools">
        <BandHead>
          <BandTitle id="pp-v1-pools">Pools</BandTitle>
          <BandMeta>{participationDocument.summary.stakingPoolCount} reward pools</BandMeta>
        </BandHead>
        <DenseTable>
          {participationDocument.stakingPools.length ? (
            participationDocument.stakingPools.slice(0, 8).map((p) => (
              <DenseRow key={p.participationId}>
                <strong>{p.displayLabel}</strong>
                <span>APR Unavailable</span>
                <span>{p.sousId != null ? `Sous ${p.sousId}` : 'Reward pool'}</span>
                {p.destination?.href ? (
                  <Btn $ghost href={p.destination.href}>
                    Stake
                  </Btn>
                ) : (
                  <span>Unavailable</span>
                )}
              </DenseRow>
            ))
          ) : (
            <Muted>No reward pools registered for this project.</Muted>
          )}
        </DenseTable>
      </Band>

      {/* SECTION 9 — Featured Promotion */}
      <Band
        aria-labelledby="pp-v1-featured"
        data-project-section="featured-promotion"
        data-testid="project-featured-home-promotion"
        style={{
          borderColor: pp.goldLine,
          background:
            'radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242,200,76,0.14), transparent 55%), linear-gradient(165deg, rgba(22,20,12,0.98), rgba(12,12,12,0.98))',
        }}
      >
        <BandHead>
          <BandTitle id="pp-v1-featured">Featured Promotion</BandTitle>
          <BandMeta>NEW · UX only</BandMeta>
        </BandHead>
        <Prose style={{ marginBottom: 8 }}>
          Become FEATURED on Melega Home. Your project rotates among the four Home Featured cards for seven
          days — the premium discovery slot founders want.
        </Prose>
        <Row style={{ marginBottom: 8, alignItems: 'baseline' }}>
          <PromoPrice>99 USD</PromoPrice>
          <Chip $on>7 days</Chip>
          <Chip>4-card Home rotation</Chip>
        </Row>
        <Muted style={{ marginBottom: 8 }}>Accepted assets</Muted>
        <Row style={{ marginBottom: 8 }}>
          {PAYMENTS.map((asset) => (
            <PayChip
              key={asset}
              type="button"
              $on={pay === asset}
              onClick={() => setPay(asset)}
              data-testid={`project-v1-featured-pay-${asset.toLowerCase()}`}
            >
              {asset}
            </PayChip>
          ))}
        </Row>
        {pay === 'MARCO' ? (
          <Muted style={{ marginBottom: 10 }} data-testid="project-v1-marco-cashback">
            5% M-Credits Cashback when paying with MARCO.
          </Muted>
        ) : (
          <Muted style={{ marginBottom: 10 }}>Pay with BNB · USDT · USDC · MARCO</Muted>
        )}
        <PrimaryButton type="button" data-testid="project-v1-get-featured">
          GET FEATURED
        </PrimaryButton>
        <Muted style={{ marginTop: 8 }}>
          Product selection only — payment is not processed on this screen.
        </Muted>
      </Band>

      {/* SECTION 10 — Developer */}
      <Band aria-labelledby="pp-v1-developer" data-project-section="developer">
        <BandHead>
          <BandTitle id="pp-v1-developer">Developer</BandTitle>
          <BandMeta>registry</BandMeta>
        </BandHead>
        <Grid $cols={4}>
          <Metric
            label="Github"
            value={github?.url ? 'Available' : 'Unavailable'}
            provenance={github ? indexed('project-resources') : UNAVAILABLE}
          />
          <Metric
            label="Audit"
            value={
              evidencePack.evidence?.some((e) => /audit/i.test(e.claimType))
                ? 'Indexed'
                : 'Unavailable'
            }
            provenance={
              evidencePack.evidence?.some((e) => /audit/i.test(e.claimType))
                ? indexed('evidence-pack')
                : UNAVAILABLE
            }
          />
          <Metric
            label="Contract"
            value={contract ? shortenAddress(contract) : 'Unavailable'}
            provenance={contract ? indexed('canonical-asset') : UNAVAILABLE}
          />
          <Metric label="Ownership" value={String(ownerLabel)} provenance={indexed('governance-registry')} />
          <Metric label="Renounced" value="Unavailable" provenance={UNAVAILABLE} />
          <Metric label="Taxes" value="Unavailable" provenance={UNAVAILABLE} />
          <Metric label="Holders" value="Unavailable" provenance={UNAVAILABLE} />
          <Metric
            label="Risk"
            value={growthDocument ? 'See growth notes' : 'Unavailable'}
            provenance={growthDocument ? indexed('growth-registry') : UNAVAILABLE}
          />
        </Grid>
        {github ? (
          <Row style={{ marginTop: 8 }}>
            <Btn $ghost href={github.url} target="_blank" rel="noreferrer">
              Open Github
            </Btn>
          </Row>
        ) : null}
      </Band>

      {/* SECTION 11 — Transparency */}
      <Band aria-labelledby="pp-v1-transparency" data-project-section="transparency">
        <BandHead>
          <BandTitle id="pp-v1-transparency">Transparency</BandTitle>
          <BandMeta>every metric discloses source</BandMeta>
        </BandHead>
        <Prose style={{ marginBottom: 10 }}>
          Every metric on this page indicates availability (indexed / live / unavailable), source, and last
          update when known. Missing facts render as Unavailable.
        </Prose>
        <Grid $cols={3}>
          <Metric
            label="Evidence items"
            value={String(evidencePack.evidence?.length ?? 0)}
            provenance={indexed('evidence-pack', evidencePack.generatedAt)}
          />
          <Metric
            label="Machine interface"
            value={machineDocument ? 'Indexed' : 'Unavailable'}
            provenance={machineDocument ? indexed('machine-document') : UNAVAILABLE}
          />
          <Metric
            label="Developer surface"
            value={developerDocument ? 'Indexed' : 'Unavailable'}
            provenance={developerDocument ? indexed('developer-document') : UNAVAILABLE}
          />
        </Grid>
        {machineDocument ? (
          <div style={{ marginTop: 12 }}>
            <ProjectMachineSection machineDocument={machineDocument} />
          </div>
        ) : null}
      </Band>
    </Page>
  )
}

export default ProjectPageV1Shell
