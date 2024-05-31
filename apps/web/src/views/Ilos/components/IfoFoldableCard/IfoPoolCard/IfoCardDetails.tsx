import React, { useEffect, useState } from 'react'
import { Text, Flex, Box, Skeleton } from '@pancakeswap/uikit'
import { PublicIfoData3 } from 'views/Ilos/types'
import { useTranslation } from '@pancakeswap/localization'
import { Ifo, PoolIds } from 'config/constants/types'
import { getBalanceNumber, formatNumber, getFullDisplayBalance } from 'utils/formatBalance'
import BigNumber from 'bignumber.js'
import { SkeletonCardDetails } from './Skeletons'


export interface IfoCardDetailsProps {
  
  publicIfoData: PublicIfoData3
}

export interface FooterEntryProps {
  label: string
  value: string | number
}

const FooterEntry: React.FC<FooterEntryProps> = ({ label, value }) => {
  return (
    <Flex justifyContent="space-between" alignItems="center">
      <Text small color="textSubtle">
        {label}
      </Text>
      {value ? (
        <Text small textAlign="right">
          {value}
        </Text>
      ) : (
        <Skeleton height={21} width={80} />
      )}
    </Flex>
  )
}

const IfoCardDetails: React.FC<IfoCardDetailsProps> = ({  publicIfoData }) => {
  const { t } = useTranslation()
  const status  = Number(publicIfoData.status)
 
  
   
    
  
  if(status!==-2) {
      return <Box paddingTop="24px">
      <FooterEntry label={t('Max BNB entry:')} value={publicIfoData.maxUserAmount.toString()!=="0"?(publicIfoData.maxUserAmount/1000000000000000000).toString().concat(" BNB"):"No Limit"} />
  
  
  <FooterEntry label={t('Price Per BNB:')} value={(1000000000000000000/publicIfoData.costPresaleBNB).toFixed(0).toString().concat(" ").concat(publicIfoData.symbol.toString())} />
  
  </Box>
  }
  return <Box paddingTop="24px">
  <SkeletonCardDetails />
  </Box>
}

export default IfoCardDetails
