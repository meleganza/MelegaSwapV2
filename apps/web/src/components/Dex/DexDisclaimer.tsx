import React from 'react'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'

const DisclaimerText = styled(Text)`
  font-size: 12px;
  line-height: 1.4;
  text-align: center;
`

const DexDisclaimer: React.FC<{ mt?: string }> = ({ mt = '16px' }) => {
  const { t } = useTranslation()

  return (
    <DisclaimerText color="textSubtle" mt={mt} px="8px">
      {t('Always verify token contract address. Listed ≠ audited.')}
    </DisclaimerText>
  )
}

export default DexDisclaimer
