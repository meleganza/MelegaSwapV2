import React from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Flex, Link, PocketWatchIcon, Text, Skeleton } from '@pancakeswap/uikit'
import getTimePeriods from 'utils/getTimePeriods'
import { PublicIfoData3 } from 'views/Ilos/types'

interface Props {
  publicIfoData: PublicIfoData3
}

const Timer: React.FC<Props> = ({ publicIfoData }) => {
  const { t } = useTranslation()
  const ctime= Number((new Date().getTime()/1000).toFixed(0));
  
  const countdownToUse = ctime<Number(publicIfoData.startPresaleTime) ? Number(publicIfoData.startPresaleTime)-ctime :  ctime<Number(publicIfoData.endPresaleTime)?Number(publicIfoData.endPresaleTime)-ctime:0
  console.log(Number(publicIfoData.endPresaleTime),countdownToUse, Number(publicIfoData.startPresaleTime),ctime,Number(publicIfoData.endPresaleTime))
  const timeUntil = getTimePeriods(countdownToUse)
  console.log(timeUntil)
  const suffix = ctime<Number(publicIfoData.startPresaleTime) ? t('Start') : countdownToUse!==0 ? t('Finish'):"Finished"
  return (
    <Flex justifyContent="center" mb="32px">
      {publicIfoData.status ===-1 ? (
        <Skeleton animation="pulse" variant="rect" width="100%" height="48px" />
      ) : (
        <>
          <PocketWatchIcon width="48px" mr="16px" />
          <Flex alignItems="center">
            <Text bold mr="16px">        
              {suffix}:
            </Text>
            <Text>
              {t('%day%d %hour%h %minute%m', {
                day: timeUntil.days,
                hour: timeUntil.hours,
                minute: timeUntil.minutes,
              })}
            </Text>
           
          </Flex>
        </>
      )}
    </Flex>
  )
}

export default Timer
