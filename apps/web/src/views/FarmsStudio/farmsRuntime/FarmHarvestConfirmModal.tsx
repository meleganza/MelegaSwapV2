import React, { useCallback, useState } from 'react'
import { Box, Button, Flex, Modal, Text } from '@pancakeswap/uikit'
import { useAccount } from 'wagmi'
import ConnectWalletButton from 'components/ConnectWalletButton'

export type FarmHarvestConfirmModalProps = {
  farmLabel: string
  rewardSymbol: string
  claimableLabel: string
  claimableUsdLabel?: string | null
  onConfirm: () => Promise<void>
  onDismiss?: () => void
}

/**
 * Visible harvest confirmation — never auto-executes on open.
 */
export const FarmHarvestConfirmModal: React.FC<FarmHarvestConfirmModalProps> = ({
  farmLabel,
  rewardSymbol,
  claimableLabel,
  claimableUsdLabel,
  onConfirm,
  onDismiss,
}) => {
  const { address: account } = useAccount()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = useCallback(async () => {
    setPending(true)
    setError(null)
    try {
      await onConfirm()
      onDismiss?.()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Harvest failed')
    } finally {
      setPending(false)
    }
  }, [onConfirm, onDismiss])

  return (
    <Modal title="Harvest rewards" onDismiss={onDismiss} data-farms-harvest-modal>
      <Box minWidth={['100%', '360px']} p="8px 0 4px">
        <Text color="textSubtle" fontSize="13px" mb="8px">
          Farm
        </Text>
        <Text bold fontSize="16px" mb="16px">
          {farmLabel}
        </Text>
        <Flex justifyContent="space-between" mb="8px">
          <Text color="textSubtle" fontSize="13px">
            Reward token
          </Text>
          <Text bold fontSize="13px">
            {rewardSymbol}
          </Text>
        </Flex>
        <Flex justifyContent="space-between" mb="8px">
          <Text color="textSubtle" fontSize="13px">
            Claimable
          </Text>
          <Text bold fontSize="13px">
            {claimableLabel}
          </Text>
        </Flex>
        {claimableUsdLabel ? (
          <Flex justifyContent="space-between" mb="16px">
            <Text color="textSubtle" fontSize="13px">
              Est. USD
            </Text>
            <Text fontSize="13px">{claimableUsdLabel}</Text>
          </Flex>
        ) : (
          <Box mb="16px" />
        )}
        {!account ? (
          <ConnectWalletButton width="100%" />
        ) : (
          <Flex gap="8px">
            <Button variant="secondary" width="100%" onClick={onDismiss} disabled={pending}>
              Cancel
            </Button>
            <Button width="100%" onClick={handleConfirm} disabled={pending} data-farms-harvest-confirm>
              {pending ? 'Confirming…' : 'Confirm Harvest'}
            </Button>
          </Flex>
        )}
        {error ? (
          <Text color="failure" fontSize="12px" mt="12px">
            {error}
          </Text>
        ) : null}
      </Box>
    </Modal>
  )
}

export default FarmHarvestConfirmModal
