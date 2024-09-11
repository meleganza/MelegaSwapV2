/* eslint-disable jsx-a11y/alt-text */
import React, { useEffect, useState } from 'react'
import LaunchpadCard from './LaunchpadCard'
import { useNetwork } from 'wagmi'
import MultiCallAbi from '../config/MultiCallAbi.json'
import trophy1 from '../icons/1.png'
import trophy2 from '../icons/2.png'
import trophy3 from '../icons/3.png'
import { sortBy } from 'lodash'
import { publicClient, imageUrl } from '../utils/constants.ts'
import { multicallAddress } from '../utils/contracts.ts'

const RightPanel = () => {
  const [sortedList, setSortedList] = useState([])
  const [chadLists, setChadListData] = useState([])
  const { chain } = useNetwork()

  useEffect(() => {
    const FetchData = async () => {
      try {
        const getTrendingInfo = await publicClient.readContract({
          address: multicallAddress(chain?.id),
          abi: MultiCallAbi,
          functionName: 'funTrending'
        })
        if (Number(getTrendingInfo[0].length) > 0) {
          let funListsDatas = [];
          let funData;
          let trendingInfos = [];
          for (let i = 0; i < getTrendingInfo[0].length; i++) {
            if (Number(getTrendingInfo[0][i]) > 0) {
              funData = { name: getTrendingInfo[1][i], address: getTrendingInfo[2][i], trending: Number(getTrendingInfo[0][i]) };
              trendingInfos.push(Number(getTrendingInfo))
              funListsDatas.push(funData);
            }
          }
          trendingInfos.push(Number(getTrendingInfo))
          const sortedList = sortBy(funListsDatas, ['trending']).reverse();
          setSortedList(sortedList)
        }
      } catch (e) {
        console.error(e)
      }
    }
    FetchData()
  }, [chain?.id])

  useEffect(() => {
    const FetchData = async () => {
      try {
        if (sortedList.length > 0) {
          let j;
          let addresses = [];
          if (sortedList.length > 3) {
            j = 3
          } else {
            j = sortedList.length;
          }
          for (let i = 0; i < j; i++) {
            addresses.push(sortedList[i].address)
          }
          const mainInfo = await publicClient.readContract({
            address: multicallAddress(chain?.id),
            abi: MultiCallAbi,
            functionName: 'getTopMainInfo',
            args: [addresses]
          })
          const otherInfo = await publicClient.readContract({
            address: multicallAddress(chain?.id),
            abi: MultiCallAbi,
            functionName: 'getTopOtherInfo',
            args: [addresses]
          })
          let chadListsData = []
          let chadData
          if (mainInfo[0].length > 0) {
            for (let i = mainInfo[0].length - 1; i >= 0; i--) {
              let progress
              const contractAddress = mainInfo[4][i]
              const virtualLpAmounts = Number(mainInfo[1][i])
              const virtualLpTokenAmounts = Number(mainInfo[0][i]) / 10 ** 18
              const tokenPrice = Number(mainInfo[2][i])
              const marketCap = (tokenPrice * 1000000000) / 10 ** 12
              const website = otherInfo[2][i]
              const twitter = otherInfo[3][i]
              const telegram = otherInfo[4][i]
              progress =
                ((800000000 - (Number(virtualLpTokenAmounts) - 200000000)) * 100) / 800000000
              const liquidity = virtualLpAmounts
              const name = otherInfo[0][i]
              let logoUrl = imageUrl + contractAddress + '-logo.png'
              let bannerUrl = imageUrl + contractAddress + '-banner.png'
              let blockchainLogoUrl = '/blockchain.svg'
              let devAddress = mainInfo[5][i]
              let dexAddress = 'https://app.uniswap.org/swap'
              let dexName = 'Trader Joe'
              chadData = {
                progress: progress,
                Liquidity: liquidity,
                tokenName: name,
                logoUrl: logoUrl,
                bannerUrl: bannerUrl,
                address: mainInfo[4][i],
                depositedAmount: Number(mainInfo[3][i]) / 10 ** 18,
                contractAddress: contractAddress,
                dexAddress: dexAddress,
                devAddress: devAddress,
                dexName: dexName,
                marketCap: marketCap,
                website: website,
                twitter: twitter,
                telegram: telegram,
                blockchainLogoUrl: blockchainLogoUrl
              }
              chadListsData.push(chadData)
            }
          }
          setChadListData(chadListsData)
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (sortedList.length > 0) {
      FetchData()
    }
  }, [sortedList])

  return (
    <div className="right-panel">
      <p className="ContractContentTextTitle h1">Hall of Fame</p>
      <div className="right-panel-container">
        {chadLists.map(
          (
            {
              progress,
              Liquidity,
              tokenName,
              logoUrl,
              bannerUrl,
              address,
              depositedAmount,
              contractAddress,
              dexAddress,
              devAddress,
              dexName,
              marketCap,
              website,
              twitter,
              telegram,
              blockchainLogoUrl
            },
            i
          ) => (
            <div className="relative">
              <img src={i === 0 ? trophy1 : i === 1 ? trophy2 : trophy3} className="trophy absolute" width="64px" alt="" />
              <LaunchpadCard
                progress={progress}
                Liquidity={Liquidity}
                tokenName={tokenName}
                Logo={<img src={logoUrl} className="claim-card-logo" />}
                Banner={bannerUrl}
                chadAddress={address}
                depositedAmount={depositedAmount}
                contractAddress={contractAddress}
                dexAddress={dexAddress}
                devAddress={devAddress}
                dexName={dexName}
                marketCap={marketCap}
                website={website}
                twitter={twitter}
                telegram={telegram}
                BlockchainLogo={
                  <img
                    src={blockchainLogoUrl}
                    className="launchpad-blockchain-logo"
                  />
                }
              />
              <br />
              <br />
              <br />
            </div>
          )
        )}
      </div>
    </div>
  )
}

export default RightPanel
