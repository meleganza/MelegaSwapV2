import { Button, Card, Flex, Heading, Text, useModal, PageHeader, useToast } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import Page from 'components/Layout/Page'
import { useTranslation } from "@pancakeswap/localization";
import { useDNFTContract, useNftMarketContract } from 'hooks/useContract'
import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Route, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { getDNFTAddress, getNftMarketAddress } from 'utils/addressHelpers'
import { getDNFTContract, getNftMarketContract } from 'utils/contractHelpers'
import SellModal from './SellModal'

const StyledCard = styled(Card)`
  align-self: center;
  display: block;
  width: 500px;
  margin: auto;
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

const SellNFT: React.FC = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { toastError, toastSuccess } = useToast()
  const [mystate, setMystate] = useState<any>()
  const [isOnSale, setIsOnSale] = useState(false)
  const [sellPrice, setSellPrice] = useState(0)
  const marketcontract = useNftMarketContract(getNftMarketAddress())
  const hist = useHistory()
  const tid = new URLSearchParams(hist.location.search).get('tid')

  const handleContributeSuccess = async (amount: BigNumber) => {
    toastSuccess(t('Success!'), t('You have contributed to this Market!'))
  }
  const [onPresentContributeModal] = useModal(<SellModal tid={Number(tid)} onSuccess={handleContributeSuccess} />)

  useEffect(() => {
    async function loadData() {
      const contract = getDNFTContract(getDNFTAddress())

      const res = await marketcontract.NftInfos(tid)
      setIsOnSale(res.isOnSale)
      setSellPrice(Number(res.price))
      if (account) {
        const uri = await contract.tokenURI(Number(tid))
        try {
          const resp = await axios.get(uri, {
            headers: {
              'content-type': 'application/json',
            },
          })
          setMystate(
            <StyledCard isActive={!false}>
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
                    .concat(tid)
                    .concat('.png')}
                  onError={(err) => {
                    err.currentTarget.src = '/logo.png'
                  }}
                />
                <br />
                <Flex justifyContent="space-between">
                  <Text>Selling Price</Text>
                  <Text>{Number(res.price) / 1000000000000000000} BABYMARCO</Text>
                </Flex>
                <br />
                <Flex justifyContent="space-between">
                  <Button display={isOnSale ? 'none' : 'block'} onClick={onPresentContributeModal}>
                    List
                  </Button>
                  <Button
                    display={isOnSale ? 'block' : 'none'}
                    onClick={async () => {
                      try {
                        const tx = await marketcontract.listNFT(tid, 0, false)
                        const receipt = await tx.wait()
                        if (receipt.status) {
                          toastSuccess(t('Delisted'), t('NFT is delisted in the market'))
                        }
                      } catch (error) {
                        toastError(t('Error'), t('You are not allowed.'))
                      }
                    }}
                  >
                    Delist
                  </Button>

                  {/* <Button disabled={isOnSale} onClick={onPresentContributeModal2}>Stake</Button> */}
                </Flex>
              </FarmCardInnerContainer>
            </StyledCard>,
          )
        } catch (e) {
          const resp = { nam: 'N/A', desc: 'N/A', img: 'N/A' }
          setMystate(
            <StyledCard isActive={!false}>
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
                    .concat(tid)
                    .concat('.png')}
                  onError={(err) => {
                    err.currentTarget.src = '/logo.png'
                  }}
                />
                <br />
                <Flex justifyContent="space-between">
                  <Text>Selling Price</Text>
                  <Text>{Number(res.price) / 1000000000000000000} BABYMARCO</Text>
                </Flex>
                <br />
                <Flex justifyContent="space-between">
                  <Button display={isOnSale ? 'none' : 'block'} onClick={onPresentContributeModal}>
                    List
                  </Button>
                  <Button
                    display={isOnSale ? 'block' : 'none'}
                    onClick={async () => {
                      try {
                        const tx = await marketcontract.listNFT(tid, 0, false)
                        const receipt = await tx.wait()
                        if (receipt.status) {
                          toastSuccess(t('Delisted'), t('NFT is delisted in the market'))
                        }
                      } catch (error) {
                        console.log(error)
                        toastError(t('Error'), t('You are not allowed.'))
                      }
                    }}
                  >
                    Delist
                  </Button>

                  {/* <Button disabled={isOnSale} onClick={onPresentContributeModal2}>Stake</Button> */}
                </Flex>
              </FarmCardInnerContainer>
            </StyledCard>,
          )
        }
      }
    }
    loadData()
  }, [account, sellPrice, t, toastSuccess, hist, onPresentContributeModal, tid, isOnSale, toastError, marketcontract])

  return (
    <>
      <img alt="topbanner" src="/1920640.png" />
      <PageHeader>
        <Heading as="h1" scale="xxl" color="secondary" mb="24px">
          {t('NFTs')}
        </Heading>
        <Heading scale="lg" color="text">
          {t('View or Sell your NFTs')}
        </Heading>
      </PageHeader>
      <Page style={{ textAlign: 'center', display: 'flex' }}>{mystate}</Page>
    </>
  )
}

export default SellNFT
