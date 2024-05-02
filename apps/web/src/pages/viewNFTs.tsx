import { Button, Card, Flex, Heading, Text, useModal, PageHeader, useToast } from '@pancakeswap/uikit'
import { useWeb3React } from '@pancakeswap/wagmi'
import axios from 'axios'
import BigNumber from 'bignumber.js'
import ConnectWalletButton from 'components/ConnectWalletButton'
import Page from 'components/Layout/Page'
import { useTranslation } from '@pancakeswap/localization'
import { useDNFTContract } from 'hooks/useContract'
import React, { useEffect, useCallback, useState, useMemo, useRef } from 'react'
import { Link, Route, useHistory } from 'react-router-dom'
import styled from 'styled-components'
import { getDNFTAddress } from 'utils/addressHelpers'
import { getDNFTContract } from 'utils/contractHelpers'
// import SellModal from './sell/SellModal'

const StyledCard = styled(Card)`
  align-self: center;
  display: block;
  width: 360px;
  margin: 10px;
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

const ViewNFTs: React.FC = () => {
  const { t } = useTranslation()
  const { account } = useWeb3React()
  const { toastError, toastSuccess } = useToast()
  const [mystate, setMystate] = useState<any>()
  const [sellPrice, setSellPrice] = useState(0)
  const hist = useHistory()

  useEffect(() => {
    async function loadData() {
      const contract = getDNFTContract(getDNFTAddress())
      if (account) {
        const nftsids = await contract.walletOfOwner(account)
        const len = nftsids.length

        const alldata = []
        if (len === 0)
          setMystate(
            <div style={{ textAlign: 'center', width: '100%' }}>
              <div style={{ border: '1px solid white', padding: '2rem' }}>
                <Text style={{ margin: '1rem' }}>No BabyMarco NFTs have been found in your wallet yet.</Text>
                <a href="/nft">
                  <img style={{ width: 'auto', height: '3rem' }} alt="mint" src="/mint.png" />
                </a>
              </div>
            </div>,
          )
        else {
          for (let i = 0; i < len; i++) {
            const uri = await contract.tokenURI(nftsids[i])
            console.log(nftsids[i])
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
                        .concat(nftsids[i].toString())
                        .concat('.png')}
                      onError={(err) => {
                        err.currentTarget.src = '/logo.png'
                      }}
                    />
                    <br />

                    <Flex justifyContent="center">
                      <Button onClick={() => hist.push('/sellNFT?tid='.concat(Number(nftsids[i]).toString()))}>
                        View
                      </Button>
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
                        .concat(nftsids[i].toString())
                        .concat('.png')}
                      onError={(err) => {
                        err.currentTarget.src = '/logo.png'
                      }}
                    />
                    <br />

                    <Flex justifyContent="center">
                      <Button onClick={() => hist.push('/sellNFT?tid='.concat(Number(nftsids[i]).toString()))}>
                        View
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
    if (account) loadData()
    else
      setMystate(
        <div style={{ textAlign: 'center', width: '100%' }}>
          <ConnectWalletButton />
        </div>,
      )
  }, [account])

  return (
    <>
      <img alt="topbanner" src="/1920640.png" />
      <PageHeader background="black">
        <Heading as="h1" scale="xxl" color="secondary" mb="24px">
          {t('BabyMarco NFT Wallet')}
        </Heading>
        <Heading scale="lg" color="text">
          {t('Here you will find all your minted or bought BabyMarco NFTs')}
        </Heading>
      </PageHeader>
      <Page style={{ textAlign: 'center', display: 'flex', flexWrap: 'wrap' }}>{mystate}</Page>
    </>
  )
}

export default ViewNFTs
