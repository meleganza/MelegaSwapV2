import React from 'react'
import { useTranslation } from '@pancakeswap/localization'
import { Card, CardBody } from '@pancakeswap/uikit';
import 'config/constants/types';
import { PublicIfoData3 } from 'views/Ilos/types'
import '../types';
import IfoCardTokens from './IfoCardTokens'
import IfoCardActions from './IfoCardActions'
import IfoCardDetails from './IfoCardDetails'

interface IfoCardProps {

  publicIfoData: PublicIfoData3

}

interface CardConfig {
  [key: string]: {
    title: string
    variant: 'blue' | 'violet'
    tooltip: string
  }
}



const SmallCard: React.FC<IfoCardProps> = ({ publicIfoData }) => {
  useTranslation();


  return (
    <>
      <Card style={{ border: "1px solid #fff", borderRadius: "25px" }}>
        <CardBody>
          <IfoCardTokens
            publicIfoData={publicIfoData}
          />
          <IfoCardActions
            publicIfoData={publicIfoData}
          />
          <IfoCardDetails publicIfoData={publicIfoData} />
        </CardBody>
      </Card>
    </   >
  )
}

export default SmallCard
