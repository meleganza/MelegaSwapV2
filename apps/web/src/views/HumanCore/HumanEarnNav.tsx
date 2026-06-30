import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { melegaOperational as tokens } from 'ui/tokens'

const Tabs = styled.nav`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`

const Tab = styled(Link)<{ $active?: boolean }>`
  padding: 10px 16px;
  border-radius: ${tokens.radiusSm};
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid ${({ $active }) => ($active ? tokens.borderGold : tokens.border)};
  background: ${({ $active }) => ($active ? tokens.surfaceSecondary : tokens.surface)};
  color: ${({ $active }) => ($active ? tokens.gold : tokens.textSecondary)};
`

export const HumanEarnNav: React.FC = () => {
  const { pathname } = useRouter()
  return (
    <Tabs aria-label="Earn">
      <Tab href="/farms" $active={pathname.startsWith('/farms')}>
        Farms
      </Tab>
      <Tab href="/pools" $active={pathname.startsWith('/pools')}>
        Staking Pools
      </Tab>
    </Tabs>
  )
}

export default HumanEarnNav
