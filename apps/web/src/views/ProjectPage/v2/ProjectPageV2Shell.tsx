/**
 * Project Page V2 — discovery + conversion surface (mini website per token).
 * Reuses TradingEmbed / Charts / live market — does not modify Smart Swap logic.
 */
import React, { useMemo, useState } from 'react'
import styled from 'styled-components'
import { MelegaTokenAvatar } from 'design-system/melega/components/MelegaTokenAvatar/MelegaTokenAvatar'
import { MelegaExploreChainBadge } from 'components/Logo/MelegaExploreChainBadge'
import AddToWalletButton, { AddToWalletTextOptions } from 'components/AddToWallet/AddToWalletButton'
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
import { getFeaturedPackage } from 'lib/monetization/packages'
import { humanEnumLabel } from '../presentation/humanLabels'
import {
  Band,
  BandHead,
  BandMeta,
  BandTitle,
  Btn,
  Chip,
  Page,
  Row,
  pp,
} from '../v1/theme'
import { Metric, indexed, UNAVAILABLE } from '../v1/Metric'
import {
  buildProjectChainDeployments,
  defaultSelectedChainId,
  filterParticipationByChain,
  getBuyTokenHref,
  getPrimaryAssetForChain,
  getSocialResources,
} from '../v1/helpers'
import { useProjectLiveMarket } from '../v1/useProjectLiveMarket'
import ProjectTradingEmbed from '../v1/ProjectTradingEmbed'
import ProjectCharts from '../v1/ProjectCharts'

const Hero = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 12px;
  min-width: 0;

  @media (min-width: 960px) {
    grid-template-columns: minmax(0, 1.05fr) minmax(300px, 0.95fr);
    align-items: start;
    gap: 14px;
  }
`

const LogoWrap = styled.div`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid ${pp.line};
  background: #111;
`

const HeroName = styled.h1`
  margin: 0;
  font-size: clamp(20px, 3.6vw, 28px);
  font-weight: 850;
  letter-spacing: -0.03em;
  line-height: 1.1;
  color: #fff;
`

const Ticker = styled.span`
  font-size: 14px;
  font-weight: 750;
  color: ${pp.gold};
`

const Desc = styled.p`
  margin: 8px 0 0;
  font-size: 13px;
  line-height: 1.4;
  color: rgba(255, 255, 255, 0.72);
  max-width: 40rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ActionBar = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`

const MarketStrip = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }
`

const EconomyGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 768px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`

const EconomyCard = styled.div`
  padding: 12px;
  border-radius: 12px;
  border: 1px solid ${pp.line};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const EconomyTitle = styled.div`
  font-size: 13px;
  font-weight: 800;
  color: ${pp.gold};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const EconomyMeta = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  font-size: 12px;
  color: ${pp.mute};
`

const GrowGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
`

const GrowCard = styled.a`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.28);
  background: rgba(244, 196, 48, 0.06);
  text-decoration: none;
  color: inherit;
  min-width: 0;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: rgba(244, 196, 48, 0.55);
    transform: translateY(-2px);
  }
`

const GrowTitle = styled.div`
  font-size: 14px;
  font-weight: 800;
  color: #fff;
`

const GrowPrice = styled.div`
  font-size: 18px;
  font-weight: 850;
  color: ${pp.gold};
`

const GrowHint = styled.div`
  font-size: 12px;
  color: ${pp.mute};
`

const ClaimCard = styled.div`
  padding: 14px 16px;
  border-radius: 14px;
  border: 1px solid rgba(244, 196, 48, 0.22);
  background:
    radial-gradient(ellipse 70% 60% at 0% 0%, rgba(244, 196, 48, 0.08), transparent 55%),
    rgba(255, 255, 255, 0.02);
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 36rem;
`

const ClaimTitle = styled.div`
  font-size: 15px;
  font-weight: 800;
  color: #fff;
`

const ClaimBody = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: ${pp.mute};
`

const ClaimList = styled.ul`
  margin: 0;
  padding: 0 0 0 1.1rem;
  font-size: 12px;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.68);
`

const RightCol = styled.div`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

function socialLabel(url: string, label: string): string {
  if (/twitter|x\.com/i.test(url) || /\bx\b/i.test(label)) return 'X'
  if (/t\.me|telegram/i.test(url) || /telegram/i.test(label)) return 'Telegram'
  return label
}

export type ProjectPageV2Props = {
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

export const ProjectPageV2Shell: React.FC<ProjectPageV2Props> = ({
  document,
  marketsDocument,
  participationDocument,
}) => {
  const deployments = useMemo(() => buildProjectChainDeployments(document), [document])
  const [selectedChainId, setSelectedChainId] = useState(() => defaultSelectedChainId(deployments))
  const selected =
    deployments.find((d) => d.chainId === selectedChainId) ??
    deployments.find((d) => d.status === 'LIVE') ??
    deployments[0]
  const primary = selected ? getPrimaryAssetForChain(document, selected.chainId) : null
  const symbol = primary?.symbol?.value ?? null
  const chainId = selected?.chainId ?? 56
  const contract = selected?.contractAddress ?? null
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
  const xLink = socials.find((s) => /twitter|x\.com/i.test(s.url) || /\bx\b/i.test(s.label))
  const tgLink = socials.find((s) => /t\.me|telegram/i.test(s.url) || /telegram/i.test(s.label))
  const buyHref = getBuyTokenHref({ chainId, contract })
  const market = useProjectLiveMarket(document.slug, marketsDocument.markets.length, contract, chainId)
  const featuredPkg = getFeaturedPackage('featured_1w')
  const claimHref = `/list?intent=claim-project&slug=${encodeURIComponent(document.slug)}`

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

  const description =
    document.identity.description?.meta?.availability === 'AVAILABLE'
      ? document.identity.description.value
      : document.identity.shortPurpose?.meta?.availability === 'AVAILABLE'
        ? document.identity.shortPurpose.value
        : 'Unavailable'

  const priceValue = market.priceUsd !== 'Unavailable' ? market.priceUsd : market.priceBnb
  const poolsCount = chainLiquidity.length > 0 ? String(chainLiquidity.length) : 'Unavailable'
  const farmsCount = chainFarms.length > 0 ? String(chainFarms.length) : 'Unavailable'
  const stakePoolsCount = chainPools.length > 0 ? String(chainPools.length) : 'Unavailable'

  return (
    <Page id="project-page-v2" data-testid="project-page-v2" data-project-page="v2" data-project-slug={document.slug}>
      {/* HERO — PROJECT INFO | SWAP + COMPACT CHART */}
      <Band data-testid="project-v2-hero" data-project-section="hero">
        <Hero>
          <div>
            <Row style={{ gap: 12, alignItems: 'center' }}>
              <LogoWrap>
                <MelegaTokenAvatar
                  symbol={symbol ?? document.identity.displayName}
                  name={document.identity.displayName}
                  address={contract ?? undefined}
                  chainId={chainId}
                  logoURI={logoUrl}
                  size={52}
                />
              </LogoWrap>
              <div style={{ minWidth: 0 }}>
                <HeroName>{document.identity.displayName}</HeroName>
                <Row style={{ gap: 8, marginTop: 4, alignItems: 'center', flexWrap: 'wrap' }}>
                  {symbol ? <Ticker>${symbol}</Ticker> : null}
                  <MelegaExploreChainBadge chainId={chainId} />
                  <Chip $on={/verif/i.test(verified)}>{verified}</Chip>
                  {deployments.length > 1
                    ? deployments.slice(0, 4).map((d) => (
                        <Chip
                          key={d.chainId}
                          $on={d.chainId === chainId}
                          role="button"
                          tabIndex={0}
                          onClick={() => setSelectedChainId(d.chainId)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') setSelectedChainId(d.chainId)
                          }}
                          style={{ cursor: 'pointer' }}
                        >
                          {d.shortLabel}
                        </Chip>
                      ))
                    : null}
                </Row>
              </div>
            </Row>
            <Desc>{description}</Desc>
            <Row style={{ marginTop: 8, gap: 8, flexWrap: 'wrap' }}>
              {website?.url ? (
                <Btn $ghost href={website.url} target="_blank" rel="noreferrer" data-testid="project-v2-website">
                  Website
                </Btn>
              ) : null}
              {xLink?.url ? (
                <Btn $ghost href={xLink.url} target="_blank" rel="noreferrer" data-testid="project-v2-social-x">
                  X
                </Btn>
              ) : null}
              {tgLink?.url ? (
                <Btn $ghost href={tgLink.url} target="_blank" rel="noreferrer" data-testid="project-v2-social-telegram">
                  Telegram
                </Btn>
              ) : null}
              {!xLink && !tgLink
                ? socials.slice(0, 2).map((s) => (
                    <Btn key={s.url} $ghost href={s.url} target="_blank" rel="noreferrer" data-testid="project-v2-social">
                      {socialLabel(s.url, s.label)}
                    </Btn>
                  ))
                : null}
            </Row>
            <ActionBar>
              <Btn $primary href={buyHref} data-testid="project-v2-buy">
                Buy Token
              </Btn>
              {contract ? (
                <AddToWalletButton
                  tokenAddress={contract}
                  tokenSymbol={symbol ?? document.identity.displayName}
                  tokenDecimals={tokenDecimals}
                  tokenLogoURL={logoUrl}
                  textOptions={AddToWalletTextOptions.TEXT}
                />
              ) : null}
              <Btn $ghost href={claimHref} data-testid="project-v2-claim-hero">
                Claim Project
              </Btn>
            </ActionBar>
          </div>

          <RightCol data-testid="project-v2-trade-col">
            <ProjectTradingEmbed
              slug={document.slug}
              marketsDocument={marketsDocument}
              projectChainId={chainId}
              contractAddress={contract}
              variant="hero"
            />
            <div data-testid="project-v2-chart">
              <ProjectCharts
                slug={document.slug}
                marketsDocument={marketsDocument}
                variant="compact"
                pairAddress={market.pairAddress}
              />
            </div>
          </RightCol>
        </Hero>
      </Band>

      {/* MARKET STRIP */}
      <Band data-testid="project-v2-market" data-project-section="market">
        <BandHead>
          <BandTitle>Market</BandTitle>
          <BandMeta>{market.lastUpdate ? `Updated ${market.lastUpdate}` : 'Live when indexed'}</BandMeta>
        </BandHead>
        <MarketStrip>
          <Metric
            label="Price"
            value={priceValue}
            provenance={
              priceValue !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE
            }
          />
          <Metric
            label="24H"
            value={market.trend}
            provenance={market.trend !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE}
          />
          <Metric
            label="Volume"
            value={market.volume24h}
            provenance={
              market.volume24h !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE
            }
          />
          <Metric
            label="Liquidity"
            value={market.liquidity}
            provenance={
              market.liquidity !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE
            }
          />
          <Metric
            label="Market Cap"
            value={market.marketCap}
            provenance={
              market.marketCap !== 'Unavailable' ? indexed(market.source, market.lastUpdate) : UNAVAILABLE
            }
          />
          <Metric
            label="Holders"
            value={market.holders}
            provenance={market.holders !== 'Unavailable' ? indexed('holder-count', market.lastUpdate) : UNAVAILABLE}
          />
        </MarketStrip>
      </Band>

      {/* PROJECT ECONOMY */}
      <Band data-testid="project-v2-economy" data-project-section="economy">
        <BandHead>
          <BandTitle>Project Economy</BandTitle>
          <BandMeta>
            <MelegaExploreChainBadge chainId={chainId} />
          </BandMeta>
        </BandHead>
        <EconomyGrid>
          <EconomyCard data-testid="project-v2-economy-liquidity">
            <EconomyTitle>Liquidity</EconomyTitle>
            <EconomyMeta>
              <span>TVL · {market.liquidity}</span>
              <span>Volume · {market.volume24h}</span>
              <span>Pools · {poolsCount}</span>
            </EconomyMeta>
            <Btn href={`/liquidity-studio?view=add&chain=${chainId}`} data-testid="project-v2-add-liquidity">
              Add Liquidity
            </Btn>
          </EconomyCard>
          <EconomyCard data-testid="project-v2-economy-farm">
            <EconomyTitle>Farm</EconomyTitle>
            <EconomyMeta>
              <span>APR · Unavailable</span>
              <span>TVL · Unavailable</span>
              <span>Rewards · Unavailable</span>
              {farmsCount !== 'Unavailable' ? <span>Farms · {farmsCount}</span> : null}
            </EconomyMeta>
            <Btn href={`/farms?create=1&chain=${chainId}`} data-testid="project-v2-farm">
              Create Farm
            </Btn>
          </EconomyCard>
          <EconomyCard data-testid="project-v2-economy-pool">
            <EconomyTitle>Pool</EconomyTitle>
            <EconomyMeta>
              <span>TVL · Unavailable</span>
              <span>Rewards · Unavailable</span>
              <span>APR · Unavailable</span>
              {stakePoolsCount !== 'Unavailable' ? <span>Pools · {stakePoolsCount}</span> : null}
            </EconomyMeta>
            <Btn href={`/pools?chain=${chainId}`} data-testid="project-v2-stake">
              Stake
            </Btn>
          </EconomyCard>
        </EconomyGrid>
      </Band>

      {/* GROW YOUR PROJECT */}
      <Band
        data-testid="project-v2-grow"
        data-project-section="grow"
        style={{
          borderColor: pp.goldLine,
          background:
            'radial-gradient(ellipse 80% 60% at 8% 0%, rgba(242,200,76,0.10), transparent 55%), linear-gradient(165deg, rgba(22,20,12,0.98), rgba(12,12,12,0.98))',
        }}
      >
        <BandHead>
          <BandTitle>Grow Your Project</BandTitle>
          <BandMeta>Revenue surface</BandMeta>
        </BandHead>
        <GrowGrid>
          <GrowCard href={`${claimHref}#featured`} data-testid="project-v2-grow-featured">
            <GrowTitle>Featured</GrowTitle>
            <GrowPrice>
              {featuredPkg.usdPrice} USD / {featuredPkg.durationLabel}
            </GrowPrice>
            <GrowHint>Checkout · Home Featured placement</GrowHint>
          </GrowCard>
          <GrowCard href={`${claimHref}#trend-boost`} data-testid="project-v2-grow-trend">
            <GrowTitle>Trend Boost</GrowTitle>
            <GrowPrice>Boost visibility</GrowPrice>
            <GrowHint>Checkout · Trending surface</GrowHint>
          </GrowCard>
          <GrowCard
            href={`/liquidity-studio?view=add&chain=${chainId}`}
            data-testid="project-v2-grow-liquidity"
          >
            <GrowTitle>Liquidity</GrowTitle>
            <GrowPrice>Create LP</GrowPrice>
            <GrowHint>Liquidity Studio · add liquidity</GrowHint>
          </GrowCard>
          <GrowCard href={`/farms?create=1&chain=${chainId}`} data-testid="project-v2-grow-farm">
            <GrowTitle>Farm</GrowTitle>
            <GrowPrice>Create Farm</GrowPrice>
            <GrowHint>Farms Studio · create flow</GrowHint>
          </GrowCard>
        </GrowGrid>
      </Band>

      {/* CLAIM */}
      <Band data-testid="project-v2-claim" data-project-section="claim">
        <ClaimCard>
          <ClaimTitle>Claim Project</ClaimTitle>
          <ClaimBody>
            Claim ownership of this page, verify the controlling wallet, then manage your public identity.
          </ClaimBody>
          <ClaimList>
            <li>Logo</li>
            <li>Socials</li>
            <li>Description</li>
            <li>Official links</li>
          </ClaimList>
          <Btn href={claimHref} data-testid="project-v2-claim-cta">
            Claim Project
          </Btn>
        </ClaimCard>
      </Band>
    </Page>
  )
}

export default ProjectPageV2Shell
