import React, { useEffect, useState } from 'react'
import {
  Text,
  Flex,
  Box,
  CheckmarkCircleIcon,
  FlexProps,
  HelpIcon,
  useTooltip,
  Button,
  AutoRenewIcon,
  BunnyPlaceholderIcon,
} from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { Ifo, PoolIds,Token } from 'config/constants/types'
import { bscTokens } from '@pancakeswap/tokens'
import { PublicIfoData3, WalletIfoData } from 'views/Ilos/types'
import { useTranslation } from '@pancakeswap/localization'
import { getBalanceNumber, getFullDisplayBalance } from 'utils/formatBalance'
import { useERC20, useIfoV3Contract } from 'hooks/useContract'
import BigNumber from 'bignumber.js'
import { getIfov3Address } from 'utils/addressHelpers'
import { getIfoV3Contract } from 'utils/contractHelpers'
import { ChainId } from '@pancakeswap/sdk'

interface TokenSectionProps extends FlexProps {
  primaryToken?: string
}

const TokenSection: React.FC<TokenSectionProps> = ({ primaryToken, children, ...props }) => {
  const renderTokenComponent = () => {
  
      return <img alt='icon' width={32} style={{objectFit:"contain"}} src={primaryToken} />
    

  

    return null
  }

  return (
    <Flex {...props}>
      {renderTokenComponent()}
      <div>{children}</div>
    </Flex>
  )
}


const Label = (props) => <Text bold fontSize="12px" color="secondary" textTransform="uppercase" {...props} />

const Value = (props) => <Text bold fontSize="20px" style={{ wordBreak: 'break-all' }} {...props} />

interface IfoCardTokensProps {
  publicIfoData: PublicIfoData3
}

const IfoCardTokens: React.FC<IfoCardTokensProps> = ({
  publicIfoData,
}) => {
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const { targetRef, tooltip, tooltipVisible } = useTooltip(
    t(
      'Sorry,  You didn\'t buy anything in this sale.',
    ),
    { placement: 'bottom' },
  )

  const ifocontract=getIfoV3Contract(getIfov3Address());
  const [bnbcommited, setbnbcommited] = useState("0");
      const [tokenRecieved, settokenRecieved] = useState("0")
  useEffect(()=>{
    async function loadData() {
      const bnbBalBigNumber=await ifocontract.bnbCommitted(account)
      const bnbBal=getFullDisplayBalance(new BigNumber(bnbBalBigNumber.toString()),18,2)
      setbnbcommited(bnbBal === "NaN"? "0": bnbBal)
      settokenRecieved((bnbBalBigNumber/publicIfoData.costPresaleBNB).toString()==="NaN"?"0":(bnbBalBigNumber/publicIfoData.costPresaleBNB).toString())
    }
    if(account)
    {
      loadData();
    }
  },[account, ifocontract, publicIfoData]);
  const renderTokenSection = () => {
    
    if (publicIfoData.status !==-1) {
      return (
        <>
          <TokenSection primaryToken={'/images/'.concat('56').concat('/tokens/').concat(bscTokens.wbnb.address).concat('.png')}>
            <Label>&nbsp;&nbsp;&nbsp;&nbsp;{t('Your BNB committed')}</Label>
            <Value>&nbsp;&nbsp;&nbsp;&nbsp;{bnbcommited}</Value>
          </TokenSection>
          <br/>
          <TokenSection primaryToken={publicIfoData.logolink}>
            <Label>&nbsp;&nbsp;&nbsp;&nbsp;{publicIfoData.symbol.concat(' Recieved')}</Label>
            <Value>&nbsp;&nbsp;&nbsp;&nbsp;{tokenRecieved}</Value>
          </TokenSection>
        </>
      )
    }
    
    return null
  }
  return (
    <Box pb="24px">
      {tooltipVisible && tooltip}
      {renderTokenSection()}
    </Box>
  )
}

export default IfoCardTokens
