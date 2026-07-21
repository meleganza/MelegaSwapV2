import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import type { ProjectLiquidityBuildingDocument } from 'registry/projects/identity/liquidityBuilding'

const Stack = styled(Flex)`
  flex-direction: column;
  gap: 8px;
  min-width: 0;
`

const Fact = styled(Text)`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
  line-height: 1.5;
  word-break: break-word;
`

const SubHeading = styled(Heading)`
  && {
    font-size: 18px;
    margin-top: 4px;
  }
`

const StatusText = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSubtle};
`

const CtaLink = styled.a`
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  color: ${({ theme }) => theme.colors.secondary};
  text-decoration: underline;
  text-underline-offset: 2px;

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.secondary};
    outline-offset: 2px;
  }
`

interface Props {
  liquidityBuilding: ProjectLiquidityBuildingDocument
}

/** Compact Participate card — discovery + deep link only (no embedded LB runtime). */
const ProjectLiquidityBuildingSection: React.FC<Props> = ({ liquidityBuilding }) => {
  const supported = liquidityBuilding.availability === 'AVAILABLE'
  const activationLabel = liquidityBuilding.activationState.replace(/_/g, ' ')

  return (
    <Stack
      as="section"
      data-testid="project-liquidity-building-section"
      data-pp007="true"
      aria-labelledby="participation-liquidity-building-heading"
    >
      <SubHeading as="h3" id="participation-liquidity-building-heading" scale="md">
        Liquidity Building
      </SubHeading>

      {!supported ? (
        <Fact data-testid="lb-unsupported">
          Liquidity Building is not available for this project.
          <StatusText> — activation: {activationLabel}</StatusText>
        </Fact>
      ) : (
        <>
          <Fact data-testid="lb-description">
            Grow liquidity through the existing Melega Liquidity Building program. Execution stays inside Liquidity
            Building — this page only opens that surface.
          </Fact>
          <Fact data-testid="lb-supported-chains">
            Supported chains: {liquidityBuilding.supportedChains.join(', ') || 'none'}
          </Fact>
          <Fact data-testid="lb-activation-state" aria-label={`Activation state: ${activationLabel}`}>
            Activation state: {activationLabel}
          </Fact>
          {liquidityBuilding.destination?.availability === 'AVAILABLE' ? (
            <CtaLink
              href={liquidityBuilding.destination.href}
              data-testid="lb-open-cta"
              aria-label="Open Liquidity Building in Liquidity Studio"
            >
              {liquidityBuilding.destination.label}
            </CtaLink>
          ) : (
            <StatusText data-testid="lb-destination-unavailable">Destination unavailable</StatusText>
          )}
          <Fact data-testid="lb-wallet-note">
            Wallet eligibility and participation status are determined inside Liquidity Building (PP004 connection
            context is not duplicated here).
          </Fact>
        </>
      )}
    </Stack>
  )
}

export default ProjectLiquidityBuildingSection
