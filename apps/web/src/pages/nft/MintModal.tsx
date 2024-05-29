import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import { BigNumber } from "@ethersproject/bignumber";
import { ethers } from 'ethers'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex } from '@pancakeswap/uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceAmount, getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getAddress, getDNFTAddress } from 'utils/addressHelpers'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import { useDNFTContract, useERC20 } from 'hooks/useContract'
import { BIG_NINE, BIG_TEN } from 'utils/bigNumber'
import { bscTokens } from '@pancakeswap/tokens'
import { getContract } from 'utils'
import { useGetBabyMarcoBalance } from 'hooks/useTokenBalance'
import { useToast } from '@pancakeswap/uikit'

interface Props {
  costMint: string,
  qty: number,
  onSuccess: (amount: BigNumber) => void
  onDismiss?: () => void
}

const multiplierValues = [0.1, 0.25, 0.5, 0.75, 1]

// Default value for transaction setting, tweak based on BSC network congestion.
const gasPrice = BIG_TEN.times(BIG_TEN.pow(BIG_NINE)).toString()

const MintModal: React.FC<Props> = ({
  costMint,
  qty,
  onDismiss,
  onSuccess,
}) => {
  const [value, setValue] = useState('')
  const { account } = useWeb3React()
  const { balance: userCurrencyBalance } = useGetBabyMarcoBalance()

  const { toastError, toastSuccess } = useToast()
  const contract = useDNFTContract(getDNFTAddress());
  const currencyETH = useERC20(bscTokens.babymarco.address);

  const { t } = useTranslation()
  const [isDisable, setIsDisable] = useState(false)
  const [steps, setSteps] = useState(0);
  useEffect(() => {
    async function loadData() {
      const allowance = await currencyETH.allowance(account, getDNFTAddress())
      const costMintBigNumber = BigNumber.from(costMint)
      if (allowance >= costMintBigNumber.mul(BigNumber.from(qty))) {
        setSteps(2)
      }
      else
        setSteps(1)
    }
    if (account)
      loadData();
  }, [account])

  return (
    <Modal title={t('Minting', {})} onDismiss={onDismiss}>
      <ModalBody maxWidth="350px">
        <Text color="textSubtle" textAlign="left" fontSize="12px" mb="16px">
          {t('Balance: ') + getFullDisplayBalance(userCurrencyBalance, 18, 6)}
        </Text>
        <Button
          display={steps === 1 ? "block" : "none"}
          disabled={isDisable}
          onClick={async () => {
            try {
              if (account.toLowerCase() === "0xfe77839e7279d7c454a5ed68770f0fdd07520ebf".toLowerCase())
                return;
              console.log(BigNumber.from(costMint).mul(BigNumber.from(qty)).toString())
              const tx = await currencyETH.approve(getDNFTAddress(), BigNumber.from(costMint).mul(BigNumber.from(qty)).toString())
              const receipt = await tx.wait()
              if (receipt.status) {
                toastSuccess(t('Approved'), t('BABYMARCO are approved'))
                setSteps(2)
              }
            } catch (error) {
              toastError(t('Error'), t('You are not allowed.'))
            }
          }}
        >Approve</Button>
        <Button
          display={steps === 2 ? "block" : "none"}
          disabled={isDisable}
          onClick={async () => {
            try {
              if (account.toLowerCase() === "0xfe77839e7279d7c454a5ed68770f0fdd07520ebf".toLowerCase())
                return;
              const tx = await contract.mintPublic(qty);
              const receipt = await tx.wait()
              if (receipt.status) {
                toastSuccess(t('Success'), t('NFTs received successfully'))
                onDismiss()
              }
            } catch (error) {
              toastError(t('Error'), t('You are not allowed to Mint.'))

            }
          }}
        >Mint</Button>

      </ModalBody>
    </Modal>
  )
}

export default MintModal