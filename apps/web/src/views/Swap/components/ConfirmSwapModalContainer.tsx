import { Modal } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'

const ConfirmSwapModalContainer = ({ children, handleDismiss }) => {
  const { t } = useTranslation()

  return (
    <Modal title={t('Confirm Swap')} onDismiss={handleDismiss}>
      {children}
    </Modal>
  )
}

export default ConfirmSwapModalContainer
