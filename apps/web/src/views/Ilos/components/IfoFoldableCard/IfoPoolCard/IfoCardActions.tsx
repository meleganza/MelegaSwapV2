import React from 'react'
import { useTranslation } from '@pancakeswap/localization'
import '@pancakeswap/uikit';
import { useWeb3React } from '@pancakeswap/wagmi'
import 'react-router-dom';
import 'config/constants/types';
import { PublicIfoData3 } from 'views/Ilos/types'
import ConnectWalletButton from 'components/ConnectWalletButton'
import './ClaimButton';
import './Skeletons';
import ContributeButtonBNB from './ContributeButtonBNB'
import './ContributeButtonETH';

interface Props {
  publicIfoData: PublicIfoData3
}

const IfoCardActions: React.FC<Props> = ({  publicIfoData}) => {
  useTranslation();
  const { account } = useWeb3React()

  if (!account) {
    return <ConnectWalletButton width="100%" />
  }



  return (
    <>
      {publicIfoData.status !==-1  && (
        <div>
        <ContributeButtonBNB publicIfoData={publicIfoData} />
        <br/>
        {/* <br/>
        <ContributeButtonETH publicIfoData={publicIfoData} /> */}
        </div>
      )}
    {/* sell button */}
    </>
  )
}

export default IfoCardActions
