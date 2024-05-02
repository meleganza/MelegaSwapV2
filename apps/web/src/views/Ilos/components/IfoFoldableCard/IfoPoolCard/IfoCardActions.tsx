import React from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Button } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { Link } from 'react-router-dom'
import { Ifo, PoolIds } from 'config/constants/types'
import { PublicIfoData3 } from 'views/Ilos/types'
import ConnectWalletButton from 'components/ConnectWalletButton'
import ClaimButton from './ClaimButton'
import { SkeletonCardActions } from './Skeletons'
import ContributeButtonBNB from './ContributeButtonBNB'
import ContributeButtonETH from './ContributeButtonETH'

interface Props {
  publicIfoData: PublicIfoData3
}

const IfoCardActions: React.FC<Props> = ({  publicIfoData}) => {
  const { t } = useTranslation()
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
