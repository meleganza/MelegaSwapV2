/* eslint-disable jsx-a11y/anchor-is-valid */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-undef */
import React, { useState, useEffect } from 'react'
import Cookies from 'universal-cookie';
import { useAccount, useNetwork, useSwitchNetwork } from 'wagmi'
import '../App.css'
import ChadAbi from '../config/ChadPumpAbi.json'
import TokenAbi from '../config/TokenAbi.json'
import RouterAbi from '../config/RouterAbi.json'
import '../styles/MainContainer.css'
import MaxInput from '../components/MaxInput.tsx'
import { readContract, writeContract } from '@wagmi/core'
import { waitForTransaction } from '@wagmi/core'
import { useWeb3Modal } from '@web3modal/react'
import Web3 from 'web3'
import { toast } from 'react-hot-toast'
import Footer from '../components/Footer'
import ClaimCard from '../components/ClaimCard.jsx'
import ethIcon from '../icons/ETH-logo.svg'
import swapIcon from '../icons/swapIcon.svg'
import TopBar from '../components/TopBar'
import ClipLoader from 'react-spinners/ClipLoader'
import { useQueryParam, StringParam } from 'use-query-params'
import MyChart from '../components/Chart.jsx'
import { SignMessage } from './SignMessage.jsx'
import CustomRadioButton from '../components/CustomRadioButton'
import CopyIcon from '../icons/copy.svg'
import rot13 from '../../utils/encode.ts'
import { Link } from 'react-router-dom'
import { web3Clients, imageUrl, apiUrl, ethPriceApiUrl } from '../utils/constants.ts'
import { getWethAddress, getRouterAddress, getDefaultAddress } from '../utils/addressHelpers.ts'
import Moralis from 'moralis';

const App = () => {
  let [addressDatas] = useQueryParam('address', StringParam)
  let ChadAddress
  let ref
  if (addressDatas.includes('/?ref=')) {
    ChadAddress = addressDatas.split('/?ref=')[0]
    ref = addressDatas.split('/?ref=')[1]
  } else {
    ChadAddress = addressDatas
  }
  let [chainId] = useQueryParam('chain', StringParam);
  const { switchNetwork } = useSwitchNetwork()
  const { address, isConnected } = useAccount()
  const { chain } = useNetwork()
  const [tokenName, setTokenName] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [tokenAddress, setTokenAddress] = useState('')
  const tokenLogo = imageUrl + ChadAddress + '-logo.png'
  const tokenBanner = imageUrl + ChadAddress + '-banner.png'
  const [virtualLp, setVirtualLiquidiity] = useState(0)
  const [maxBuyAmount, setMaxBuyAmount] = useState(0)
  const [chatHistory, setChatHistory] = useState([])
  const [chatContent,] = useState('')
  const [tokenAmount, setAmount] = useState(0)
  const [tokenOutAmount, setTokenOutAmount] = useState(0)
  let [accountBalance, setAccountBalance] = useState(0)
  let [inputBalance, setInputBalance] = useState(0)
  let [tokenBalance, setTokenBalance] = useState(0)
  let [tokenAllowance, setTokenAllowance] = useState(0)
  const [virtualTokenLp, setVirtualTokenLp] = useState()
  const [tokenPrice, setTokenPrice] = useState(0)
  let [creating, setCreating] = useState(false)
  const [website, setWebsite] = useState()
  const [twitter, setTwitter] = useState()
  const [telegram, setTelegram] = useState()
  const [inputToken, setInputToken] = useState('ETH')
  const [tokenHolders, setTokenHolders] = useState([])
  const [holderDatas, setTokenHolderDatas] = useState()
  const [transactions, setTransactions] = useState([])
  const [transactionDatas, setTransactionDatas] = useState([])
  const [tokenPriceDatas, setTokenPriceDatas] = useState()
  const [volume, setVolume] = useState(0)
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)
  const [contractAddress, setContractAddress] = useState('')
  const [devAddress, setDevAddress] = useState('')
  const [description, setDescription] = useState('')

  const [refCounts, setRefCounts] = useState(0)
  const [totalRefAmounts, setTotalRefAmounts] = useState(0)
  const [refUserAmount, setRefUserAmout] = useState(0)

  const [lpCreated, setLpCreated] = useState(false)
  const [ethPrice, setEthPrice] = useState()
  const { open } = useWeb3Modal()

  const [firstConnect, setFirstConnect] = useState(false)

  const onConnectWallet = async () => {
    await open()
    setFirstConnect(true)
  }

  useEffect(() => {
    const reloadWindow = async () => {
      try {
        window.location.reload()
      } catch (e) {
        console.error(e)
      }
    }
    if (isConnected === true && firstConnect === true) reloadWindow()
  }, [isConnected, firstConnect])

  const cookies = new Cookies();
  if (ref) {
    if (Web3.utils.isAddress(rot13(ref))) {
      cookies.set('ref', ref)
    }
  }
  let refAddress
  if (cookies.get('ref')) {
    if (Web3.utils.isAddress(rot13(cookies.get('ref')))) {
      refAddress = rot13(cookies.get('ref'))
    }
  } else {
    refAddress = getDefaultAddress(chainId)
  }
  const BASE_URL = 'https://blackpump.fun/buy/?chain=' + chainId + '&address=' + ChadAddress
  const referlink = address ? `${BASE_URL}/?ref=${rot13(address)}` : `${BASE_URL}/?ref=`

  const copyAddress = address => async e => {
    e.stopPropagation()
    e.preventDefault()
    if (document.queryCommandSupported('copy')) {
      const ele = document.createElement('textarea')
      ele.value = address
      document.body.appendChild(ele)
      ele.select()
      document.execCommand('copy')
      document.body.removeChild(ele)
      displayTooltip()
    }
  }

  function displayTooltip() {
    let timeoutId
    setIsTooltipDisplayed(true)
    timeoutId = setTimeout(() => {
      setIsTooltipDisplayed(false)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }

  const onTokenSwap = async () => {
    try {
      setCreating(true)
      let swap
      let sendData;
      if (inputToken === 'ETH') {
        if (lpCreated) {
          const path = [getWethAddress(chainId), tokenAddress]
          const timestamp = (new Date().getTime() / 1000) + 300;
          swap = await writeContract({
            address: getRouterAddress(chainId),
            abi: RouterAbi,
            functionName: 'swapExactETHForTokensSupportingFeeOnTransferTokens',
            value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
            args: [0, path, address, timestamp.toFixed(0)],
            chainId: Number(chainId)
          })
        } else {
          if (tokenOutAmount + Number(tokenBalance) > 1000000000 * maxBuyAmount / 100) {
            toast.error("You can't purchase more than max buy limit")
            setCreating(false)
            return;
          }
          swap = await writeContract({
            address: ChadAddress,
            abi: ChadAbi,
            functionName: 'buyToken',
            value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
            args: [refAddress],
            chainId: Number(chainId)
          })
        }
        await waitForTransaction({
          hash: swap.hash
        })
        sendData = {
          buyer: address,
          type: 'bought',
          name: tokenName,
          amount: tokenAmount,
          token: tokenAddress,
          contract: contractAddress,
          timestamp: (Date.now() / 1000).toFixed(0)
        }
      } else {
        if (tokenAllowance > 0) {
          if (lpCreated) {
            const path = [tokenAddress, getWethAddress(chainId)]
            const timestamp = (new Date().getTime() / 1000) + 300;
            swap = await writeContract({
              address: getRouterAddress(chainId),
              abi: RouterAbi,
              functionName: 'swapExactTokensForETHSupportingFeeOnTransferTokens',
              value: web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'),
              args: [0, path, address, timestamp.toFixed(0)],
              chainId: Number(chainId)
            })
          } else {
            if (tokenAmount > 1000000000 * maxBuyAmount / 100) {
              toast.error("You can't sell more than max sell limit")
              setCreating(false)

              return;
            }

            swap = await writeContract({
              address: ChadAddress,
              abi: ChadAbi,
              functionName: 'sellToken',
              args: [web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'), refAddress],
              chainId: Number(chainId)
            })
          }

          await waitForTransaction({
            hash: swap.hash
          })
          sendData = {
            chainId,
            buyer: address,
            type: 'Sold',
            name: tokenName,
            amount: tokenAmount,
            token: tokenAddress,
            contract: contractAddress,
            timestamp: (Date.now() / 1000).toFixed(0)
          }
        } else {
          let max =
            '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          let approve
          let approveAddress;
          if (lpCreated) {
            approveAddress = getRouterAddress(chainId)
          } else {
            approveAddress = ChadAddress
          }
          approve = await writeContract({
            address: tokenAddress,
            abi: TokenAbi,
            functionName: 'approve',
            args: [approveAddress, max],
            chainId: Number(chainId)
          })
          await waitForTransaction({
            hash: approve.hash
          })
        }
        setInputToken(inputToken)
      }
      if (sendData) {
        const response = await fetch(apiUrl + '/api/addHistory', {
          method: 'POST',
          mode: 'cors',
          cache: 'no-cache',
          headers: {
            'Content-Type': 'application/json'
          },
          redirect: 'error',
          body: JSON.stringify(sendData)
        })
        if (response.status !== 200) {
          const { error } = await response.json()
          throw new Error(error)
        }
      }
      setTimeout(function () {
        setCreating(false)
      }, 3000)
      toast.success(`Successfully ${Number(tokenAmount).toFixed(4)}   ${inputToken !== 'ETH' ? tokenName : 'BNB'} swapped`)
    } catch (err) {
      if (tokenOutAmount + Number(tokenBalance) > 1000000000 * maxBuyAmount / 100) {
        const remainTokenAmount = 1000000000 * maxBuyAmount / 100 - Number(tokenBalance);
        toast.error("You can't purchase more than " + remainTokenAmount.toLocaleString() + ' ' + tokenName)
      } else {
        toast.error('There is a problem with your Swap. Please try again later')
      }
      setCreating(false)
    }
  }

  useEffect(() => {
    const FetchData = async () => {
      try {
        await fetch(
          ethPriceApiUrl[chainId],
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          setEthPrice(data.USD)
        })

        const ChadInfo = await readContract({
          address: ChadAddress,
          abi: ChadAbi,
          functionName: 'getFunBasicInfo',
          chainId: Number(chainId)
        })

        const GetAllPrices = await readContract({
          address: ChadAddress,
          abi: ChadAbi,
          functionName: 'getAllPrices',
          chainId: Number(chainId)
        })
        
        setTokenPriceDatas(GetAllPrices)
        setTokenName(ChadInfo[1][0])
        setTokenSymbol(ChadInfo[1][1])
        setTokenAddress(ChadInfo[2][1])
        setVirtualLiquidiity(Number(ChadInfo[0][5]) / 10 ** 18)
        setVirtualTokenLp(Number(ChadInfo[0][4]) / 10 ** 18)
        setTokenPrice(Number(ChadInfo[0][8]))
        setMaxBuyAmount(Number(ChadInfo[0][2]))
        setWebsite(ChadInfo[1][2])
        setTwitter(ChadInfo[1][3])
        setTelegram(ChadInfo[1][4])
        setVolume(Number(ChadInfo[0][9]))
        setContractAddress(ChadInfo[2][0])
        setDevAddress(ChadInfo[2][2])
        setRefCounts(Number(ChadInfo[0][7]))
        setTotalRefAmounts(Number(ChadInfo[0][6]) / 10 ** 18)
        setDescription(ChadInfo[1][6])
        setLpCreated(ChadInfo[4])
        if (address) {
          let accountBalance = await web3Clients[chainId].eth.getBalance(address)
          accountBalance = web3Clients[chainId].utils.fromWei(accountBalance, 'ether')
          setAccountBalance(accountBalance)
          if (inputToken === 'ETH') {
            setInputBalance(accountBalance)
          } else {
            setInputBalance(tokenBalance)
          }
          const refUserAmounts = await readContract({
            address: ChadAddress,
            abi: ChadAbi,
            functionName: 'refAmounts',
            args: [address],
            chainId: Number(chainId)
          })
          setRefUserAmout(Number(refUserAmounts) / (10 ** 18))
        }
      } catch (e) {
        console.error(e)
      }
    }
    if (creating === false) {
      FetchData()
    }
  }, [chainId, creating, ChadAddress, address, web3Clients[chainId].eth, web3Clients[chainId].utils, inputToken, tokenBalance])

  const getApi = async () => {
    const GetAllPrices = await readContract({
      address: ChadAddress,
      abi: ChadAbi,
      functionName: 'getAllPrices',
      chainId: Number(chainId)
    })
    setTokenPriceDatas(GetAllPrices)

    try {
      await fetch(
        ethPriceApiUrl[chainId],
        {
          method: 'GET'
        }
      ).then(async res => {
        let data = await res.json()
        setEthPrice(data.USD)
      })
    } catch (e) {
      console.error(e)
    }

    try {
      await fetch(
        apiUrl + `/api/getOne/${ChadAddress}`,
        {
          method: 'GET'
        }
      ).then(async res => {
        let data = await res.json()
        if (!data.message) {
          let history
          let historyData = []
          for (let i = 0; i < data?.length; i++) {
            let sender = data[i].sender
            let content = data[i].content
            let currentDate = Date.now()
            let date = currentDate / 1000 - Number(data[i].timestamp)
            if (date > 86400) {
              date = (date / 86400).toFixed(0) + ' days ago'
            } else if (date > 3600) {
              date = (date / 3600).toFixed(0) + ' hours ago'
            } else if (date > 0) {
              date = (date / 60).toFixed(0) + ' mins ago'
            } else {
              date = ' just now'
            }
            let userAvatarUrl = imageUrl + `profile-${sender}.png`
            history = { Sender: sender, Content: content, Date: date, avatar: userAvatarUrl }
            historyData.push(history)
          }
          setChatHistory(historyData)
        }
      })
    } catch (e) {
      console.error(e)
    }
    // get transaction
    try {
      if (chainId === '56' || chainId === '97') {
        const response = await Moralis.EvmApi.transaction.getWalletTransactions({
          address: ChadAddress,
          chain: chainId,
        });
      } else {
        await fetch(
          `https://api.routescan.io/v2/network/testnet/evm/${chainId}/address/${ChadAddress}/transactions`,
          // `https://api.routescan.io/v2/network/mainnet/evm/1/address/${ChadAddress}/transactions`,
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          if (!data.message) {
            setTransactions(data.items.filter(item => item.status))
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
    // get holders
    try {
      if (chainId === 56) {
        await fetch(
          `https://api.testnet.bscscan.com/api?module=token&action=tokenholderlist&contractaddress=${tokenAddress}&page=1&offset=10&apikey=${YourApiKeyToken} `
        )
      } else {
        await fetch(
          `https://api.routescan.io/v2/network/testnet/evm/${chainId}/erc20/${tokenAddress}/holders`,
          // `https://api.routescan.io/v2/network/mainnet/evm/1/erc20/${tokenAddress}/holders`,
          {
            method: 'GET'
          }
        ).then(async res => {
          let data = await res.json()
          if (!data.message) {
            setTokenHolderDatas(data.items)
          }
        })
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    const interval = setInterval(() => getApi(), 10000)
    return () => clearInterval(interval)
  }, [])

  const setMaxAmount = async () => {
    if (accountBalance > 0) accountBalance = accountBalance - 0.0001
    if (inputToken === 'ETH') {
      setAmount(accountBalance)
    } else {
      setAmount(tokenBalance)
    }
  }

  useEffect(() => {
    const FetchAmount = async () => {
      try {
        let id
        if (inputToken === 'ETH') {
          id = '1'
        } else {
          id = '0'
        }
        let amounts
        if (Number(tokenAmount) > 0) {
          if (lpCreated) {
            if (id === '1') {
              path = [getWethAddress(chainId), tokenAddress]
            } else {
              path = [tokenAddress, getWethAddress(chainId)]
            }
            amounts = await readContract({
              address: getRouterAddress(chainId),
              abi: RouterAbi,
              functionName: 'getAmountsOut',
              args: [BaseWeb3.utils.toWei(String(tokenAmount), 'ether'), path],
              chainId: Number(chainId)
            })
          } else {
            amounts = await readContract({
              address: ChadAddress,
              abi: ChadAbi,
              functionName: 'ethOrTokenAmount',
              args: [web3Clients[chainId].utils.toWei(String(tokenAmount), 'ether'), id],
              chainId: Number(chainId)
            })
          }

          setTokenOutAmount(Number((Number(amounts) / 10 ** 18).toFixed(3)))
        } else {
          setTokenOutAmount('')
        }

        setTokenOutAmount(Number((Number(amounts) / 10 ** 18).toFixed(3)))
      } catch (e) {
        console.error(e)
      }
    }
    if (creating === false) {
      FetchAmount()
    }
  }, [inputToken, tokenAmount, creating])

  const chanageCurrency = async () => {
    if (inputToken === 'ETH') {
      setInputToken('Token')
      setInputBalance(tokenBalance)
      setAmount(tokenOutAmount)
    } else {
      setInputToken('ETH')
      setInputBalance(accountBalance)
      setAmount(tokenOutAmount)
    }
  }
  useEffect(() => {
    const FetchAmount = async () => {
      try {
        let amounts
        amounts = await readContract({
          address: tokenAddress,
          abi: TokenAbi,
          functionName: 'balanceOf',
          args: [address],
          chainId: Number(chainId)
        })
        let allowance
        let approveAddress;
        if (lpCreated) {
          approveAddress = getRouterAddress(chainId)
        } else {
          approveAddress = ChadAddress
        }
        allowance = await readContract({
          address: tokenAddress,
          abi: TokenAbi,
          functionName: 'allowance',
          args: [address, approveAddress],
          chainId: Number(chainId)
        })
        setTokenAllowance(Number(allowance) / 10 ** 18)
        setTokenBalance(web3Clients[chainId].utils.fromWei(String(amounts), 'ether'))
      } catch (e) {
        console.error(e)
      }
    }
    if (address && tokenAddress) {
      FetchAmount()
    }
  }, [tokenAddress, address, creating])

  useEffect(() => {
    const FetchHolder = async () => {
      try {
        let tokenHolder
        let tokenHolders = []
        for (let i = 0; i < holderDatas?.length; i++) {
          tokenHolder = {
            address: holderDatas[i].address,
            value: (holderDatas[i].percentage) * 100
          }
          tokenHolders.push(tokenHolder)
        }
        setTokenHolders(tokenHolders)
      } catch (e) {
        console.error(e)
      }
    }
    const FetchTransaction = async () => {
      try {
        let transaction
        let transactionData = []
        for (let i = 0; i < transactions?.length; i++) {
          if (
            transactions[i].method.includes('buyToken') ||
            transactions[i].method.includes('sellToken')
          ) {
            let maker = transactions[i].from
            let type
            let amount
            if (transactions[i].method.includes('buyToken')) {
              type = 'Buy'
            } else {
              type = 'Sell'
            }
            // amount = tokenPriceDatas[transactions?.length - (i)].usdAmount * ethPrice;
            amount = Number(tokenPriceDatas[transactions?.length - (i)].Amount) * ethPrice;
            amount = '$' + Number(web3Clients[chainId].utils.fromWei(String(amount), 'ether')).toLocaleString()
            let date = new Date(transactions[i].timestamp).getTime() / 1000
            let currentDate = Date.now()
            date = currentDate / 1000 - date
            if (date > 86400) {
              date = (date / 86400).toFixed(0) + ' days ago'
            } else if (date > 3600) {
              date = (date / 3600).toFixed(0) + ' hours ago'
            } else if (date > 0) {
              date = (date / 60).toFixed(0) + ' mins ago'
            } else {
              date = ' just now'
            }
            if (date < 0) {
              date = 'just now'
            }
            let tx = transactions[i].id
            transaction = {
              Maker: maker,
              Type: type,
              Amount: amount,
              Date: date,
              Tx: tx
            }
            transactionData.push(transaction)
          }
        }
        setTransactionDatas(transactionData)
      } catch (e) {
        console.error(e)
      }
    }
    if (tokenAddress) {
      if (holderDatas?.length > 0) {
        FetchHolder()
      } else if (transactions?.length > 0) {
        // FetchTransactionApi()
        FetchTransaction()
      } else {
        getApi()
      }
    }
  }, [holderDatas, tokenAddress, transactions])

  const [selectedOption, setSelectedOption] = useState('Chat')
  // Pagination State and Logic for Transactions Table
  const [currentTransactionPage, setCurrentTransactionPage] = useState(1)
  const [transactionTotalPages, setTransactionTotalPages] = useState(0)
  const transactionItemsPerPage = 5
  const [transactionPageNumbers, setTransactionPageNumbers] = useState([])

  const calculateTransactionPageNumbers = (totalPages, currentPage) => {
    let pages = []

    if (totalPages <= 4) {
      pages = Array.from({ length: totalPages }, (_, i) => i + 1)
    } else {
      if (currentPage === 1) {
        pages = [1, 2, '...', totalPages - 1, totalPages]
      } else if (currentPage === totalPages) {
        pages = [1, 2, '...', totalPages - 1, totalPages]
      } else {
        if (currentPage + 1 < totalPages) {
          if (currentPage + 1 === totalPages - 1) {
            pages = [currentPage - 1, currentPage, currentPage + 1, totalPages]
          } else {
            pages = [
              currentPage - 1,
              currentPage,
              currentPage + 1,
              '...',
              totalPages
            ]
          }
        } else if (currentPage < totalPages) {
          pages = [currentPage - 1, currentPage, currentPage + 1]
        } else {
          pages = [1, 2, '...', totalPages - 1, totalPages]
        }
      }
    }

    return pages
  }

  const handleTransactionPageChange = newPageNumber => {
    setCurrentTransactionPage(newPageNumber)
    setTransactionPageNumbers(
      calculateTransactionPageNumbers(transactionTotalPages, newPageNumber)
    )
  }

  useEffect(() => {
    const totalPages = Math.ceil(
      transactionDatas.length / transactionItemsPerPage
    )
    setTransactionTotalPages(totalPages)
    setTransactionPageNumbers(
      calculateTransactionPageNumbers(totalPages, currentTransactionPage)
    )
  }, [transactionDatas])


  return (
    <div>
      <div className="GlobalContainer">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div className="max-w-7xl m-auto pt-36 pb-24 px-4 sm:px-12 sm:py-10">
            <div className='flex flex-col lg:flex-row'>
              <section className="w-full sm:p-[16px]">
                <div className='bg-[#090909] rounded-[25px] overflow-hidden'>
                  <ClaimCard
                    tokenName={tokenName}
                    Logo={<img src={tokenLogo} className="claim-eth-logo" />}
                    tokenAddress={tokenAddress}
                    contractAddress={contractAddress}
                    dexAddress="https://app.uniswap.org/swap"
                    devAddress={devAddress}
                    dexName="Trader Joe"
                    tokenSymbol={tokenSymbol}
                    tokenDecimals={18}
                    tokenTotalSupply={1000000000}
                    maxBuyAmount={maxBuyAmount}
                    tokenSupplyUSD={virtualLp * ethPrice}
                    tokenSupplyLiquidity={virtualTokenLp}
                    tokenPrice={tokenPrice}
                    tokenUnsoldTokens={'Burned 🔥'}
                    tokenCover={tokenBanner}
                    website={website}
                    telegram={telegram}
                    twitter={twitter}
                    volume={volume}
                    description={description}
                    ethPrice={ethPrice}
                  />
                  <div className=''>
                    {lpCreated ?
                      <iframe
                        src={`https://dexscreener.com/ethereum/${tokenAddress}?embed=1&trades=0&info=0&theme=light`}
                        className="chart"
                        title="chart"
                      /> :
                      <MyChart data={tokenPriceDatas} ethPrice={ethPrice} />}
                  </div>

                  <div className="mt-6">
                    <div className="custom-radio-button-wrapper2 px-6">
                      <CustomRadioButton
                        value="Chat"
                        selectedValue={selectedOption}
                        handleSelect={setSelectedOption}
                      />
                      <CustomRadioButton
                        value="Trades"
                        selectedValue={selectedOption}
                        handleSelect={setSelectedOption}
                      />
                    </div>
                    {/* Trades section */}
                    {selectedOption === 'Trades' && (
                      <div className="w-full rounded-xl p-3 sm:p-6">
                        <div>
                          <div className="tradeBox py-2">
                            <p>Maker</p>
                            <p>Type</p>
                            <p>Amount</p>
                            <p>Date</p>
                            <p>Tx</p>
                          </div>

                          <div className='flex flex-col gap-2'>

                            {transactionDatas.length === 0 && (
                              <div className='flex bg-[#1a2d1d] py-3 rounded-full justify-center text-white text-sm px-2'>No Data</div>
                            )}
                            {transactionDatas.length > 0 && transactionDatas
                              .slice(
                                (currentTransactionPage - 1) *
                                transactionItemsPerPage,
                                currentTransactionPage * transactionItemsPerPage
                              )
                              .map(
                                ({ Maker, Type, Amount, Date, Tx }) => (
                                  <>
                                    <div className="flex bg-[#1a2d1d] py-3 rounded-full justify-between px-2 sm:px-4 items-center">
                                      <div>
                                        <a
                                          className="holderContent"
                                          href={
                                            'https://testnet.bscscan.com/address/' +
                                            Maker
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          <p className="tokenLists text-[#f3cc2f]">
                                            {Maker.slice(0, 5) +
                                              '...' +
                                              Maker.slice(-3)}
                                          </p>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#f3cc2f"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide-icon lucide lucide-external-link h-4 w-4"
                                          >
                                            <path d="M15 3h6v6"></path>
                                            <path d="M10 14 21 3"></path>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                          </svg>
                                          &nbsp;
                                        </a>
                                      </div>
                                      <div>
                                        <p
                                          className={
                                            Type === 'Buy'
                                              ? 'tokenLists tokenBuy text-green-500'
                                              : 'tokenLists tokenSell text-red-500'
                                          }
                                        >
                                          {Type}
                                        </p>
                                      </div>
                                      <div>
                                        <p className="tokenLists">{Amount}</p>
                                      </div>
                                      <div>
                                        <p className="tokenLists">{Date}</p>
                                      </div>
                                      <div>
                                        <a
                                          className="holderContent"
                                          href={
                                            'https://testnet.bscscan.com/tx/' +
                                            Tx
                                          }
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          <p className="tokenLists text-[#f3cc2f]">
                                            {Tx.slice(0, 5) +
                                              '...' +
                                              Tx.slice(-3)}
                                          </p>
                                          <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="24"
                                            height="24"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#f3cc2f"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            className="lucide-icon lucide lucide-external-link h-4 w-4"
                                          >
                                            <path d="M15 3h6v6"></path>
                                            <path d="M10 14 21 3"></path>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                          </svg>
                                          &nbsp;
                                        </a>
                                      </div>
                                    </div>
                                  </>
                                )
                              )}
                            <div
                              className="flex justify-end my-4"
                              style={{ textAlign: 'right' }}
                            >
                              {/* Render the "First Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#f3cc2f]"
                                onClick={() => handleTransactionPageChange(1)}
                              >
                                &lt;&lt;
                              </button>
                              {/* Render the "Previous Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#f3cc2f]"
                                onClick={() =>
                                  handleTransactionPageChange(
                                    Math.max(currentTransactionPage - 1, 1)
                                  )
                                }
                              >
                                &lt;
                              </button>
                              {transactionPageNumbers.map((pageNumber, index) => {
                                if (typeof pageNumber === 'number') {
                                  return (
                                    <button
                                      key={pageNumber}
                                      className={`px-2 py-1 mx-1 ${currentTransactionPage === pageNumber
                                        ? 'bg-[#297836] text-white'
                                        : 'bg-[#1a2d1d] text-[#aaa]'
                                        } rounded-lg border border-[#f3cc2f]`}
                                      onClick={() =>
                                        handleTransactionPageChange(pageNumber)
                                      }
                                    >
                                      {pageNumber}
                                    </button>
                                  )
                                } else {
                                  return (
                                    <span
                                      key={pageNumber}
                                      className="px-2 py-1 mx-1 bg-transparent text-secondary rounded-lg border border-primary"
                                    >
                                      ...
                                    </span>
                                  )
                                }
                              })}
                              {/* Render the "Next Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#f3cc2f]"
                                onClick={() =>
                                  handleTransactionPageChange(
                                    Math.min(
                                      currentTransactionPage + 1,
                                      transactionTotalPages
                                    )
                                  )
                                }
                              >
                                &gt;
                              </button>
                              {/* Render the "Last Page" button */}
                              <button
                                className="px-2 py-1 mx-1 bg-primary text-white rounded-lg border border-[#f3cc2f]"
                                onClick={() =>
                                  handleTransactionPageChange(transactionTotalPages)
                                }
                              >
                                &gt;&gt;
                              </button>
                            </div>

                          </div>
                        </div>
                      </div>
                    )}
                    {/* Chat section */}
                    {selectedOption === 'Chat' && (
                      <section className="InputSection_Description p-6">
                        {chatHistory.length > 0 ? (
                          <div>
                            <div className='flex flex-col gap-1'>
                              {chatHistory.map(
                                ({ Sender, Content, Date, avatar }) => (
                                  <>
                                    <div className="chatBox px-2">
                                      <div>
                                        <div className="chat-eth-logo-container relative">
                                          <img src={avatar} className="chat-profile-avatar"
                                            onError={event => {
                                              event.target.src = "/img/moonboy67.png"
                                              event.onerror = null
                                            }} />
                                          &nbsp; &nbsp;
                                          <div>
                                            <div className="top-trending">
                                              <Link
                                                className="chatContent"
                                                to={'/profile/?address=' + Sender}
                                                rel="noreferrer"
                                              >
                                                <p>
                                                  {Sender.slice(0, 5) +
                                                    '...' +
                                                    Sender.slice(-3)}
                                                </p>
                                                <svg
                                                  xmlns="http://www.w3.org/2000/svg"
                                                  width="24"
                                                  height="24"
                                                  viewBox="0 0 24 24"
                                                  fill="none"
                                                  stroke="white"
                                                  strokeWidth="2"
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  className="lucide-icon lucide lucide-external-link h-4 w-4"
                                                >
                                                  <path d="M15 3h6v6"></path>
                                                  <path d="M10 14 21 3"></path>
                                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                                </svg>
                                                &nbsp;
                                              </Link>
                                              &nbsp;
                                              <div>
                                                <p className="chatLists">{Date}</p>
                                              </div>
                                            </div>
                                            <div>
                                              <p className="chatLists">
                                                {Content}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )
                              )}
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                        <div className="ButtonBox mt-4">
                          <SignMessage
                            ChadAddress={ChadAddress}
                            sender={address}
                            content={chatContent}
                            timestamp={(Date.now() / 1000).toFixed(0)}
                          />
                        </div>
                      </section>
                    )}
                  </div>
                </div>
              </section>

              <section className="ClaimLeftColumn px-[16px]">
                {/*<p className="avoid-scam avoid-scam-text">
                  Avoid scam links! Make sure the website is Chad
                </p>*/}
                <div className="claim-card p-6">
                  <header className="flex justify-between">
                    <span className="text-white text-[20px] font-bold">Swap</span>
                  </header>
                  <section className="flex flex-col gap-6 mt-4">
                    <div className="swap-cards-container ">
                      <div className="flex flex-col gap-1 relative">
                        <div className="w-full rounded-[16px] bg-[#1A1A1A] px-4 py-6 flex justify-between">
                          <div className="flex gap-[16px]">
                            <img alt="token icon" fetchpriority="high" width="40" height="40"
                              decoding="async" data-nimg="1" className="flex-shrink-0 w-10 h-10 rounded-full"
                              src={inputToken === 'ETH' ? ethIcon : tokenLogo} />
                            <div className="flex flex-col">
                              <span className="text-[#919191] text-[12px] font-semibold">From</span>
                              <span className="text-white text-[20px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{inputToken === 'ETH' ? 'BNB' : tokenSymbol.length > 8 ? `${tokenSymbol.slice(0, 8)}...` : tokenSymbol}</span>
                            </div>
                          </div>
                          <div className="flex flex-col relative items-end flex-grow">
                            <input
                              type="number"
                              placeholder="0"
                              className="placeholder:text-[#919191] bg-transparent max-w-[100px] focus:outline-none text-white text-[20px] font-bold text-right"
                              value={tokenAmount.toLocaleString()}
                              onChange={e => setAmount(e.target.value)}
                              required
                            />
                            <div className="flex gap-2 items-center">
                              <span  className="cursor-pointer text-[#919191] text-[12px] font-semibold">
                                Balance: &nbsp;{Number(inputToken === 'ETH' ? accountBalance : tokenBalance).toLocaleString()}{' '}
                                {inputToken === 'ETH' ? 'BNB' : tokenSymbol.length > 8 ? `${tokenSymbol.slice(0, 8)}...` : tokenSymbol}
                              </span>
                              <button className='border border-[#f3cc2f] text-[#fff] rounded-md px-1' onClick={setMaxAmount}>Max</button>
                            </div>
                          </div>
                        </div>
                        <div className="w-full rounded-[16px] bg-[#1A1A1A] px-4 py-6 flex justify-between">
                          <div className="flex gap-[16px]">
                            <img alt="token icon" fetchpriority="high" className="flex-shrink-0 w-10 h-10 rounded-full" width="40" height="40" src={inputToken !== 'ETH' ? ethIcon : tokenLogo} />
                            <div className="flex flex-col">
                              <span className="text-[#919191] text-[12px] font-semibold">To</span>
                              <span className="text-white text-[20px] font-bold whitespace-nowrap overflow-hidden text-ellipsis">{inputToken !== 'ETH' ? 'BNB' : tokenSymbol}</span>
                            </div>
                          </div>
                          <div className="flex flex-col relative items-end flex-grow">
                            <input
                              placeholder=""
                              label=""
                              type="number"
                              value={tokenOutAmount}
                              className="text-white text-right text-[20px] font-bold"
                              disabled
                            />
                            <div className="flex gap-2 items-center">
                              <span className="text-[#919191] text-[12px] font-semibold">
                                Balance: &nbsp;{Number(inputToken !== 'ETH' ? accountBalance : tokenBalance).toLocaleString()}{' '}
                                {inputToken !== 'ETH' ? 'BNB' : tokenSymbol}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2" onClick={chanageCurrency}>
                          <img alt="swap" loading="lazy" width="42.5" height="40" decoding="async" data-nimg="1"
                            src={swapIcon} />
                        </button>
                      </div>
                    </div>
                    {address === undefined ? (<button onClick={onConnectWallet} className='text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#f0f0f0] hover:opacity-90 disabled:bg-[#646464] disabled:text-[#bbb] rounded-[24px] text-[#222]'>
                      Connect Wallet
                    </button>) :
                      chain?.id === Number(chainId) ? <button onClick={onTokenSwap} className="text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#f0f0f0] hover:opacity-90 disabled:bg-[#646464] disabled:text-[#bbb] rounded-[24px] text-[#222]" disabled={address !== undefined && (Number(tokenAmount) > 0 && (inputToken === 'ETH' ? accountBalance >= Number(tokenAmount) : tokenBalance >= Number(tokenAmount))) ? false : true}>
                        {
                          inputToken !== 'ETH' && tokenAllowance === 0
                            ? creating === false
                              ? 'Approve token First'
                              : <ClipLoader
                                color={'#222'}
                                loading={creating}
                                size={30}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                              />
                            : creating === false
                              ? 'Swap Tokens'
                              : <ClipLoader
                                color={'#222'}
                                loading={creating}
                                size={30}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                              />}
                      </button>
                        :
                        <button onClick={() => switchNetwork?.(chainId)} className='text-[16px] focus:outline-none h-[48px] flex justify-center items-center select-none font-bold text-center w-full bg-[#f3cc2f] hover:opacity-90 disabled:bg-[#646464] disabled:text-[#bbb] rounded-[24px] text-[#222]'>
                          Switch Network
                        </button>}
                  </section>

                  <div
                    className="token-info-item"
                    style={{ marginTop: '10px' }}
                  >
                    <span className="token-info-label">Current Price</span>
                    <span className="token-info-value">$
                      {((tokenPrice) / 10 ** 12).toLocaleString()}</span>
                  </div>
                </div>

                <br />
                <div className="claim-card p-6">
                  <div className="token-info-item">
                    <span className="token-info-label mx-auto">
                      <h3 className='text-white font-bold text-[24px]' style={{ marginTop: '0px' }}>
                        Earn <span className='text-[#00f3ef]'>0.5%</span> of each trade
                      </h3>
                    </span>
                  </div>
                  <div className="token-info-item mt-2">
                    <span className="token-info-label font-light">
                      Share referral link with your friends and earn 0.5% of every
                      trade they make.
                    </span>
                  </div>
                  <br />
                  <div className='bg-[#202020] flex w-full items-center gap-2 rounded-[8px] py-[14px] pr-[8px] pl-[16px]'>
                    <span className='text-[16px] text-white font-semibold w-[280px] truncate'>{isTooltipDisplayed ? "Copied" : referlink}</span>
                    <button className='flex justify-center items-center w-12 h-12 rounded-[8px] bg-[#363636] hover:bg-[#363666]' onClick={copyAddress(referlink)}>
                      <img src={CopyIcon} />
                    </button>
                  </div>
                  {refUserAmount > 0 ?
                    <div>
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Total Refferal Amounts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {totalRefAmounts} BNB
                        </p>
                      </div>
                      <hr />
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Total Ref Counts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {refCounts}
                        </p>
                      </div>
                      <hr />
                      <div className="RefBox">
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          Your referral amounts:
                        </p>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists"
                        >
                          {refUserAmount} BNB
                        </p>
                      </div>
                      <hr />
                    </div> :
                    <></>}


                </div>
                <br />
                <div className="claim-card p-6">
                  <div className="token-info-item py-2">
                    <span className="token-info-label aligned-left text-[20px] font-extrabold">
                      Holders Distribution
                    </span>
                  </div>
                  {tokenHolders.slice(-10).map(({ address, value }) => (
                    <>
                      <div className="holderBox py-1">
                        <a
                          className="holderContent"
                          href={
                            'https://testnet.bscscan.com/address/' +
                            address
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          <p
                            style={{
                              textAlign: 'center',
                              margin: '0px'
                            }}
                            className="tokenLists text-[#a5ada6]"
                          >
                            {(address.toString()).slice(0, 5) + '...' + (address.toString()).slice(-3)}
                          </p>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="#a5ada6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="lucide-icon lucide lucide-external-link h-4 w-4"
                          >
                            <path d="M15 3h6v6"></path>
                            <path d="M10 14 21 3"></path>
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          </svg>
                          &nbsp;
                        </a>
                        <p
                          style={{
                            textAlign: 'center',
                            margin: '0px'
                          }}
                          className="tokenLists font-bold"
                        >
                          {value.toFixed(2)} %
                        </p>
                      </div>
                    </>
                  ))}
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App
