import React, { useEffect, useState } from 'react'
import BigNumber from 'bignumber.js'
import { Button, useModal } from '@pancakeswap/uikit'
import { getBalanceNumber } from 'utils/formatBalance'
import { WalletIfoData, PublicIfoData3 } from 'views/Ilos/types'
import { useTranslation } from '@pancakeswap/localization'
import useTokenBalance, { useGetBnbBalance } from 'hooks/useTokenBalance'
import { getAddress, getIfov3Address } from 'utils/addressHelpers'
import { useToast } from '@pancakeswap/uikit'
import {Address} from 'config/constants/types'
import { bscTokens } from '@pancakeswap/tokens'
import { useIfoV3Contract } from 'hooks/useContract'
import { useWeb3React } from '@pancakeswap/wagmi'
import GetLpModal from './GetLpModal'
import ContributeModal from './ContributeModalETH'
import ContributeModalBNB from './ContributeModalBNB'


interface Props {
  publicIfoData: PublicIfoData3
}
const ContributeButtonBNB: React.FC<Props> = ({ publicIfoData }) => {
  const limitPerUserInLP  = publicIfoData.maxUserAmount
  const { t } = useTranslation()
  const { toastSuccess } = useToast()
  const { balance: userCurrencyBalance } = useGetBnbBalance()
  const { account } = useWeb3React()
  const contract=useIfoV3Contract(getIfov3Address());
  const [iswhite, setIswhite] = useState(false);
  const ctime= Number((new Date().getTime()/1000).toFixed(0));
  const countdownToUse = ctime<Number(publicIfoData.startPresaleTime) ? Number(publicIfoData.startPresaleTime)-ctime :  ctime<Number(publicIfoData.endPresaleTime)?Number(publicIfoData.endPresaleTime)-ctime:0
      
  useEffect(()=>{
    async function loadData() {
      
      console.log(publicIfoData.isWhitelistOn[0])
      if(publicIfoData.isWhitelistOn[0])
      {
        console.log("asdasd")
        const tx = await contract.isInList(account);
        if(tx.toString()==="true")
          setIswhite(true);
      }
          
      
    }
    if(account)
    loadData();
  },[account,contract,publicIfoData]);

  // Refetch all the data, and display a message when fetching is done
  const handleContributeSuccess = async (amount: BigNumber) => {
  
    toastSuccess(
      t('Success!'),
      t('You have contributed to this IFO!'),
    )
  }

  const [onPresentContributeModal] = useModal(
    <ContributeModalBNB
      publicIfoData={publicIfoData}
      onSuccess={handleContributeSuccess}
    />,
    false,
  )

  const [onPresentGetLpModal] = useModal(<GetLpModal currency={bscTokens.wbnb} />, false)

if((ctime>Number(publicIfoData.startPresaleTime)&&countdownToUse>0)&&(!publicIfoData.isWhitelistOn[0]||iswhite))
  {
    return (
    <Button
      onClick={userCurrencyBalance.isZero() ? onPresentGetLpModal : onPresentContributeModal}
      width="100%"
    >Buy {publicIfoData.symbol} with BNB
    </Button>
  )
  }
  console.log("asda",ctime-Number(publicIfoData.startPresaleTime),countdownToUse)
  if(!(ctime>Number(publicIfoData.startPresaleTime)&&countdownToUse>0))
  {return (
    <div style={{textAlign:"center"}}>Coming soon</div>
  )
  }
  
  return (
    <div style={{textAlign:"center"}}>Sorry you are not whitelisted.</div>
  )
}

export default ContributeButtonBNB
