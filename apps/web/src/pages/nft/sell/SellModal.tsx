import React, { useEffect, useState } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex, useToast } from '@pancakeswap/uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { useTranslation } from "@pancakeswap/localization";
import { getBalanceAmount, getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getAddress, getDNFTAddress, getNftMarketAddress } from 'utils/addressHelpers'
import useApproveConfirmTransaction from 'hooks/useApproveConfirmTransaction'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import { useDNFTContract, useERC20, useNftMarketContract } from 'hooks/useContract'
import { BIG_NINE, BIG_TEN } from 'utils/bigNumber'
import tokens from '@pancakeswap/tokens'
import { getContract } from 'utils'
import { useGetBabyMarcoBalance } from 'hooks/useTokenBalance'
import { useHistory } from 'react-router-dom'
import { getDNFTContract } from 'utils/contractHelpers'

interface Props {
  tid: number
  onSuccess: (amount: BigNumber) => void
  onDismiss?: () => void
}

const SellModal: React.FC<Props> = ({ tid, onDismiss, onSuccess }) => {
  const [value, setValue] = useState('')
  const { account } = useWeb3React()
  const contract = useNftMarketContract(getNftMarketAddress())
  const usNFT = useDNFTContract(getDNFTAddress())
  const { toastError, toastSuccess } = useToast()
  const hist = useHistory()
  const [approved, setApproved] = useState(false)

  console.log(tid)
  const { t } = useTranslation()
  useEffect(() => {
    async function loaddata() {
      const NFTCont = getDNFTContract(getDNFTAddress())
      const allowance = await NFTCont.getApproved(tid)
      if (allowance !== getNftMarketAddress()) setApproved(false)
      else setApproved(true)
    }

    loaddata()
  }, [contract, tid])

  return (
    <Modal title={t('Listing', {})} onDismiss={onDismiss}>
      <ModalBody maxWidth="350px">
        <Text color="textSubtle" textAlign="left" fontSize="12px" mb="16px">
          {t('Set your NFT price:')}
        </Text>
        <BalanceInput
          value={value}
          onUserInput={async (e) => {
            console.log(new BigNumber(value).multipliedBy('10e+17').toString())
            setValue(e)
          }}
          mb="8px"
        />

        {approved ? (
          <Button
            disabled={Number(value) <= 0 ? !false : !true}
            onClick={async () => {
              try {
                const tx = await contract.listNFT(tid, new BigNumber(value).multipliedBy('10e+17').toString(), true)
                const receipt = await tx.wait()
                if (receipt.status) {
                  toastSuccess(t('Listed'), t('NFT is listed in the market'))
                  onDismiss()
                }
              } catch (error) {
                toastError(t('Error'), t('You are not allowed.'))
              }
            }}
          >
            List
          </Button>
        ) : (
          <Button
            disabled={Number(value) <= 0 ? !false : !true}
            onClick={async () => {
              try {
                const tx = await usNFT.approve(getNftMarketAddress(), tid)
                const receipt = await tx.wait()
                if (receipt.status) {
                  toastSuccess(t('Approved'), t('NFT is approved to list'))
                  setApproved(true)
                }
              } catch (error) {
                toastError(t('Error'), t('You are not allowed.'))
              }
            }}
          >
            Approve
          </Button>
        )}
      </ModalBody>
    </Modal>
  )
}

export default SellModal
