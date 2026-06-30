import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { melegaOperational as tokens } from 'ui/tokens'

const Block = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: ${tokens.cardPadding};
  background: ${tokens.surfaceSecondary};
  border: 1px solid ${tokens.borderGold};
  border-radius: ${tokens.radius};
  text-decoration: none;
  transition: border-color ${tokens.transition};

  &:hover {
    border-color: ${tokens.gold};
  }
`

const Title = styled.h2`
  margin: 0;
  font-family: ${tokens.fontDisplay};
  font-size: 20px;
  font-weight: 600;
  color: ${tokens.text};
`

const Copy = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: ${tokens.textSecondary};
  max-width: 720px;
`

const Action = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${tokens.gold};
`

export const HumanListingCta: React.FC<{ href?: string }> = ({ href = '/launch' }) => (
  <Block href={href}>
    <Title>List your project on Melega DEX</Title>
    <Copy>
      List your token, add liquidity, create a farm, or reward MARCO holders with a staking pool.
    </Copy>
    <Action>Start listing →</Action>
  </Block>
)

export default HumanListingCta
