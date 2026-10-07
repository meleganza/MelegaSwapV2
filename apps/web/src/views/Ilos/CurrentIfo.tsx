
import { ifosConfig } from 'config/constants'
import useGetPublicIfoData from 'views/Ilos/hooks/v3/useGetPublicIfoData'
import 'hooks/useContract';
import '@pancakeswap/wagmi';
import 'bignumber.js';
import 'utils/formatBalance';
import IfoFoldableCard from './components/IfoFoldableCard'
import IfoLayout from './components/IfoLayout'
import { PublicIfoData3 } from './types'





/**
 * Note: currently there should be only 1 active IFO at a time
 */
ifosConfig.find((ifo) => ifo.isActive);

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
