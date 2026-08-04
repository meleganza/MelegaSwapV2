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
  ChainSelectBtn,
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
  buildProjectChainDeployments,
  defaultSelectedChainId,
  explorerLabelFor,
  explorerUrlFor,
  filterParticipationByChain,
  getBuyTokenHref,
  getPrimaryAssetForChain,
  getSocialResources,
  shortenRouter,
} from './helpers'
import { useProjectLiveMarket } from './useProjectLiveMarket'
import ProjectTradingEmbed from './ProjectTradingEmbed'
import ProjectCharts from './ProjectCharts'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'

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

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;

  @media (max-width: 479px) {
    flex-direction: column;
    align-items: stretch;

    a,
    button {
      width: 100%;
      justify-content: center;
    }
  }
`

const MetaStrip = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid ${pp.line};
  background: rgba(0, 0, 0, 0.25);
  font-size: 12px;
  color: ${pp.mute};

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  strong {
    color: ${pp.text};
    font-variant-numeric: tabular-nums;
  }
`

const ClaimBlock = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.02);
  max-width: 520px;
`

const ClaimTitle = styled.div`
  font-size: 13px;
  font-weight: 750;
  color: #f5f5f5;
`

const ClaimBody = styled.p`
  margin: 4px 0 8px;
  font-size: 12px;
  line-height: 1.4;
  color: ${pp.mute};
`

const ClaimSteps = styled.ol`
  margin: 0 0 10px;
  padding-left: 18px;
  font-size: 11px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.62);
`

const GrowStrip = styled.div`
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background: rgba(244, 196, 48, 0.05);
  max-width: 640px;
  overflow-x: hidden;
`

const GrowTitle = styled.div`
  font-size: 12px;
  font-weight: 750;
  color: ${pp.gold};
  margin-bottom: 6px;
`

const PaidBadge = styled.span<{ $kind: 'featured' | 'boosted' }>`
  display: inline-flex;
  align-items: center;
  height: 18px;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.02em;
  border: 1px solid;
  color: ${({ $kind }) => ($kind === 'featured' ? '#f2c84c' : '#c4b5fd')};
  border-color: ${({ $kind }) =>
    $kind === 'featured' ? 'rgba(244, 196, 48, 0.55)' : 'rgba(196, 181, 253, 0.45)'};
  background: ${({ $kind }) =>
    $kind === 'featured' ? 'rgba(244, 196, 48, 0.14)' : 'rgba(139, 92, 246, 0.12)'};
`

const DenseIdentity = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
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
  const deployments = useMemo(() => buildProjectChainDeployments(document), [document])
  const [selectedChainId, setSelectedChainId] = useState(() => defaultSelectedChainId(deployments))
  const selected =
    deployments.find((d) => d.chainId === selectedChainId) ??
    deployments.find((d) => d.status === 'LIVE') ??
    deployments[0]
  const primary = selected
    ? getPrimaryAssetForChain(document, selected.chainId)
    : null
  const symbol = primary?.symbol?.value ?? null
  const chainId = selected?.chainId ?? 56
  const chainLabel = selected?.shortLabel ?? 'BNB'
  const contract = selected?.contractAddress ?? null
  const routerAddress = selected?.routerAddress ?? null
  const explorerLabel = selected?.explorerLabel ?? explorerLabelFor(chainId)
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
  const buyHref = getBuyTokenHref({ chainId, contract })
  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length)
  const [pay, setPay] = useState<(typeof PAYMENTS)[number]>('BNB')
  const [copied, setCopied] = useState(false)

  const chainFarms = useMemo(
    () => filterParticipationByChain(participationDocument.farms, chainId),
    [participationDocument.farms, chainId],
  )
  const chainPools = useMemo(
    () => filterParticipationByChain(participationDocument.stakingPools, chainId),
    [participationDocument.stakingPools, chainId],
  )
  const chainLiquidity = useMemo(
    () => filterParticipationByChain(participationDocument.pools, chainId),
    [participationDocument.pools, chainId],
  )

  const tokenDecimals =
    primary?.decimals?.meta?.availability === 'AVAILABLE' && typeof primary.decimals.value === 'number'
      ? primary.decimals.value
      : 18

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

  const onSelectChain = useCallback(
    (nextId: number, disabled: boolean) => {
      if (disabled) return
      setSelectedChainId(nextId)
    },
    [],
  )

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

  const largestPool = chainLiquidity[0] ?? null
  const readinessUpdated = formatRelativeTime(readinessDocument.generatedAt)

  return (
    <Page
      id="project-page-v1"
      data-testid="project-page-v1"
      data-project-rebuild="zero-rebuild-v1"
      data-project-nav="none"
      data-project-layout="dense-long-page"
      data-project-chain-id={chainId}
      data-project-multichain="ready"
    >
      {/* SECTION 1 — Identity Hero */}
      <Band aria-labelledby="pp-v1-identity" data-project-section="identity-hero">
        <Row style={{ alignItems: 'flex-start', gap: 12 }}>
          <LogoWrap>
            <MelegaTokenAvatar
              logoURI={logoUrl}
              symbol={symbol ?? document.identity.displayName.slice(0, 2)}
              address={contract ?? undefined}
              chainId={chainId}
              size={56}
            />
          </LogoWrap>
          <div style={{ minWidth: 0, flex: 1 }}>
            <HeroName id="pp-v1-identity">{document.identity.displayName}</HeroName>
            <HeroSub>
              {symbol ? <Ticker>${symbol}</Ticker> : null}
              <MelegaExploreChainBadge chainId={chainId} />
              <Chip $on={/verif/i.test(verified)} data-testid="project-v1-verified">
                {verified}
              </Chip>
              <Chip>{market.status === 'LIVE' ? 'Live market' : market.status}</Chip>
            </HeroSub>

            <HeroSub style={{ marginTop: 10 }} data-testid="project-v1-chain-deployments">
              {deployments.map((d) => (
                <ChainSelectBtn
                  key={d.chainId}
                  type="button"
                  $on={d.chainId === chainId && !d.comingSoon}
                  $disabled={d.comingSoon || d.status !== 'LIVE'}
                  disabled={d.comingSoon || d.status !== 'LIVE'}
                  aria-pressed={d.chainId === chainId}
                  data-testid={`project-v1-chain-${d.chainId}`}
                  data-chain-status={d.status}
                  title={d.comingSoon ? `${d.shortLabel} — Coming soon` : d.label}
                  onClick={() => onSelectChain(d.chainId, d.comingSoon || d.status !== 'LIVE')}
                >
                  {d.shortLabel}
                  {d.comingSoon ? ' · Coming soon' : d.status === 'LIVE' ? ' · LIVE' : ''}
                </ChainSelectBtn>
              ))}
            </HeroSub>

            <MetaStrip data-testid="project-v1-chain-meta">
              <div>
                Contract{' '}
                <strong>{contract ? shortenAddress(contract) : 'Unavailable'}</strong>
              </div>
              <div>
                Router{' '}
                <strong>{routerAddress ? shortenRouter(routerAddress) : 'Coming soon'}</strong>
              </div>
              <div>
                Explorer{' '}
                <strong>{contract ? explorerLabel : '—'}</strong>
              </div>
              <div>
                Swap target{' '}
                <strong>{selected?.swapTarget ?? 'Unavailable'}</strong>
              </div>
            </MetaStrip>

            <ContractRow>
              {contract ? (
                <>
                  <CopyBtn type="button" onClick={onCopy} data-testid="project-v1-copy-contract">
                    {copied ? 'Copied' : 'Copy Contract'}
                  </CopyBtn>
                  <Btn
                    $ghost
                    href={explorerUrlFor(contract, chainId)}
                    target="_blank"
                    rel="noreferrer"
                    data-testid="project-v1-explorer"
                  >
                    {explorerLabel}
                  </Btn>
                  <span data-testid="project-v1-add-to-wallet">
                    <AddToWalletButton
                      variant="text"
                      scale="sm"
                      p="0 8px"
                      height="28px"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        border: `1px solid ${pp.line}`,
                        borderRadius: 7,
                        minHeight: 28,
                      }}
                      marginTextBetweenLogo="4px"
                      textOptions={AddToWalletTextOptions.TEXT}
                      tokenAddress={contract}
                      tokenSymbol={symbol ?? 'TOKEN'}
                      tokenDecimals={tokenDecimals}
                      tokenLogo={logoUrl ?? `/images/${chainId}/tokens/${contract}.png`}
                    />
                  </span>
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
            <HeroActions>
              <Btn $primary href={buyHref} data-testid="project-v1-buy">
                Buy Token{symbol ? ` · ${symbol}` : ''}
              </Btn>
              {contract ? (
                <span data-testid="project-v1-add-wallet-secondary">
                  <AddToWalletButton
                    variant="text"
                    scale="md"
                    height="36px"
                    style={{
                      fontSize: '13px',
                      fontWeight: 750,
                      border: `1px solid ${pp.line}`,
                      borderRadius: 9,
                      minHeight: 36,
                      padding: '0 14px',
                    }}
                    marginTextBetweenLogo="6px"
                    textOptions={AddToWalletTextOptions.TEXT}
                    tokenAddress={contract}
                    tokenSymbol={symbol ?? 'TOKEN'}
                    tokenDecimals={tokenDecimals}
                    tokenLogo={logoUrl ?? `/images/${chainId}/tokens/${contract}.png`}
                  />
                </span>
              ) : null}
              <Btn href={buyHref} data-testid="project-v1-trade">
                Trade
              </Btn>
              <Btn href={`/farms?chain=${chainId}`} data-testid="project-v1-next-farm">
                Farm
              </Btn>
              <Btn href={`/pools?chain=${chainId}`} data-testid="project-v1-next-pool">
                Pool
              </Btn>
              <Btn href={`/liquidity-studio?chain=${chainId}`} data-testid="project-v1-liquidity">
                Liquidity
              </Btn>
            </HeroActions>

            <ClaimBlock data-testid="project-v1-claim-block">
              <ClaimTitle>Are you the project owner?</ClaimTitle>
              <ClaimBody>Claim this page to manage your information.</ClaimBody>
              <ClaimSteps>
                <li>Connect wallet</li>
                <li>Ownership verification</li>
                <li>Customize logo, description, website, socials &amp; links</li>
              </ClaimSteps>
              <Muted style={{ marginBottom: 8 }}>No arbitrary editing — verified owners only.</Muted>
              <Btn
                $ghost
                href={`/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}`}
                data-testid="project-v1-claim"
              >
                Claim Project
              </Btn>
            </ClaimBlock>

            <GrowStrip data-testid="project-v1-grow-cta">
              <GrowTitle>Grow Your Project</GrowTitle>
              <Row>
                <Btn $ghost href="/list?intent=create-token" data-testid="project-v1-grow-create-token">
                  Create Token
                </Btn>
                <Btn $ghost href={`/liquidity-studio?chain=${chainId}`} data-testid="project-v1-grow-liquidity">
                  Liquidity
                </Btn>
                <Btn $ghost href={`/farms?chain=${chainId}`} data-testid="project-v1-grow-farm">
                  Farm
                </Btn>
                <Btn
                  $ghost
                  href={`/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}#featured`}
                  data-testid="project-v1-grow-featured"
                >
                  Featured
                </Btn>
                <Btn
                  $ghost
                  href={`/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}#trend-boost`}
                  data-testid="project-v1-grow-trend-boost"
                >
                  Trend Boost
                </Btn>
              </Row>
            </GrowStrip>
          </div>
        </Row>
      </Band>

      {/* SECTION 2 — Market (compact factual strip) */}
      <Band aria-labelledby="pp-v1-market" data-project-section="live-market" data-testid="project-v1-market">
        <BandHead>
          <BandTitle id="pp-v1-market">Market</BandTitle>
          <BandMeta>{market.loading ? 'loading…' : market.lastUpdate ?? 'no recent trade'}</BandMeta>
        </BandHead>
        <Grid $cols={3} data-testid="project-v1-market-grid">
          <Metric
            label="Price"
            value={market.priceBnb !== 'Unavailable' ? market.priceBnb : market.priceUsd}
            tone="gold"
            provenance={
              market.priceBnb !== 'Unavailable' || market.priceUsd !== 'Unavailable'
                ? live(market.source, market.lastUpdate)
                : UNAVAILABLE
            }
          />
          <Metric
            label="24h change"
            value={market.trend}
            tone={market.trendPositive === true ? 'ok' : market.trendPositive === false ? 'bad' : 'mute'}
            provenance={market.trend !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Volume"
            value={market.volume24h}
            provenance={market.volume24h !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Liquidity"
            value={market.liquidity}
            provenance={market.liquidity !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric label="Holders" value={market.holders} provenance={UNAVAILABLE} />
          <Metric label="Chain" value={chainLabel} provenance={indexed('chain-registry')} />
        </Grid>
      </Band>

      {/* SECTION 3 — Trading */}
      <ProjectTradingEmbed
        slug={document.slug}
        marketsDocument={marketsDocument}
        projectChainId={chainId}
        contractAddress={contract}
      />

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
      <Band aria-labelledby="pp-v1-liquidity" data-project-section="liquidity" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-liquidity">Liquidity</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainLiquidity.length} pools
          </BandMeta>
        </BandHead>
        <Grid $cols={4} style={{ marginBottom: 8 }}>
          <Metric
            label="Pools"
            value={String(chainLiquidity.length)}
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
        <DenseTable data-testid="project-v1-liquidity-table">
          {chainLiquidity.length ? (
            chainLiquidity.slice(0, 6).map((p) => (
              <DenseRow key={p.participationId} data-testid="project-v1-liquidity-row">
                <DenseIdentity>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{p.displayLabel}</strong>
                </DenseIdentity>
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
            <Muted>
              No liquidity pools registered for this project on {chainLabel}.
            </Muted>
          )}
        </DenseTable>
        <Row style={{ marginTop: 10 }}>
          {chainId === 56 ? (
            <Btn href={`/liquidity-studio?chain=${chainId}`}>Create LP</Btn>
          ) : (
            <Chip $disabled>Create LP · BNB only</Chip>
          )}
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
      <Band aria-labelledby="pp-v1-farms" data-project-section="farms" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-farms">Farms</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainFarms.length} active
          </BandMeta>
        </BandHead>
        <DenseTable data-testid="project-v1-farms-table">
          {chainFarms.length ? (
            chainFarms.slice(0, 8).map((f) => (
              <DenseRow key={f.participationId} data-testid="project-v1-farm-row">
                <DenseIdentity>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{f.displayLabel}</strong>
                </DenseIdentity>
                <span>Farm available</span>
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
            <Muted>No active farms registered for this project on {chainLabel}.</Muted>
          )}
        </DenseTable>
      </Band>

      {/* SECTION 8 — Pools */}
      <Band aria-labelledby="pp-v1-pools" data-project-section="pools" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-pools">Pools</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainPools.length} reward pools
          </BandMeta>
        </BandHead>
        <DenseTable data-testid="project-v1-pools-table">
          {chainPools.length ? (
            chainPools.slice(0, 8).map((p) => (
              <DenseRow key={p.participationId} data-testid="project-v1-pool-row">
                <DenseIdentity>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{p.displayLabel}</strong>
                </DenseIdentity>
                <span>Pool available</span>
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
            <Muted>No reward pools registered for this project on {chainLabel}.</Muted>
          )}
        </DenseTable>
      </Band>

      {/* SECTION 9 — Featured (paid placement — honest label) */}
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
          <BandTitle id="pp-v1-featured">
            <PaidBadge $kind="featured" data-testid="placement-label-featured">
              Featured
            </PaidBadge>{' '}
            Promotion
          </BandTitle>
          <BandMeta>Paid placement · UX only</BandMeta>
        </BandHead>
        <Prose style={{ marginBottom: 8 }}>
          Paid Featured placement on Melega Home — not an organic ranking. Your project rotates among the four
          Home Featured cards for seven days.
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

      {/* SECTION 9b — Trend Boost (paid — honest Boosted label) */}
      <Band
        aria-labelledby="pp-v1-boost"
        data-project-section="trend-boost"
        data-testid="project-trend-boost-promotion"
        style={{
          borderColor: 'rgba(196, 181, 253, 0.35)',
          background:
            'radial-gradient(ellipse 80% 60% at 8% 0%, rgba(139,92,246,0.12), transparent 55%), linear-gradient(165deg, rgba(18,16,28,0.98), rgba(12,12,12,0.98))',
        }}
      >
        <BandHead>
          <BandTitle id="pp-v1-boost">
            <PaidBadge $kind="boosted" data-testid="placement-label-boosted">
              Boosted
            </PaidBadge>{' '}
            Trend Boost
          </BandTitle>
          <BandMeta>Paid placement · UX only</BandMeta>
        </BandHead>
        <Prose style={{ marginBottom: 8 }}>
          Paid Trend Boost surfaces your project in discovery — clearly labelled Boosted, never presented as
          organic momentum.
        </Prose>
        <Btn
          $ghost
          href={`/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}#trend-boost`}
          data-testid="project-v1-get-boost"
        >
          Get Trend Boost
        </Btn>
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
