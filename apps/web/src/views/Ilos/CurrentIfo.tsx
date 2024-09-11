import React, { useEffect } from 'react'
import { ifosConfig } from 'config/constants'
import useGetPublicIfoData from 'views/Ilos/hooks/v3/useGetPublicIfoData'
import { useERC20 } from 'hooks/useContract'
import { useWeb3React } from '@pancakeswap/wagmi'
import BigNumber from 'bignumber.js'
import { getBalanceAmount, getBalanceNumber, getDecimalAmount, getFullDisplayBalance } from 'utils/formatBalance'
import IfoFoldableCard from './components/IfoFoldableCard'
import IfoLayout from './components/IfoLayout'
import { PublicIfoData3 } from './types'





/**
 * Note: currently there should be only 1 active IFO at a time
 */
const activeIfo = ifosConfig.find((ifo) => ifo.isActive)

const Ifo = () => {
  
  const publicIfoData:PublicIfoData3 = useGetPublicIfoData()
  
 if(publicIfoData.status!==-2)
 {
   
  return (
    <IfoLayout>
      <IfoFoldableCard  publicIfoData={publicIfoData}  />
    </IfoLayout>
  )
 }
  return (
    <IfoLayout/>
  )
}

export default Ifo
