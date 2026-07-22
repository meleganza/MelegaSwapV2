import React, { useCallback, useMemo, useState } from 'react'
import styled from 'styled-components'
import type { CanonicalProjectDocument } from 'registry/projects/identity/types'
import { PREMIUM_FONT_DISPLAY } from 'design-system/melega/tokens/premiumStudio'
import { humanEnumLabel, shortenAddress } from '../presentation/humanLabels'
import {
  getPrimaryAsset,
  getPrimaryChainLabel,
  getProjectTypeLabel,
  getSocialResources,
  getWebsiteResource,
  isTokenProjectTemplate,
} from './helpers'
import {
  IconCheck,
  IconCopy,
  IconExternal,
  IconMore,
  socialIconFor,
} from './ProjectWebsiteIcons'

const Root = styled.section`
  display: grid;
  gap: 16px;
  min-height: 0;

  @media (min-width: 1024px) {
    grid-template-columns: minmax(0, 1fr) 208px;
    column-gap: 28px;
    align-items: start;
    min-height: 170px;
  }
`

const Identity = styled.div`
  display: grid;
  gap: 14px;
  justify-items: center;
  text-align: center;
  min-width: 0;

  @media (min-width: 768px) {
    grid-template-columns: 164px minmax(0, 1fr);
    column-gap: 22px;
    justify-items: start;
    text-align: left;
    align-items: start;
  }
`

const LogoFrame = styled.div`
  position: relative;
  width: 110px;
  height: 110px;
  border-radius: 28px;
  display: grid;
  place-items: center;
  background: #080808;
  border: 1px solid rgba(221, 185, 47, 0.22);

  @media (min-width: 768px) {
    width: 164px;
    height: 164px;
    border-radius: 36px;
  }

  &::before {
    content: '';
    position: absolute;
    inset: -18px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(221, 185, 47, 0.12) 0%, transparent 68%);
    filter: blur(22px);
    pointer-events: none;
    z-index: 0;
  }
`

const LogoImg = styled.img`
  position: relative;
  z-index: 1;
  width: 78px;
  height: 78px;
  border-radius: 999px;
  object-fit: cover;

  @media (min-width: 768px) {
    width: 104px;
    height: 104px;
  }
`

const LogoFallback = styled.div`
  position: relative;
  z-index: 1;
  width: 78px;
  height: 78px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  background: #151515;
  color: #ddb92f;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 28px;
  font-weight: 700;

  @media (min-width: 768px) {
    width: 104px;
    height: 104px;
    font-size: 36px;
  }
`

const Details = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
  width: 100%;
`

const TitleRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`

const Title = styled.h1`
  margin: 0;
  font-family: ${PREMIUM_FONT_DISPLAY};
  font-size: 34px;
  font-weight: 700;
  line-height: 1.02;
  letter-spacing: -0.035em;
  color: #ffffff;

  @media (min-width: 1024px) {
    font-size: 52px;
  }
`

const Ticker = styled.span`
  display: inline-flex;
  align-items: center;
  height: 27px;
  padding: 0 11px;
  border-radius: 9px;
  background: rgba(221, 185, 47, 0.1);
  border: 1px solid rgba(221, 185, 47, 0.35);
  color: #ddb92f;
  font-size: 12px;
  font-weight: 600;
`

const Mission = styled.p`
  margin: 0;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.65);
  max-width: 52ch;
`

const BadgeRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }
`

const Badge = styled.span<{ $tone?: 'green' | 'gold' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  height: 29px;
  padding: 0 10px;
  border-radius: 9px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ $tone }) =>
    $tone === 'green'
      ? 'rgba(17, 217, 120, 0.1)'
      : $tone === 'gold'
        ? 'rgba(221, 185, 47, 0.1)'
        : 'rgba(255, 255, 255, 0.05)'};
  color: ${({ $tone }) =>
    $tone === 'green' ? '#11d978' : $tone === 'gold' ? '#ddb92f' : 'rgba(255, 255, 255, 0.72)'};
  border: 1px solid
    ${({ $tone }) =>
      $tone === 'green'
        ? 'rgba(17, 217, 120, 0.28)'
        : $tone === 'gold'
          ? 'rgba(221, 185, 47, 0.28)'
          : 'rgba(255, 255, 255, 0.08)'};
`

const ContractBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 29px;
  max-width: 190px;
  padding: 0 10px;
  border-radius: 9px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    border-color: rgba(221, 185, 47, 0.38);
    color: #ddb92f;
  }
`

const Actions = styled.div`
  display: grid;
  gap: 8px;
  margin-top: 2px;

  @media (min-width: 640px) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
  }
`

const PrimaryCta = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 48px;
  padding: 0 18px;
  border-radius: 10px;
  background: #ddb92f;
  color: #111111;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  border: 1px solid #ddb92f;
  transition:
    background 140ms ease,
    transform 140ms ease;

  &:hover {
    background: #ebcb4e;
    transform: translateY(-1px);
  }

  @media (min-width: 640px) {
    width: 148px;
    height: 42px;
  }
`

const SecondaryCta = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 42px;
  padding: 0 16px;
  border-radius: 10px;
  background: transparent;
  color: #f7f7f7;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.12);

  &:hover {
    border-color: rgba(221, 185, 47, 0.45);
    color: #ddb92f;
  }

  @media (min-width: 640px) {
    width: 126px;
  }
`

const GhostCta = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  height: 42px;
  padding: 0 14px;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid rgba(255, 255, 255, 0.08);

  &:hover {
    color: #ddb92f;
    border-color: rgba(221, 185, 47, 0.38);
  }

  @media (min-width: 640px) {
    width: 126px;
  }
`

const MoreBtn = styled.button`
  width: 42px;
  height: 42px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  display: none;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  @media (min-width: 640px) {
    display: inline-flex;
  }

  &:hover {
    border-color: rgba(221, 185, 47, 0.4);
    color: #ddb92f;
  }
`

const Community = styled.aside`
  display: none;

  @media (min-width: 1024px) {
    display: grid;
    gap: 10px;
    justify-items: end;
    width: 208px;
  }
`

const CommunityTitle = styled.div`
  font-size: 13px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.65);
`

const SocialGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 48px);
  gap: 10px;
`

const SocialMobile = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;

  @media (min-width: 768px) {
    justify-content: flex-start;
  }

  @media (min-width: 1024px) {
    display: none;
  }
`

const SocialBtn = styled.a`
  width: 48px;
  height: 48px;
  border-radius: 11px;
  display: grid;
  place-items: center;
  background: #151515;
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;

  &:hover {
    border-color: rgba(221, 185, 47, 0.38);
    color: #ddb92f;
  }
`

const Breadcrumb = styled.nav`
  display: flex;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.42);
  justify-content: center;
  margin-bottom: 10px;

  @media (min-width: 1024px) {
    display: none;
  }

  a {
    color: rgba(255, 255, 255, 0.55);
    text-decoration: none;
  }
`

interface Props {
  document: CanonicalProjectDocument
}

const ProjectWebsiteHero: React.FC<Props> = ({ document }) => {
  const [copied, setCopied] = useState(false)
  const tokenMode = isTokenProjectTemplate(document)
  const primary = getPrimaryAsset(document)
  const website = getWebsiteResource(document)
  const typeLabel = getProjectTypeLabel(document)
  const chainLabel = getPrimaryChainLabel(document)

  const symbol =
    primary?.symbol.meta.availability === 'AVAILABLE' ? primary.symbol.value : null
  const contract = primary?.contractAddress ?? null

  const rawVerification =
    document.identity.verificationState.meta.availability === 'AVAILABLE'
      ? document.identity.verificationState.value
      : null
  const verified =
    !!rawVerification && /observed|canonical|verified/i.test(String(rawVerification))
  const verificationLabel = rawVerification
    ? /observed|canonical|verified/i.test(String(rawVerification))
      ? 'Verified Project'
      : humanEnumLabel(String(rawVerification))
    : null

  const mission =
    document.identity.shortPurpose.meta.availability === 'AVAILABLE'
      ? document.identity.shortPurpose.value
      : tokenMode
        ? `${symbol ?? document.identity.displayName} project on Melega DEX.`
        : 'Trade, earn, and build on BNB Smart Chain.'

  const socials = useMemo(
    () =>
      getSocialResources(document)
        .filter((r) => Boolean(r.url) && (r.resourceType === 'social' || r.resourceType === 'github'))
        .slice(0, 6),
    [document],
  )

  const copy = useCallback(async () => {
    if (!contract) return
    try {
      await navigator.clipboard.writeText(contract)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      /* ignore */
    }
  }, [contract])

  const buyHref = tokenMode ? '#buy' : '/trade'
  const chartHref = tokenMode ? '#chart' : '/radar'
  const buyLabel = tokenMode ? `Buy ${symbol ?? document.identity.displayName}` : 'Open Trade'
  const chartLabel = tokenMode ? 'View Chart' : 'Explore Markets'

  return (
    <div data-testid="project-website-hero" data-token-mode={tokenMode ? 'true' : 'false'}>
      <Breadcrumb aria-label="Breadcrumb">
        <a href="/projects">Projects</a>
        <span>/</span>
        <span>{document.identity.displayName}</span>
      </Breadcrumb>

      <Root>
        <Identity>
          <LogoFrame>
            {document.identity.logoUrl.meta.availability === 'AVAILABLE' &&
            document.identity.logoUrl.value ? (
              <LogoImg src={document.identity.logoUrl.value} alt="" width={104} height={104} />
            ) : (
              <LogoFallback aria-hidden>
                {document.identity.displayName.slice(0, 1).toUpperCase()}
              </LogoFallback>
            )}
          </LogoFrame>

          <Details>
            <TitleRow>
              <Title>{document.identity.displayName}</Title>
              {tokenMode && symbol ? <Ticker>{symbol}</Ticker> : null}
            </TitleRow>

            <Mission>{mission}</Mission>

            <BadgeRow>
              <Badge $tone="neutral">{chainLabel}</Badge>
              {verified && verificationLabel ? (
                <Badge $tone="green">{verificationLabel}</Badge>
              ) : typeLabel ? (
                <Badge $tone="neutral">{typeLabel}</Badge>
              ) : null}
              {!tokenMode ? <Badge $tone="gold">Protocol</Badge> : null}
              {contract ? (
                <ContractBtn type="button" onClick={copy} aria-label="Copy contract address">
                  {shortenAddress(contract)}
                  {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                </ContractBtn>
              ) : null}
            </BadgeRow>

            <SocialMobile>
              {socials.map((s) => (
                <SocialBtn
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {socialIconFor(s.label, s.resourceType)}
                </SocialBtn>
              ))}
            </SocialMobile>

            <Actions>
              <PrimaryCta href={buyHref} data-testid="project-hero-buy">
                {buyLabel}
              </PrimaryCta>
              <SecondaryCta href={chartHref} data-testid="project-hero-chart">
                {chartLabel}
              </SecondaryCta>
              {website?.url ? (
                <GhostCta href={website.url} target="_blank" rel="noopener noreferrer">
                  Website <IconExternal size={14} />
                </GhostCta>
              ) : null}
              <MoreBtn type="button" aria-label="More actions" data-testid="project-hero-more">
                <IconMore size={18} />
              </MoreBtn>
            </Actions>
          </Details>
        </Identity>

        <Community aria-label="Join the Community">
          <CommunityTitle>Join the Community</CommunityTitle>
          {socials.length > 0 ? (
            <SocialGrid>
              {socials.map((s) => (
                <SocialBtn
                  key={s.url}
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                >
                  {socialIconFor(s.label, s.resourceType)}
                </SocialBtn>
              ))}
            </SocialGrid>
          ) : null}
        </Community>
      </Root>
    </div>
  )
}

export default ProjectWebsiteHero
