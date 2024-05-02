import { ChainId } from '@pancakeswap/sdk'
import { CHAIN_IDS } from 'utils/wagmi'
import Swap from 'views/Swap'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import { Card, Heading, useModal, useToast } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import { BigNumber } from '@ethersproject/bignumber'
import ConnectWalletButton from 'components/ConnectWalletButton'
import { useTranslation } from '@pancakeswap/localization'
import { useDNFTContract, useERC20 } from 'hooks/useContract'
import { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { getDNFTAddress } from 'utils/addressHelpers'
import { getBep20Contract, getDNFTContract } from 'utils/contractHelpers'
import { bscTokens } from '@pancakeswap/tokens'
import MintModal from 'pages/nft/MintModal'
import Timer from 'pages/nft/Timer'

import React from 'react'
import styled from 'styled-components'
import PageSection from 'components/PageSection'
import { Button, Flex, Text, PageHeader } from '@pancakeswap/uikit'
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import AliceCarousel from 'react-alice-carousel'
import 'react-alice-carousel/lib/alice-carousel.css'
import { Link } from 'react-router-dom'
import Hero from './components/Hero'
import Page from 'components/Layout/Page'
import { swapSectionData, earnSectionData, cakeSectionData } from './components/SalesSection/data'
import MetricsSection from './components/MetricsSection'
import SalesSection from './components/SalesSection'
import WinSection from './components/WinSection'
import FarmsPoolsRow from './components/FarmsPoolsRow'
import Footer from './components/Footer'
import CakeDataRow from './components/CakeDataRow'
import { WedgeTopLeft, InnerWedgeWrapper, OuterWedgeWrapper, WedgeTopRight } from './components/WedgeSvgs'
import UserBanner from './components/UserBanner'
import FarmAuctionsBanner from './components/Banners/FarmAuctionsBanner'


const Nft: React.FC = () => {
  const { t } = useTranslation()
  const [amountMint, setAmountMint] = useState(1)
  const [userquota, setUserquota] = useState(0)
  const writeContract = useDNFTContract(getDNFTAddress())
  const { account } = useWeb3React()
  const [costMint, setCostMint] = useState('0')
  const [maxmint, setMaxmint] = useState('0')
  const [isdisable, setIsdisable] = useState(true)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const pageRef = useRef(null)
  
  const [containerWidth, setContainerWidth] = React.useState('')

  useEffect(() => {
    const handleResize = () => {
      const newContainerWidth = window.innerWidth > 968 ? `calc(100vw - 280px)` : `calc(100vw - 10px)`
      setContainerWidth(newContainerWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
 
    // Clean up the event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize)
    }
   }, [])

  useEffect(() => {
    async function loadData() {
      const contract = getDNFTContract(getDNFTAddress())
      const ispause = await contract.paused.call(account)
      const cost = await contract.costPublic.call(account)
      const max = await contract.maxMintAmount.call(account)
      setCostMint(''.concat(cost.toString()))
      setMaxmint(''.concat(max.toString()))

      if (account) {
        const uquota = await contract.userquota(account)
        setUserquota(uquota)
        const currencyETH = getBep20Contract(bscTokens.babymarco.address)
        const mybal = await currencyETH.balanceOf(account)
        // console.log(max - uquota !== 0, !ispause, account, mybal.toString(), costMint, amountMint)
        if (max.sub(uquota).toNumber() !== 0 && !ispause && Number(mybal) >= Number(costMint) + Number(amountMint))
          setIsdisable(false)
        else setIsdisable(true)
      }
    }

    loadData()
  }, [account])

  const handleContributeSuccess = async (amount: BigNumber) => {
    const { toastSuccess } = useToast()
    toastSuccess(t('Success!'), t('You have contributed to this IFO!'))
  }

  {
    const [onPresentContributeModal] = useModal(
      <MintModal costMint={costMint} qty={amountMint} onSuccess={handleContributeSuccess} />,
      false,
    )
  }

  const items = [
    <a href="/farms">
      <img className="item" alt="b1" src="./banners/b1.png" />
    </a>,
    <a href="/ilo">
      <img className="item" alt="b3" src="./banners/b3.png" />
    </a>,
    <a href="https://www.melega.finance/apply">
      <img className="item" alt="b2" src="./banners/b2.png" />
    </a>,
  ]
  const items2 = [
    <a href="/pools">
      <img className="item" alt="b1" src="./banners/sb1.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b2" src="./banners/sb2.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b4" src="./banners/sb4.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b5" src="./banners/sb5.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b6" src="./banners/sb6.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b7" src="./banners/sb7.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b8" src="./banners/sb8.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b9" src="./banners/sb9.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b10" src="./banners/sb10.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b11" src="./banners/sb11.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b12" src="./banners/sb12.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b13" src="./banners/sb13.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b14" src="./banners/sb14.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b15" src="./banners/sb15.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b16" src="./banners/sb16.png" />
    </a>,
    <a href="/pools">
      <img className="item" alt="b17" src="./banners/sb17.png" />
    </a>,
  ]
  const responsive = {
    1024: {
      items: 3,
      itemsFit: 'contain',
    },
  }
  const responsive2 = {
    1024: {
      items: 4,
      itemsFit: 'contain',
    },
  }

  return (
    <>
      <PageHeader background="black">
        <SalesSection {...swapSectionData} />
      </PageHeader>

      <div ref={pageRef} style={{ margin: "0" }}>
      <Page
        style={{
          textAlign: 'center',
          maxWidth: '1920px',
          width: containerWidth,
        }}
      >
        <AliceCarousel
          name="banner"
          disableButtonsControls={true}
          disableDotsControls={true}
          responsive={responsive}
          autoPlay={true}
          items={items}
        />
        <div style={{ margin: '1.5rem' }}>
          <FarmsPoolsRow />
        </div>
        <div>
          <AliceCarousel
            name="subbanner"
            disableButtonsControls={true}
            disableDotsControls={true}
            responsive={responsive2}
            autoPlay={true}
            autoPlayInterval={0}
            animationDuration={2000}
            infinite={true}
            items={items2}
          />
        </div>
        <br />

        <CakeDataRow />
      </Page>
      </div>
    </>
  )
}

export default Nft
