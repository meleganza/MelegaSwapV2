import React from 'react'
import styled from 'styled-components'
import { Flex, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import Link from 'next/link'

const ActionsWrapper = styled(Flex)`
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
  margin: 24px 16px;
`

const ActionChip = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  min-width: 44px;
  padding: 10px 20px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.04);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.2s ease, background 0.2s ease;

  &:hover {
    border-color: rgba(49, 208, 170, 0.6);
    background: rgba(49, 208, 170, 0.08);
    color: #ffffff;
  }
`

const QuickActionsRow: React.FC = () => {
  const { t } = useTranslation()

  const actions = [
    { label: t('Swap'), href: '/swap' },
    { label: t('Liquidity'), href: '/liquidity' },
    { label: t('Farms'), href: '/farms' },
    { label: t('Pools'), href: '/pools' },
    { label: t('ILO'), href: '/ilo' },
  ]

  return (
    <Flex flexDirection="column" alignItems="center">
      <Text color="textSubtle" fontSize="14px" mb="8px">
        {t('Quick actions')}
      </Text>
      <ActionsWrapper>
        {actions.map((action) => (
          <Link key={action.href} href={action.href} passHref legacyBehavior>
            <ActionChip>{action.label}</ActionChip>
          </Link>
        ))}
      </ActionsWrapper>
    </Flex>
  )
}

export default QuickActionsRow
