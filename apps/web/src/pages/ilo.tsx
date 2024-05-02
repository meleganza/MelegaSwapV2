import { ChainId } from '@pancakeswap/sdk'
import { CHAIN_IDS } from 'utils/wagmi'
import { SUPPORT_ILO } from 'config/constants/supportChains'
import Ilos from 'views/Ilos'

const IloPage = () => {
  return <Ilos />
}

IloPage.chains = SUPPORT_ILO

export default IloPage