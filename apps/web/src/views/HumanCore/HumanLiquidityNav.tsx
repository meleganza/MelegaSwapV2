import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { melegaOperational as tokens } from 'ui/tokens'

const Tabs = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
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
  min-height: 44px;
  display: inline-flex;
  align-items: center;
`

const isAdd = (pathname: string) => pathname.startsWith('/add')
const isRemove = (pathname: string) => pathname.startsWith('/remove') || pathname.startsWith('/find')
const isPositions = (pathname: string) => pathname === '/liquidity' || pathname.startsWith('/liquidity/')

export const HumanLiquidityNav: React.FC = () => {
  const { pathname } = useRouter()
  return (
    <Tabs aria-label="Liquidity">
      <Tab href="/add" $active={isAdd(pathname)}>
        Add liquidity
      </Tab>
      <Tab href="/remove" $active={isRemove(pathname)}>
        Remove liquidity
      </Tab>
      <Tab href="/liquidity" $active={isPositions(pathname)}>
        Your positions
      </Tab>
    </Tabs>
  )
}

export default HumanLiquidityNav
