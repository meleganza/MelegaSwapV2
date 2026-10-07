import React from 'react'
import { Modal, ModalBody, Text } from '@pancakeswap/uikit';
import 'config';
import { Token } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'

interface Props {
  currency: Token
  onDismiss?: () => void
}

const GetLpModal: React.FC<Partial<Props>> = ({ currency, onDismiss }) => {
  const { t } = useTranslation()
  return (
    <Modal title={t('BNB required')} onDismiss={onDismiss}>
      <ModalBody maxWidth="288px">

        <Text mb="16px">{t('You\'ll need BNB to participate in the IFO!')}</Text>

      </ModalBody>
    </Modal>
  )
}

export default GetLpModal
