import React from 'react'
import { Text } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import styled from 'styled-components'

const DisclaimerBox = styled(Text)`
  font-size: 12px;
  line-height: 1.5;
  text-align: center;
  max-width: 720px;
  margin: 0 auto;
`

const ProjectDisclaimer: React.FC<{ mt?: string }> = ({ mt = '24px' }) => {
  const { t } = useTranslation()

  return (
    <DisclaimerBox color="textSubtle" mt={mt} px="16px">
      {t('Project registry disclaimer')}
    </DisclaimerBox>
  )
}

export default ProjectDisclaimer
