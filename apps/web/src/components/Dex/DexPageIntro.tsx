import React from 'react'
import styled from 'styled-components'
import { Flex, Heading, Text } from '@pancakeswap/uikit'
import DexDisclaimer from './DexDisclaimer'

const IntroWrapper = styled(Flex)`
  flex-direction: column;
  margin-bottom: 24px;
  padding: 0 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding: 0;
  }
`

interface DexPageIntroProps {
  title: string
  subtitle: string
  showDisclaimer?: boolean
}

const DexPageIntro: React.FC<DexPageIntroProps> = ({ title, subtitle, showDisclaimer = true }) => {
  return (
    <IntroWrapper>
      <Heading as="h1" scale="xxl" color="secondary" mb="8px">
        {title}
      </Heading>
      <Text color="textSubtle" mb={showDisclaimer ? '12px' : '0'}>
        {subtitle}
      </Text>
      {showDisclaimer && <DexDisclaimer mt="0" />}
    </IntroWrapper>
  )
}

export default DexPageIntro
