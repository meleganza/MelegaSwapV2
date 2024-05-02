import { useFarmUser } from 'state/farms/hooks'
import { Farm as FarmUI, FarmTableFarmTokenInfoProps } from '@pancakeswap/uikit'
import { TokenImage, TokenPairImage } from 'components/TokenImage'
import { bscTokens } from '@pancakeswap/tokens'

const { FarmTokenInfo } = FarmUI.FarmTable

const Farm: React.FunctionComponent<React.PropsWithChildren<FarmTableFarmTokenInfoProps>> = ({
  token,
  quoteToken,
  label,
  pid,
  isReady,
  isStable,
  isTokenOnly
}) => {
  const { stakedBalance, proxy } = useFarmUser(pid)
  
  return (
    <FarmTokenInfo
      pid={pid}
      label={label}
      token={token}
      quoteToken={quoteToken}
      isReady={isReady}
      isStable={isStable}
      stakedBalance={proxy?.stakedBalance?.gt(0) ? proxy?.stakedBalance : stakedBalance}
      isTokenOnly={isTokenOnly}
    >
      {isTokenOnly ?
        <TokenImage width={40} height={40} token={token} />
        :
        <TokenPairImage width={40} height={40} variant="inverted" primaryToken={token} secondaryToken={quoteToken} />
      }
    </FarmTokenInfo>
  )
}

export default Farm
