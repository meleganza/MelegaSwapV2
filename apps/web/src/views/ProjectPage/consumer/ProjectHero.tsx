import React, { useCallback, useState } from 'react'
import styled from 'styled-components'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { humanEnumLabel, shortenAddress } from '../presentation/humanLabels'
import {
  ActionRow,
  BodyText,
  Card,
  MutedText,
  PrimaryButton,
  SecondaryButton,
} from './theme'
import {
  getPreferredBuyHref,
  getPrimaryAsset,
  getPrimaryChainLabel,
  getSocialResources,
} from './helpers'

const HeroCard = styled(Card)`
  gap: 16px;
  padding: 20px 16px;
`

const TopRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`

const LogoImg = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  object-fit: cover;
  border: 1px solid #2a2a2a;
  flex-shrink: 0;
`

const LogoFallback = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 18px;
  border: 1px solid #2a2a2a;
  background: #141414;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 22px;
  font-weight: 700;
  color: #8f8f8f;
  flex-shrink: 0;
`

const TitleBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
  flex: 1;
`

const HeroTitle = styled.h1`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: clamp(26px, 6vw, 34px);
  font-weight: 700;
  line-height: 1.15;
  color: #ffffff;
  word-break: break-word;
`

const SymbolTag = styled.span`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid #2a2a2a;
  font-size: 13px;
  font-weight: 600;
  color: #d4af37;
`

const VerifiedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  align-self: flex-start;
  min-height: 28px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(27, 231, 122, 0.12);
  border: 1px solid rgba(27, 231, 122, 0.35);
  font-size: 13px;
  font-weight: 600;
  color: #1be77a;
`

const MetaRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const ContractRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const Mono = styled.code`
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  color: #ffffff;
  word-break: break-all;
`

const CopyButton = styled.button`
  appearance: none;
  border: 1px solid #2a2a2a;
  background: #101010;
  color: #ffffff;
  border-radius: 10px;
  padding: 0 12px;
  min-height: 44px;
  min-width: 44px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid #d4af37;
    outline-offset: 2px;
  }
`

const SocialRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const SocialLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  min-height: 44px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
  color: #ffffff;
  font-size: 13px;
  font-weight: 600;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid #d4af37;
    outline-offset: 2px;
  }
`

interface Props {
  document: CanonicalProjectDocument
  marketsDocument: ProjectMarketsDocument
  liquidityBuildingDocument: ProjectLiquidityBuildingDocument
}

const ProjectHero: React.FC<Props> = ({ document, marketsDocument, liquidityBuildingDocument }) => {
  const [copied, setCopied] = useState(false)
  const primaryAsset = getPrimaryAsset(document)
  const chainLabel = getPrimaryChainLabel(document)
  const buyHref = getPreferredBuyHref(marketsDocument)
  const liquidityHref =
    liquidityBuildingDocument.destination?.availability === 'AVAILABLE'
      ? liquidityBuildingDocument.destination.href
      : null

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
      ? 'Project identity partially verified'
      : humanEnumLabel(rawVerification)
    : null

  const symbol =
    primaryAsset?.symbol.meta.availability === 'AVAILABLE' ? primaryAsset.symbol.value : null

  const contractAddress = primaryAsset?.contractAddress ?? null

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

  const socials = getSocialResources(document)

  return (
    <HeroCard data-testid="project-consumer-hero">
      <TopRow>
        {document.identity.logoUrl.meta.availability === 'AVAILABLE' && document.identity.logoUrl.value ? (
          <LogoImg
            src={document.identity.logoUrl.value}
            alt={`${document.identity.displayName} logo`}
            width={72}
            height={72}
          />
        ) : (
          <LogoFallback aria-hidden="true">{initials || '?'}</LogoFallback>
        )}
        <TitleBlock>
          <HeroTitle>{document.identity.displayName}</HeroTitle>
          {symbol ? <SymbolTag>{symbol}</SymbolTag> : null}
          {shortPurpose ? <BodyText>{shortPurpose}</BodyText> : null}
          <MutedText>{chainLabel}</MutedText>
          {verificationLabel ? <VerifiedBadge>{verificationLabel}</VerifiedBadge> : null}
        </TitleBlock>
      </TopRow>

      {contractAddress ? (
        <ContractRow>
          <Mono title={contractAddress}>{shortenAddress(contractAddress)}</Mono>
          <CopyButton type="button" onClick={onCopy} aria-label={`Copy contract address ${contractAddress}`}>
            {copied ? 'Copied' : 'Copy'}
          </CopyButton>
        </ContractRow>
      ) : (
        <MutedText>Contract address unavailable in registry.</MutedText>
      )}

      {socials.length > 0 ? (
        <SocialRow aria-label="Official social links">
          {socials.map((resource) => (
            <SocialLink
              key={resource.url}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${resource.label} (opens in a new tab)`}
            >
              {resource.label}
            </SocialLink>
          ))}
        </SocialRow>
      ) : null}

      <ActionRow>
        <PrimaryButton href={buyHref ?? '#swap'} aria-label={`Buy or swap ${document.identity.displayName}`}>
          Buy / Swap
        </PrimaryButton>
        <SecondaryButton href="#chart" aria-label="View price chart">
          Chart
        </SecondaryButton>
        {liquidityHref ? (
          <SecondaryButton href={liquidityHref} aria-label="Add liquidity">
            Add Liquidity
          </SecondaryButton>
        ) : null}
        <SecondaryButton href="#earn" aria-label="View earn opportunities">
          Earn
        </SecondaryButton>
      </ActionRow>
    </HeroCard>
  )
}

export default ProjectHero
