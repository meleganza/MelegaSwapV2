import { ChainId } from '@pancakeswap/sdk'
import { CHAIN_IDS } from 'utils/wagmi'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import Swap from 'views/Swap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'

const SwapPage = () => {
  return (
    <SwapFeaturesProvider>
      <Swap />
    </SwapFeaturesProvider>
  )
}

SwapPage.chains = SUPPORT_MULTI_CHAINS

export default SwapPage
