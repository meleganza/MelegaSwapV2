import React from 'react'
import styled from 'styled-components'
import { Flex, Text, Heading } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  CONSTITUTIONAL_CANONICAL_ASSET,
  CONSTITUTIONAL_CANONICAL_CHAIN,
  CONSTITUTIONAL_CANONICAL_STATUS,
} from 'registry/presence/presence-constants'

const Banner = styled(Flex)`
  flex-direction: column;
  gap: 8px;
  padding: 16px 20px;
  border: 1px solid rgba(244, 196, 48, 0.35);
  border-radius: 16px;
  background: rgba(244, 196, 48, 0.06);
`

const LiveDot = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #31d0aa;
  font-weight: 600;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #31d0aa;
  }
`

const CanonicalEconomyBanner: React.FC = () => {
  const { t } = useTranslation()

  return (
    <Banner>
      <Heading as="h2" scale="md" color="secondary">
        {t('Presence canonical banner title')}
      </Heading>
      <Text fontSize="13px" color="textSubtle">
        {t('Presence canonical banner note')}
      </Text>
      <Flex flexWrap="wrap" style={{ gap: '16px' }}>
        <Text fontSize="12px" color="text">
          {t('CMD chain label')}: <strong>{CONSTITUTIONAL_CANONICAL_CHAIN}</strong>
        </Text>
        <Text fontSize="12px" color="text">
          {t('CMD asset label')}: <strong>{CONSTITUTIONAL_CANONICAL_ASSET}</strong>
        </Text>
        <Text fontSize="12px" color="text">
          {t('CMD status label')}: <LiveDot>{CONSTITUTIONAL_CANONICAL_STATUS}</LiveDot>
        </Text>
      </Flex>
    </Banner>
  )
}

export default CanonicalEconomyBanner
