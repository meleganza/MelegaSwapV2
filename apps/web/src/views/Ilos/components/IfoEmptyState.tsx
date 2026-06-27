import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import DexDisclaimer from 'components/Dex/DexDisclaimer'

const EmptyCard = styled(Flex)`
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 48px 24px;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.02);
  max-width: 480px;
  margin: 0 auto;
`

const IfoEmptyState: React.FC = () => {
  const { t } = useTranslation()

  return (
    <EmptyCard>
      <Heading as="h2" scale="lg" color="secondary" mb="16px">
        {t('No active ILO')}
      </Heading>
      <Text color="textSubtle" mb="16px">
        {t('There is no initial liquidity offering running right now. Check back for upcoming launches on Melega DEX.')}
      </Text>
      <DexDisclaimer mt="0" />
      <Text color="textSubtle" fontSize="12px" mt="12px">
        {t('Participate at your own risk. DYOR.')}
      </Text>
    </EmptyCard>
  )
}

export default IfoEmptyState
