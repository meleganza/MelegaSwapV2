import { Button, Card, Flex, Heading, Text, useModal, PageHeader, useToast } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import Page from 'components/Layout/Page'
import { useTranslation } from '@pancakeswap/localization'
import { useDNFTContract, useERC20, useNftMarketContract } from 'hooks/useContract'
import { startsWith } from 'lodash'
import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Link, Route, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { getDNFTAddress, getNftMarketAddress } from 'utils/addressHelpers'
import { getDNFTContract, getNftMarketContract } from 'utils/contractHelpers'
import { getBalanceAmount, getBalanceNumber, getDecimalAmount } from 'utils/formatBalance'

const StyledCard = styled(Card)`
  align-self: center;
  display: block;
  width: 360px;
  max-width: 80vw;
  margin: 10px;
  border-radius: 24px;
  border: 1px;
  border-style: solid;
  border-color: white;
  border-bottom-width: 3px;
`

const FarmCardInnerContainer = styled(Flex)`
  flex-direction: column;
  justify-content: space-around;

  padding: 24px;
`

const ExpandingWrapper = styled.div`
  padding: 24px;
  border-top: 2px solid ${({ theme }) => theme.colors.cardBorder};
  overflow: hidden;
`
class NFTModal {
  image = ''
  description = ''
  name = ''
  id = ''
}

const StyledButton = styled.a`
  background-color: white;
  color: black;
  border-radius: 16px;
  width: 100px;
  padding-top: 10px;
  height: 40px;
  font-size: 18px;
  border: none;
  cursor: pointer;
  &:hover {
   background-color: #ffffff;
  }
  &:active {
   background-color: #a5a5a5;
  }
`
const ViewNFTs: React.FC = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { toastSuccess } = useToast()
  const [mystate, setMystate] = useState<any>()
  const hist = useHistory()

  const wmarketcontract = useNftMarketContract(getNftMarketAddress())

  useEffect(() => {
    async function loadData() {
      const contract = getDNFTContract(getDNFTAddress())

      const gmarketcontract = getNftMarketContract(getNftMarketAddress())
      if (gmarketcontract) {
        const res = await gmarketcontract.getList()
        const alldata = []
        if (res.length === 0)
          setMystate(
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ border: '1px solid white', padding: '2rem' }}>
                <Text style={{ margin: '1rem' }}>No BabyMarco NFTs have been found in the marketplace yet.</Text>
                <a href="/nft">
                  <img style={{ width: 'auto', height: '3rem' }} alt="mint" src="/mint.png" />
                </a>
              </div>
            </div>,
          )
        else {
          for (let i = 0; i < res.length; i++) {
            const uri = await contract.tokenURI(res[i].tokenId)
            try {
              const resp = await axios.get(uri, {
                headers: {
                  'content-type': 'application/json',
                },
              })
              alldata.push(
                <StyledCard key={i} isActive={!false}>
                  <FarmCardInnerContainer>
                    <Flex justifyContent="space-between">
                      <Text>NFT Id:</Text>
                      <Text bold>{resp.data.name}</Text>
                    </Flex>
                    <br />
                    <Flex justifyContent="space-between">
                      <Text>Desc:</Text>
                      <Text bold>{resp.data.description.substring(8)}</Text>
                    </Flex>
                    <br />
                    <img
                      alt="nft"
                      src={'https://red-wonderful-stork-305.mypinata.cloud/ipfs/QmRqb3TUnbxjLPzJqhgKkzpysfFmdsvSdiUBqVYFCKSYxb/DOG'
                        .concat(res[i].tokenId.toString())
                        .concat('.png')}
                      onError={(err) => {
                        err.currentTarget.src = '/logo.png'
                      }}
                    />
                    <br />
                    <Flex justifyContent="space-between">
                      <Text>Selling Price</Text>
                      <Text>{Number(res[i].price) / 1000000000000000000} BABYMARCO</Text>
                    </Flex>
                    <br />
                    <Flex justifyContent="center">
                      <StyledButton href={`/nft/buy/BuyNFT?tid=${Number(res[i].tokenId)}`}>Buy</StyledButton>
                    </Flex>
                  </FarmCardInnerContainer>
                </StyledCard>,
              )
            } catch (e) {
              const resp = { nam: 'N/A', desc: 'N/A', img: 'N/A' }
              alldata.push(
                <StyledCard key={i} isActive={!false}>
                  <FarmCardInnerContainer>
                    <Flex justifyContent="space-between">
                      <Text>NFT Id:</Text>
                      <Text bold>{resp.nam}</Text>
                    </Flex>
                    <br />
                    <Flex justifyContent="space-between">
                      <Text>Desc:</Text>
                      <Text bold>{resp.desc}</Text>
                    </Flex>
                    <br />
                    <img
                      alt="nft"
                      src={'https://red-wonderful-stork-305.mypinata.cloud/ipfs/QmRqb3TUnbxjLPzJqhgKkzpysfFmdsvSdiUBqVYFCKSYxb/DOG'
                        .concat(res[i].tokenId.toString())
                        .concat('.png')}
                      onError={(err) => {
                        err.currentTarget.src = '/logo.png'
                      }}
                    />
                    <br />
                    <Flex justifyContent="space-between">
                      <Text>Selling Price</Text>
                      <Text>{Number(res[i].price) / 1000000000000000000} BABYMARCO</Text>
                    </Flex>
                    <br />
                    <Flex justifyContent="center">
                      <Button
                        onClick={async () => {
                          hist.push('/buyNFT?tid='.concat(Number(res[i].tokenId).toString()))
                          // // await currency.approve(getNftMarketAddress(),res[i].price)
                          // await wmarketcontract.sell(res[i].tokenId)
                        }}
                      >
                        Buy
                      </Button>
                    </Flex>
                  </FarmCardInnerContainer>
                </StyledCard>,
              )
            }
          }
          setMystate(alldata)
        }
      }
    }
    loadData()
  }, [t, toastSuccess, hist, wmarketcontract])

  return (
    <>
      <img alt="topbanner" src="/1920640.png" />
      <PageHeader background="black">
        <Heading as="h1" scale="xxl" color="secondary" mb="24px">
          {t('BabyMarco NFT Marketplace')}
        </Heading>
        <Heading scale="lg" color="text">
          {t('Buy and sell BabyMarco NFTs')}
        </Heading>
      </PageHeader>
      <Page style={{ textAlign: 'center', display: 'flex', flexWrap: 'wrap' }}>{mystate}</Page>
    </>
  )
}

export default ViewNFTs
