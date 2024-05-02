import React, { useState } from 'react'
import { useWeb3React } from '@pancakeswap/wagmi'
import BigNumber from 'bignumber.js'
import { ethers } from 'ethers'
import { Modal, ModalBody, Text, Image, Button, BalanceInput, Flex } from '@pancakeswap/uikit'
import { PoolIds, Ifo } from 'config/constants/types'
import { WalletIfoData, PublicIfoData3 } from 'views/Ilos/types'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceAmount, getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import { getAddress, getIfov3Address } from 'utils/addressHelpers'
import { DEFAULT_TOKEN_DECIMAL } from 'config'
import { useERC20, useIfoV3Contract, useWNativeContract } from 'hooks/useContract'
import { BIG_NINE, BIG_TEN } from 'utils/bigNumber'
import { bscTokens } from '@pancakeswap/tokens'
import { getContract } from 'utils'
import { useGetBnbBalance } from 'hooks/useTokenBalance'
import { useToast } from '@pancakeswap/uikit'

interface Props {
  publicIfoData: PublicIfoData3
  onSuccess: (amount: BigNumber) => void
  onDismiss?: () => void
}

const multiplierValues = [0.1, 0.25, 0.5, 0.75, 1]

// Default value for transaction setting, tweak based on BSC network congestion.
const gasPrice = BIG_TEN.times(BIG_TEN.pow(BIG_NINE)).toString()

const ContributeModalBNB: React.FC<Props> = ({
  publicIfoData,
  onDismiss,
  onSuccess,
}) => {

  const [value, setValue] = useState('')
  const { account } = useWeb3React()
  const { balance: userCurrencyBalance } = useGetBnbBalance()
  const { toastError, toastSuccess } = useToast()
  console.log(userCurrencyBalance)
  const contract=useIfoV3Contract(getIfov3Address());
  const currencyBNB=useWNativeContract();
  const { t } = useTranslation()
  const valueWithTokenDecimals = new BigNumber(value).times(DEFAULT_TOKEN_DECIMAL)
  const [isDisable, setIsDisable] = useState(false)
  const [steps, setSteps] = useState(0);
  const [wbnbBal, setWbnbBal] = useState(0);
  const [allownce, setAllownce] = useState(0);

  return (
    <Modal title={t('', { })} onDismiss={onDismiss}>
      <ModalBody maxWidth="350px">
        
        
        <BalanceInput
          value={value}
          onUserInput={async e=>{
            setValue(e);
            setIsDisable(Number(getDecimalAmount(new BigNumber(e),18))<Number(publicIfoData.costPresaleBNB));
            
            setWbnbBal(await currencyBNB.balanceOf(account))
            setAllownce(await currencyBNB.allowance(account, getIfov3Address()))
            console.log(Number(wbnbBal),Number(allownce)," ----- ",Number(getDecimalAmount(new BigNumber(e),18)))
            
            if(Number(wbnbBal)>=Number(getDecimalAmount(new BigNumber(e),18))||Number(allownce)>=Number(getDecimalAmount(new BigNumber(e),18)))
            {
              if(Number(allownce)>=Number(getDecimalAmount(new BigNumber(e),18)))
              {
                  setSteps(2)
              }
              else
                setSteps(1)
            }
            else
              setSteps(0)
            
          }}
          mb="8px"
        />
        <Text color="textSubtle" textAlign="right" fontSize="12px" mb="16px">
          {t('Balance: ')+getFullDisplayBalance(new BigNumber(userCurrencyBalance.toString()), 18, 6)}
        </Text>
        <Flex justifyContent="space-between" mb="16px">
          {multiplierValues.map((multiplierValue, index) => (
            <Button
              key={multiplierValue}
              scale="xs"
              variant="tertiary"
              onClick={() => setValue((Number(getFullDisplayBalance(new BigNumber(userCurrencyBalance.toString()), 18, 6))*multiplierValue).toString())}
              mr={index < multiplierValues.length - 1 ? '8px' : 0}
            >
              {multiplierValue * 100}%
            </Button>
          ))}
        </Flex>
        <Text color="textSubtle" fontSize="12px" mb="24px">
          {t(
            'If you don\'t commit enough BNB, you may not receive any ILO tokens at all and will only receive a full refund of your BNB.',
          )}
        </Text>
        
        <Button
        display={steps===0?"block":"none"}
          disabled={isDisable}
          onClick={async ()=>{
            try {
              const tx = await currencyBNB.deposit({gasPrice,value:(Number(getDecimalAmount(new BigNumber(value),18))-Number(wbnbBal)).toString()});
               
              const receipt=await tx.wait()
              if (receipt.status) {
                toastSuccess(t('Wrapped'), t('BNB is wrapped'))
                
                setSteps(1)
              }
            } catch (error) {
              toastError(t('Error'), t('You are not allowed to buy.'))
            
            }
          }}
        >Wrap BNB</Button>
        <Button
        display={steps===1?"block":"none"}
          disabled={isDisable}
          onClick={async ()=>{
            try {
              
              const tx = await currencyBNB.approve(getIfov3Address(),Number(getDecimalAmount(new BigNumber(value),18)).toString());
                const receipt=await tx.wait()
              if (receipt.status) {
                toastSuccess(t('Approved'), t('WBNB is approved'))
                setSteps(2)
               
              }
            } catch (error) {
              toastError(t('Error'), t('You are not allowed to buy.'))
            
            }
          }}
        >Approve</Button>
        <Button
          display={steps===2?"block":"none"}
          disabled={isDisable}
          onClick={async ()=>{
            try {
             
               const tx = await contract.buyBNB(getDecimalAmount(new BigNumber(value)).toString());
              const receipt=await tx.wait()
              if (receipt.status) {
                toastSuccess(t('Token Recieved'), t('Token has been sent to your wallet.'))
                
                onDismiss()
              }
            } catch (error) {
              toastError(t('Error'), t('You are not allowed to buy.'))
            
            }
          }}
        >Buy</Button>
        
      </ModalBody>
    </Modal>
  )
}

export default ContributeModalBNB