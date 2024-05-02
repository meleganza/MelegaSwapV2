import { ChainId } from '@pancakeswap/sdk'
import { CHAIN_IDS } from 'utils/wagmi'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import Liquidity from 'views/Pool'

const LiquidityPage = () => <Liquidity />

LiquidityPage.chains = SUPPORT_MULTI_CHAINS

export default LiquidityPage
