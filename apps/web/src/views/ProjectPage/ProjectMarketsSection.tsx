import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectMarketsDocument } from 'registry/projects/identity/markets'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 12px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const Item = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  word-break: break-word;
`

const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 4px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;
  word-break: break-word;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const Details = styled.details`
  border: 1px solid ${({ theme }) => theme.colors.cardBorder};
  border-radius: 8px;
  padding: 8px 12px;

  &[open] > summary {
    margin-bottom: 8px;
  }
`

const Summary = styled.summary`
  cursor: pointer;
  font-size: 14px;
  min-height: 44px;
  display: flex;
  align-items: center;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

const StatusText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

interface Props {
  markets: ProjectMarketsDocument
}

const ProjectMarketsSection: React.FC<Props> = ({ markets }) => {
  const preferred = markets.preferredMarkets[0] ?? null
  const preferredBuy =
    preferred &&
    markets.swapDestinations.find(
      (d) => d.marketId === preferred.marketId && d.status === 'READY' && d.label.includes('buy'),
    )
  const additional = markets.markets.filter((m) => m.marketId !== preferred?.marketId)
  const hasReady = markets.swapDestinations.some((d) => d.status === 'READY')

  return (
    <Stack
      as="section"
      id="participate"
      aria-labelledby="participate-heading"
      data-testid="project-markets-section"
      data-pp005="true"
    >
      <Heading as="h2" id="participate-heading" scale="md">
        Participate
      </Heading>
      <Heading as="h3" id="markets-heading" scale="md" style={{ fontSize: 18 }}>
        Markets
      </Heading>

      <Fact data-testid="markets-availability-summary">
        {markets.summary.activeMarketCount > 0
          ? `${markets.summary.activeMarketCount} active Melega DEX market${
              markets.summary.activeMarketCount === 1 ? '' : 's'
            } registered`
          : 'No active Melega DEX market is currently registered for this project'}
        {markets.summary.supportedMarketChains.length
          ? ` · Chains: ${markets.summary.supportedMarketChains.join(', ')}`
          : ''}
        {markets.summary.lastObservationAt
          ? ` · Registry observation: ${markets.summary.lastObservationAt}`
          : ''}
      </Fact>

      {preferred && preferredBuy ? (
        <Stack data-testid="preferred-market" style={{ gap: 8 }}>
          <Text fontSize="14px">
            Preferred market: {preferred.displayLabel} on chain {preferred.chainId} ({preferred.venue})
          </Text>
          <StatusText>
            Status: {preferred.status} · Availability: {preferred.availability} · Source:{' '}
            {preferred.source}
          </StatusText>
          <Fact>
            Pair contract: <code>{preferred.pairOrPoolContractId}</code>
          </Fact>
          <CtaLink
            href={preferredBuy.href}
            data-testid="preferred-market-cta"
            aria-label={`Open Swap for ${preferred.displayLabel} on Melega DEX`}
          >
            Open Swap
          </CtaLink>
        </Stack>
      ) : null}

      {!preferred && hasReady ? (
        <Stack style={{ gap: 8 }}>
          <Fact>Trade this project through existing Melega DEX markets.</Fact>
          {markets.swapDestinations
            .filter((d) => d.status === 'READY')
            .slice(0, 1)
            .map((d) => (
              <CtaLink
                key={d.destinationId}
                href={d.href}
                data-testid="asset-tradable-cta"
                aria-label={d.label}
              >
                Trade on Melega DEX
              </CtaLink>
            ))}
        </Stack>
      ) : null}

      {!hasReady && markets.markets.length === 0 ? (
        <Fact data-testid="markets-empty">
          No Melega DEX market is currently registered for this project.
        </Fact>
      ) : null}

      {additional.length > 0 ? (
        <Details>
          <Summary>Additional markets</Summary>
          <List aria-label="Additional project markets">
            {additional.map((m) => {
              const dest = markets.swapDestinations.find(
                (d) => d.marketId === m.marketId && d.status === 'READY' && d.label.includes('buy'),
              )
              return (
                <Item key={m.marketId} data-testid={`market-row-${m.marketId}`}>
                  {m.displayLabel} · chain {m.chainId} · {m.status}
                  {dest ? (
                    <CtaLink href={dest.href} aria-label={`Open Swap for ${m.displayLabel}`}>
                      Open Swap
                    </CtaLink>
                  ) : (
                    <StatusText> — destination unavailable</StatusText>
                  )}
                </Item>
              )
            })}
          </List>
        </Details>
      ) : null}

      {markets.warnings.length > 0 ? (
        <Details>
          <Summary>Partial or conflicted market notes</Summary>
          <List aria-label="Market warnings">
            {markets.warnings.map((w) => (
              <Item key={`${w.reasonCode}-${w.chainId ?? 'none'}-${w.marketId ?? 'none'}`}>
                {w.message}
              </Item>
            ))}
          </List>
        </Details>
      ) : null}

      <Fact>{markets.limitations[0]}</Fact>
    </Stack>
  )
}

export default ProjectMarketsSection
