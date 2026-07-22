import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { humanEnumLabel, shortenAddress } from '../presentation/humanLabels'
import {
  ActionRow,
  MetricCell,
  MetricGrid,
  MetricLabel,
  MetricValue,
  MutedText,
  PrimaryButton,
  SecondaryButton,
  SoftCard,
} from './theme'
import {
  getBuyCtaLabel,
  getPrimaryAsset,
  getPrimaryChainLabel,
  getSocialResources,
} from './helpers'

const HeroCard = styled(SoftCard)`
  gap: 24px;
  padding: 28px 20px 32px;
  border: none;
  background: transparent;
  box-shadow: none;
`

const TopBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 18px;
`

const LogoImg = styled.img`
  width: 92px;
  height: 92px;
  border-radius: 22px;
  object-fit: cover;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);

  @media (min-width: 480px) {
    width: 96px;
    height: 96px;
  }
`

const LogoFallback = styled.div`
  width: 92px;
  height: 92px;
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, #1a1a1a 0%, #101010 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 700;
  color: #8f8f8f;
  flex-shrink: 0;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.35);

  @media (min-width: 480px) {
    width: 96px;
    height: 96px;
  }
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  min-width: 0;
  width: 100%;
`

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: clamp(28px, 7vw, 36px);
  font-weight: 700;
  line-height: 1.12;
  color: #ffffff;
  word-break: break-word;
`

const SymbolTag = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  font-size: 13px;
  font-weight: 600;
  color: #F4C430;
  letter-spacing: 0.02em;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  align-items: center;
`

const ChainBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  font-weight: 600;
  color: #c8c8c8;
`

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(27, 231, 122, 0.12);
  border: 1px solid rgba(27, 231, 122, 0.35);
  font-size: 13px;
  font-weight: 600;
  color: #1be77a;
`

const MissionLine = styled.p`
  margin: 0;
  font-size: 17px;
  line-height: 1.55;
  color: #c8c8c8;
  max-width: 36ch;
`

const PriceBlock = styled(SoftCard)`
  padding: 16px;
  gap: 0;
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  justify-content: center;
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  color: #8f8f8f;
  word-break: break-all;
`

const CopyButton = styled.button`
  appearance: none;
  border: none;
  background: transparent;
  color: #8f8f8f;
  border-radius: 8px;
  padding: 0 8px;
  min-height: 32px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid #F4C430;
    outline-offset: 2px;
  }
`

const QuietLink = styled.a`
  color: #8f8f8f;
  font-size: 12px;
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 2px;
  min-height: 32px;
  display: inline-flex;
  align-items: center;
  padding: 0 8px;

  &:focus-visible {
    outline: 2px solid #F4C430;
    outline-offset: 2px;
  }
`

interface Props {
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
}

const ProjectHero: React.FC<Props> = ({ document, marketsDocument }) => {
  const [copied, setCopied] = useState(false)
  const primaryAsset = getPrimaryAsset(document)
  const chainLabel = getPrimaryChainLabel(document)

  const initials = document.identity.displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')

  const shortPurpose =
    document.identity.shortPurpose.meta.availability === 'AVAILABLE'
      ? document.identity.shortPurpose.value
      : null

  const rawVerification =
    document.identity.verificationState.meta.availability === 'AVAILABLE'
      ? document.identity.verificationState.value
      : null
  const verificationLabel = rawVerification
    ? /observed|canonical/i.test(rawVerification)
      ? 'Verified project'
      : humanEnumLabel(rawVerification)
    : null

  const symbol =
    primaryAsset?.symbol.meta.availability === 'AVAILABLE' ? primaryAsset.symbol.value : null

  const contractAddress = primaryAsset?.contractAddress ?? null
  const buyLabel = getBuyCtaLabel(document.slug, symbol)
  const website = getSocialResources(document).find(
    (r) => r.resourceType === 'website' && Boolean(r.href),
  )

  const onCopy = useCallback(async () => {
    if (!contractAddress) return
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [contractAddress])

  const hasActiveMarkets = marketsDocument.summary.activeMarketCount > 0

  return (
    <HeroCard data-testid="project-consumer-hero">
      <TopBlock>
        {document.identity.logoUrl.meta.availability === 'AVAILABLE' && document.identity.logoUrl.value ? (
          <LogoImg
            src={document.identity.logoUrl.value}
            alt={`${document.identity.displayName} logo`}
            width={92}
            height={92}
          />
        ) : (
          <LogoFallback aria-hidden="true">{initials || '?'}</LogoFallback>
        )}

        <TitleBlock>
          <HeroTitle>{document.identity.displayName}</HeroTitle>
          {symbol ? <SymbolTag>{symbol}</SymbolTag> : null}
          {shortPurpose ? <MissionLine>{shortPurpose}</MissionLine> : null}
          <BadgeRow>
            <ChainBadge>{chainLabel}</ChainBadge>
            {verificationLabel ? <VerifiedBadge>{verificationLabel}</VerifiedBadge> : null}
          </BadgeRow>
        </TitleBlock>
      </TopBlock>

      <PriceBlock aria-label="Market price summary">
        <MetricGrid style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
          <MetricCell>
            <MetricLabel>Price</MetricLabel>
            <MetricValue>—</MetricValue>
          </MetricCell>
          <MetricCell>
            <MetricLabel>24h</MetricLabel>
            <MetricValue>—</MetricValue>
          </MetricCell>
          <MetricCell>
            <MetricLabel>Markets</MetricLabel>
            <MetricValue>
              {hasActiveMarkets
                ? String(marketsDocument.summary.activeMarketCount)
                : 'Not available yet'}
            </MetricValue>
          </MetricCell>
        </MetricGrid>
      </PriceBlock>

      {contractAddress || website ? (
        <ContractRow>
          {contractAddress ? (
            <>
              <Mono title={contractAddress}>{shortenAddress(contractAddress)}</Mono>
              <CopyButton type="button" onClick={onCopy} aria-label={`Copy contract address ${contractAddress}`}>
                {copied ? 'Copied' : 'Copy contract'}
              </CopyButton>
            </>
          ) : null}
          {website?.href ? (
            <QuietLink
              href={website.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Website (opens in a new tab)"
            >
              Website
            </QuietLink>
          ) : null}
        </ContractRow>
      ) : null}

      <ActionRow style={{ justifyContent: 'center' }}>
        <PrimaryButton href="#buy" aria-label={buyLabel}>
          {buyLabel}
        </PrimaryButton>
        <SecondaryButton href="#chart" aria-label="View price chart">
          Chart
        </SecondaryButton>
      </ActionRow>
    </HeroCard>
  )
}

export default ProjectHero
