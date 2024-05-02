import React, { useEffect, useState } from 'react'
import styled from 'styled-components'
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardRibbon,
  ExpandableButton,
  Progress,
  Button,
  ChevronUpIcon,
} from '@pancakeswap/uikit'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@pancakeswap/wagmi'
import { PublicIfoData3 } from 'views/Ilos/types'
import { useERC20 } from 'hooks/useContract'
import { useToast } from '@pancakeswap/uikit'
import { Address } from 'config/constants/types'
import { useTranslation } from '@pancakeswap/localization'
import { getAddress } from 'utils/addressHelpers'
import { bscTokens } from '@pancakeswap/tokens'
import { getFullDisplayBalance } from 'utils/formatBalance'
import { EnableStatus } from './types'
import IfoPoolCard from './IfoPoolCard'
import Timer from './Timer'
import Achievement from './Achievement'



interface IfoFoldableCardProps {
  publicIfoData: PublicIfoData3
}

const getRibbonComponent = (status: string, t: any) => {
  if (status === 'cancelled') {
    return <CardRibbon variantColor="textDisabled" ribbonPosition="left" text={t(status)} />
  }


  return (
    <CardRibbon
      variantColor="primary"
      ribbonPosition="left"
      style={{ textTransform: 'uppercase' }}
      text={`${t(status)}!`}
    />
  )


}

const StyledCard = styled(Card)`
  max-width: 736px;
  width: 100%;
  margin: auto;
  border: 1px solid #fff;
  border-radius: 24px;
  border-bottom-width: 3px;
`

const Header = styled(CardHeader)`
  display: flex;
  justify-content: flex-end;
  align-items: center;
  height: 112px;
  background-repeat: no-repeat;
  background-position: center;
  background:#000000;
`

const FoldableContent = styled.div<{ isActive: boolean }>`
  display: block;
  background: ${({ isActive, theme }) => (isActive ? theme.colors.darkColor : theme.colors.primary)};
`

const CardsWrapper = styled.div<{ singleCard: boolean }>`
  display: block;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: 32px;
  ${({ theme }) => theme.mediaQueries.md} {
    margin-left: 25%;
    margin-right: 25%;
    justify-items: ${({ singleCard }) => (singleCard ? 'center' : 'unset')};
  }
`

const StyledCardBody = styled(CardBody)`
  padding: 24px 16px;
  ${({ theme }) => theme.mediaQueries.md} {
    padding: 24px;
  }
`

const StyledCardFooter = styled(CardFooter)`
  text-align: center;
  padding: 8px;
  background: ${({ theme }) => theme.colors.backgroundAlt};
`

const IfoFoldableCard: React.FC<IfoFoldableCardProps> = ({ publicIfoData }) => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const ctime = Number((new Date().getTime() / 1000).toFixed(0));
  const countdownToUse = ctime < Number(publicIfoData.startPresaleTime) ? Number(publicIfoData.startPresaleTime) - ctime : ctime < Number(publicIfoData.endPresaleTime) ? ctime - Number(publicIfoData.endPresaleTime) : 0

  const Ribbon = getRibbonComponent(countdownToUse !== 0 && Number(publicIfoData.status) === -1 ? 'cancelled' : ctime < Number(publicIfoData.startPresaleTime) && Number(publicIfoData.status) === 0 ? 'coming soon' : countdownToUse !== 0 && Number(publicIfoData.status) === 0 ? 'live' : countdownToUse !== 0 && Number(publicIfoData.status) === 1 ? "live" : countdownToUse === 0 || Number(publicIfoData.status) === 2 ? "finished" : "", t)
  const isActive = publicIfoData.status !== 2 && publicIfoData.status !== -1

  const { toastSuccess } = useToast()

  return (
    <StyledCard >
      <Header >
        <img style={{ height: "100px", width: "auto" }} alt='mainlogo' src={publicIfoData.headerlogo} />
      </Header>
      <FoldableContent isActive={publicIfoData.status !== -1 && publicIfoData.status !== 2}>
        {isActive && <Progress variant="flat" primaryStep={100 * (publicIfoData.sold / publicIfoData.softcap)} />}
        <StyledCardBody>
          {isActive && <Timer publicIfoData={publicIfoData} />}
          <div style={{ textAlign: "center" }}>
            <p>Note: To Purchase {publicIfoData.symbol} Directly, there will be three transaction confirmations that you will need to approve on Metamask. Please Approve all 3 for BNB purchases. Once these transactions are Approved, the deal will be completed. Once you have successfully completed the purchase of {publicIfoData.symbol} Tokens and approved all three transactions on your metamask wallet, You will receive your {publicIfoData.symbol} Tokens directly to the wallet address you used in the purchase. Thank you and Welcome to {publicIfoData.symbol} Town!</p>
            <br />
            <h1 style={{ fontSize: "larger" }}>{publicIfoData._name}</h1>
            {
              /*  publicIfoData.maxUserAmount.toString()==="0"?<h1>No Limit</h1>:<div><h1>Limit</h1>&nbsp;{getFullDisplayBalance(new BigNumber(publicIfoData.maxUserAmount),18,2).concat(" BNB per User")}</div>  */
            }
          </div>
          <br />
          <CardsWrapper singleCard={!false}>
            <IfoPoolCard
              publicIfoData={publicIfoData}
            />
          </CardsWrapper>
          <Achievement publicIfoData={publicIfoData} />
        </StyledCardBody>

      </FoldableContent>
    </StyledCard>
  )
}

export default IfoFoldableCard
