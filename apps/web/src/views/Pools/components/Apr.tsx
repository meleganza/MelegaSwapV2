import { useWeb3React } from '@pancakeswap/wagmi'
import { Pool } from '@pancakeswap/uikit'
import { vaultPoolConfig } from 'config/constants/pools'
import { useCurrentBlock } from 'state/block/hooks'
import { getPoolBlockInfo } from 'views/Pools/helpers'
import { Token } from '@pancakeswap/sdk'

const withShownApr = (AprComp) => (props) => {
  const { account } = useWeb3React()

  const currentBlock = useCurrentBlock()
  
  const { shouldShowBlockCountdown, hasPoolStarted } = getPoolBlockInfo(props.pool, currentBlock)
  const autoCompoundFrequency = vaultPoolConfig[props.pool.vaultKey]?.autoCompoundFrequency ?? 0
  // console.log(hasPoolStarted)
  return (
    <AprComp
      {...props}
      shouldShowApr={hasPoolStarted || !shouldShowBlockCountdown}
      account={account}
      autoCompoundFrequency={autoCompoundFrequency}
    />
  )
}

export default withShownApr(Pool.Apr<Token>)
