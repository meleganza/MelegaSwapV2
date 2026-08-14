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
import { shortenAddress, humanEnumLabel } from '../presentation/humanLabels'
import {
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Btn,
  ChainSelectBtn,
  Chip,
  Grid,
  Muted,
  Page,
  Prose,
  Row,
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

const HeroLayout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.1fr) minmax(300px, 0.9fr);
    align-items: start;
  }
`

const HeroIdentity = styled.div`
  min-width: 0;
`

const HeroSwapCol = styled.div`
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;
`

const HeroDesc = styled.p`
  margin: 10px 0 0;
  font-size: 14px;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  max-width: 42rem;
`

const ActionBar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding: 8px 0 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  min-width: 0;

  @media (max-width: 479px) {
    flex-direction: column;
    align-items: stretch;

    a,
    button,
    span {
      width: 100%;
    }

    a,
    button {
      justify-content: center;
    }
  }
`

const MarketStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const ClaimBlock = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px dashed rgba(255, 255, 255, 0.14);
  background: rgba(255, 255, 255, 0.02);
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

const GrowStrip = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background: rgba(244, 196, 48, 0.05);
  overflow-x: hidden;
`

const GrowTitle = styled.div`
  font-size: 12px;
  font-weight: 750;
  color: ${pp.gold};
  margin-bottom: 6px;
`

const SideCards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  margin-top: 10px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`

const CompactCards = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`

const VenueCard = styled.div`
  padding: 10px 12px;
  border-radius: 10px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  min-width: 0;
`

const VenueTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 750;
  color: #fff;
  min-width: 0;

  strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

const VenueMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
  margin-top: 6px;
  font-size: 11px;
  color: ${pp.mute};
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

  const description =
    document.identity.description?.meta?.availability === 'AVAILABLE'
      ? document.identity.description.value
      : document.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
        ? document.identity.shortPurpose.value
        : 'Unavailable'

  const utilities =
    (document.identity.tags?.length ? document.identity.tags : document.identity.categories) ?? []

  return (
    <Page
      id="project-page-v1"
      data-testid="project-page-v1"
      data-project-rebuild="zero-rebuild-v1"
      data-project-nav="none"
      data-project-layout="conversion-hero"
      data-project-chain-id={chainId}
      data-project-multichain="ready"
    >
      {/* SECTION 1 — Conversion Hero + in-hero Smart Swap */}
      <Band aria-labelledby="pp-v1-identity" data-project-section="identity-hero" data-testid="project-v1-hero">
        <HeroLayout>
          <HeroIdentity>
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
                </HeroSub>
              </div>
            </Row>

            <HeroDesc data-testid="project-v1-hero-description">{description}</HeroDesc>

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

            <ContractRow>
              {website ? (
                <Btn $ghost href={website.url} target="_blank" rel="noreferrer" data-testid="project-v1-website">
                  Website
                </Btn>
              ) : null}
              {socials
                .filter((s) => s.resourceType === 'social')
                .slice(0, 6)
                .map((s) => (
                  <Btn key={s.url} $ghost href={s.url} target="_blank" rel="noreferrer">
                    {s.label}
                  </Btn>
                ))}
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
                </>
              ) : null}
            </ContractRow>

            <ActionBar aria-label="Project actions" data-testid="project-v1-action-bar">
              <Btn $primary href={buyHref} data-testid="project-v1-buy">
                Buy Token
              </Btn>
              <Btn href={buyHref} data-testid="project-v1-trade">
                Trade
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
                      width: '100%',
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
              <Btn href={`/farms?chain=${chainId}`} data-testid="project-v1-next-farm">
                Farm
              </Btn>
              <Btn href={`/pools?chain=${chainId}`} data-testid="project-v1-next-pool">
                Pool
              </Btn>
              <Btn href={`/liquidity-studio?chain=${chainId}`} data-testid="project-v1-liquidity">
                Liquidity
              </Btn>
            </ActionBar>
          </HeroIdentity>

          <HeroSwapCol>
            <ProjectTradingEmbed
              slug={document.slug}
              marketsDocument={marketsDocument}
              projectChainId={chainId}
              contractAddress={contract}
              variant="hero"
            />
          </HeroSwapCol>
        </HeroLayout>
      </Band>

      {/* SECTION 2 — Market above fold */}
      <Band aria-labelledby="pp-v1-market" data-project-section="live-market" data-testid="project-v1-market">
        <BandHead>
          <BandTitle id="pp-v1-market">Market</BandTitle>
          <BandMeta>{market.loading ? 'loading…' : market.lastUpdate ?? 'no recent trade'}</BandMeta>
        </BandHead>
        <MarketStrip data-testid="project-v1-market-grid">
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
            label="Liquidity"
            value={market.liquidity}
            provenance={market.liquidity !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Volume"
            value={market.volume24h}
            provenance={market.volume24h !== 'Unavailable' ? live(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Market Cap"
            value={market.marketCap}
            provenance={market.marketCap !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric label="Holders" value={market.holders} provenance={UNAVAILABLE} />
        </MarketStrip>
      </Band>

      {/* SECTION 3 — Chart early */}
      <ProjectCharts slug={document.slug} marketsDocument={marketsDocument} />

      {/* SECTION 4 — Project narrative */}
      <Band aria-labelledby="pp-v1-project" data-project-section="project">
        <BandHead>
          <BandTitle id="pp-v1-project">About</BandTitle>
          <BandMeta>project</BandMeta>
        </BandHead>
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
        ) : null}
      </Band>

      {/* SECTION 5 — Liquidity / Farms / Pools compact */}
      <Band aria-labelledby="pp-v1-liquidity" data-project-section="liquidity" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-liquidity">Liquidity</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainLiquidity.length}
          </BandMeta>
        </BandHead>
        <CompactCards data-testid="project-v1-liquidity-table">
          {chainLiquidity.length ? (
            chainLiquidity.slice(0, 4).map((p) => (
              <VenueCard key={p.participationId} data-testid="project-v1-liquidity-row">
                <VenueTitle>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{p.displayLabel}</strong>
                </VenueTitle>
                <VenueMeta>
                  <span>Pair · {p.displayLabel}</span>
                  <span>TVL · {market.liquidity}</span>
                  <span>Volume · {market.volume24h}</span>
                  <span>Status · {humanEnumLabel(p.status)}</span>
                </VenueMeta>
                {p.destination?.href ? (
                  <Row style={{ marginTop: 8 }}>
                    <Btn $ghost href={p.destination.href}>
                      Open
                    </Btn>
                  </Row>
                ) : null}
              </VenueCard>
            ))
          ) : (
            <Muted>No liquidity pools on {chainLabel}.</Muted>
          )}
        </CompactCards>
      </Band>

      <Band aria-labelledby="pp-v1-farms" data-project-section="farms" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-farms">Farms</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainFarms.length}
          </BandMeta>
        </BandHead>
        <CompactCards data-testid="project-v1-farms-table">
          {chainFarms.length ? (
            chainFarms.slice(0, 4).map((f) => (
              <VenueCard key={f.participationId} data-testid="project-v1-farm-row">
                <VenueTitle>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{f.displayLabel}</strong>
                </VenueTitle>
                <VenueMeta>
                  <span>Pair · {f.displayLabel}</span>
                  <span>TVL · Unavailable</span>
                  <span>Volume · Unavailable</span>
                  <span>Status · Farm available</span>
                </VenueMeta>
                {f.destination?.href ? (
                  <Row style={{ marginTop: 8 }}>
                    <Btn $ghost href={f.destination.href}>
                      Stake
                    </Btn>
                  </Row>
                ) : null}
              </VenueCard>
            ))
          ) : (
            <Muted>No farms on {chainLabel}.</Muted>
          )}
        </CompactCards>
      </Band>

      <Band aria-labelledby="pp-v1-pools" data-project-section="pools" data-project-chain-id={chainId}>
        <BandHead>
          <BandTitle id="pp-v1-pools">Pools</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} /> · {chainPools.length}
          </BandMeta>
        </BandHead>
        <CompactCards data-testid="project-v1-pools-table">
          {chainPools.length ? (
            chainPools.slice(0, 4).map((p) => (
              <VenueCard key={p.participationId} data-testid="project-v1-pool-row">
                <VenueTitle>
                  <MelegaExploreChainBadge chainId={chainId} />
                  <strong>{p.displayLabel}</strong>
                </VenueTitle>
                <VenueMeta>
                  <span>Pair · {p.displayLabel}</span>
                  <span>TVL · Unavailable</span>
                  <span>Volume · Unavailable</span>
                  <span>Status · Pool available</span>
                </VenueMeta>
                {p.destination?.href ? (
                  <Row style={{ marginTop: 8 }}>
                    <Btn $ghost href={p.destination.href}>
                      Stake
                    </Btn>
                  </Row>
                ) : null}
              </VenueCard>
            ))
          ) : (
            <Muted>No pools on {chainLabel}.</Muted>
          )}
        </CompactCards>
      </Band>

      {/* SECTION 6 — Claim + Grow (compact, not dominant) */}
      <SideCards>
        <ClaimBlock data-testid="project-v1-claim-block">
          <ClaimTitle>Are you the project owner?</ClaimTitle>
          <ClaimBody>
            Claim this page. Ownership verification required. Manage logo, description, website, and social
            links.
          </ClaimBody>
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
            <Btn $ghost href={`/liquidity-studio?chain=${chainId}`} data-testid="project-v1-grow-liquidity">
              Liquidity
            </Btn>
            <Btn $ghost href={`/farms?chain=${chainId}`} data-testid="project-v1-grow-farm">
              Farm
            </Btn>
          </Row>
        </GrowStrip>
      </SideCards>

      {/* SECTION 7 — Monetization honesty (compact) */}
      <Band
        aria-labelledby="pp-v1-featured"
        data-project-section="featured-promotion"
        data-testid="project-featured-home-promotion"
        style={{
          borderColor: pp.goldLine,
          background:
            'radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242,200,76,0.10), transparent 55%), linear-gradient(165deg, rgba(22,20,12,0.98), rgba(12,12,12,0.98))',
        }}
      >
        <BandHead>
          <BandTitle id="pp-v1-featured">
            <PaidBadge $kind="featured" data-testid="placement-label-featured">
              Featured
            </PaidBadge>
          </BandTitle>
          <BandMeta>Paid · UX only</BandMeta>
        </BandHead>
        <Row style={{ marginBottom: 8, alignItems: 'baseline' }}>
          <PromoPrice style={{ fontSize: 22 }}>99 USD</PromoPrice>
          <Chip $on>7 days</Chip>
        </Row>
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
          <Muted style={{ marginBottom: 8 }} data-testid="project-v1-marco-cashback">
            5% M-Credits Cashback when paying with MARCO.
          </Muted>
        ) : null}
        <PrimaryButton type="button" data-testid="project-v1-get-featured">
          GET FEATURED
        </PrimaryButton>
      </Band>

      <Band
        aria-labelledby="pp-v1-boost"
        data-project-section="trend-boost"
        data-testid="project-trend-boost-promotion"
      >
        <BandHead>
          <BandTitle id="pp-v1-boost">
            <PaidBadge $kind="boosted" data-testid="placement-label-boosted">
              Boosted
            </PaidBadge>{' '}
            Trend Boost
          </BandTitle>
          <BandMeta>Paid · UX only</BandMeta>
        </BandHead>
        <Btn
          $ghost
          href={`/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}#trend-boost`}
          data-testid="project-v1-get-boost"
        >
          Get Trend Boost
        </Btn>
      </Band>

      {/* Hidden from normal users — markers retained for registry/tests */}
      <div hidden data-project-audience="developer" data-testid="project-v1-advanced-hidden">
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
              label="Contract"
              value={contract ? shortenAddress(contract) : 'Unavailable'}
              provenance={contract ? indexed('canonical-asset') : UNAVAILABLE}
            />
            <Metric label="Ownership" value={String(ownerLabel)} provenance={indexed('governance-registry')} />
            <Metric
              label="Router"
              value={routerAddress ? shortenRouter(routerAddress) : 'Unavailable'}
              provenance={routerAddress ? indexed('melega-chain-registry') : UNAVAILABLE}
            />
          </Grid>
        </Band>

        <Band aria-labelledby="pp-v1-transparency" data-project-section="transparency">
          <BandHead>
            <BandTitle id="pp-v1-transparency">Transparency</BandTitle>
            <BandMeta>diagnostics</BandMeta>
          </BandHead>
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
      </div>
    </Page>
  )
}

export default ProjectPageV1Shell
