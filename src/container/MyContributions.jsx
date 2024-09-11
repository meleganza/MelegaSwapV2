/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable no-undef */
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAccount, useNetwork } from 'wagmi'
import '../App.css'
import MultiCallAbi from '../config/MultiCallAbi.json'
import '../styles/MainContainer.css'
import LaunchpadCard from '../components/LaunchpadCard'
import ClipLoader from 'react-spinners/ClipLoader'
import Footer from '../components/Footer'
import TopBar from '../components/TopBar'
import { Link } from 'react-router-dom'
import Select from 'react-select'
import RightPanel from '../components/RightPanel'
import { useSpring, animated } from 'react-spring'
import { publicClient, imageUrl } from '../utils/constants'
import { multicallAddress } from '../utils/contracts'

const App = () => {
  const { chain } = useNetwork()
  const { address } = useAccount()
  let [loading, setLoading] = useState(false)
  const [chadLists, setChadListData] = useState([])
  const [currentLength, ] = useState(0)
  const [totalLength, setTotalLength] = useState(0)

  useEffect(() => {
    const FetchData = async () => {
      try {
        setLoading(true)
        const mainInfo = await publicClient.readContract({
          address: multicallAddress(chain?.id),
          abi: MultiCallAbi,
          functionName: 'getUserMainInfo',
          args: [address]
        })
        const otherInfo = await publicClient.readContract({
          address: multicallAddress(chain?.id),
          abi: MultiCallAbi,
          functionName: 'getUserOtherInfo',
          args: [address]
        })
        let chadListsData = []
        let chadData
        setTotalLength(mainInfo[0].length)
        if (mainInfo[0].length > 0) {
          for (let i = mainInfo[0].length - 1; i >= 0; i--) {
            let progress
            const contractAddress = mainInfo[5][i]
            const virtualLpAmounts = Number(mainInfo[2][i])
            const virtualLpTokenAmounts = Number(mainInfo[1][i]) / 10 ** 18
            const tokenPrice = Number(mainInfo[3][i])
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
            let devAddress = mainInfo[6][i]
            let dexAddress = 'https://app.uniswap.org/swap'
            let dexName = 'Trader Joe'
            chadData = {
              progress: progress,
              Liquidity: liquidity,
              tokenName: name,
              logoUrl: logoUrl,
              bannerUrl: bannerUrl,
              address: mainInfo[5][i],
              depositedAmount: Number(mainInfo[4][i]) / 10 ** 18,
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
        setLoading(false)
      } catch (e) {
        setLoading(false)
        console.error(e)
      }
    }
    if (address)
      FetchData()
  }, [address, chain.id])

  const sortOptions = [
    { value: 'Market Cap', label: 'Market Cap' },
    { value: 'Creating Date', label: 'Creating Date' },
    { value: 'Freshly Aped', label: 'Freshly Aped' },
    { value: 'Messages', label: 'Messages' },
    { value: 'Volume', label: 'Volume' }
  ]

  const orderOptions = [
    { value: 'Descending', label: 'Descending' },
    { value: 'Ascending', label: 'Ascending' }
  ]

  const statusOptions = [
    { value: 'All', label: 'All' },
    { value: 'Listed', label: 'Listed' },
    { value: 'Live', label: 'Live' }
  ]

  function FilterSelect({ options, defaultValue, onChange }) {
    const handleChange = newValue => {
      onChange(newValue)
    }

    return (
      <Select
        defaultValue={defaultValue}
        isSearchable={false}
        options={options}
        value={options.find(option => option.value === defaultValue.value)}
        onChange={handleChange}
        styles={{
          control: styles => ({
            ...styles,
            width: '190px',
            padding: '8px 16px',
            color: 'white',
            backgroundColor: '#f3cc2f',
            border: '1px solid #f3cc2f',
            boxShadow: 'none',
            borderRadius: '4px',
            marginRight: '15px',
            marginTop: '15px',
            cursor: 'pointer',
            outline: 'none',
            '&:hover': {
              borderColor: '#f3cc2f',
              boxShadow: 'none'
            },
            '&:focus': {
              borderColor: '#f3cc2f',
              boxShadow: 'none'
            },
            '&:active': {
              borderColor: '#f3cc2f',
              boxShadow: 'none'
            }
          }),
          option: (styles, { isFocused, isSelected }) => ({
            ...styles,
            backgroundColor: isFocused ? '#f3cc2f' : '#f3cc2f',
            color: 'white',
            cursor: 'pointer'
          }),
          singleValue: (styles, { isFocused }) => ({
            ...styles,
            color: 'white',
            outline: 'none'
          }),
          indicatorSeparator: styles => ({
            ...styles,
            display: 'none'
          })
        }}
      />
    )
  }

  const [sortedChadLists, setSortedChadLists] = useState([])
  const [filteredChadLists, setFilteredChadLists] = useState([])
  const [sortValue, setSortValue] = useState(sortOptions[2])
  const [orderValue, setOrderValue] = useState(orderOptions[0])
  const [statusValue, setStatusValue] = useState(statusOptions[0])

  const filterChadLists = useCallback(() => {
    let filteredList = []
    switch (statusValue.value) {
      case 'All':
        filteredList = [...chadLists]
        break
      case 'Listed':
        filteredList = [] // TODO: Add filtering logic for "Listed" condition
        break
      case 'Live':
        filteredList = [] // TODO: Add filtering logic for "Live" condition
        break
      default:
        break
    }
    setFilteredChadLists(filteredList)
  }, [statusValue, chadLists])

  const handleAnimateChange = e => {
    const newValue = e.target.checked
    setAnimate(newValue)
  }

  const sortChadLists = useCallback(() => {
    let sortedList = []
    switch (sortValue.value) {
      case 'Market Cap':
        sortedList = [...filteredChadLists].sort((a, b) => {
          if (orderValue.value === 'Ascending') {
            return a.marketCap - b.marketCap
          } else {
            return b.marketCap - a.marketCap
          }
        })
        break
      case 'Creating Date':
        sortedList = [...filteredChadLists].sort((a, b) => {
          if (orderValue.value === 'Ascending') {
            // TODO: Add sorting logic for ascending order
            return 0
          } else {
            // TODO: Add sorting logic for descending order
            return 0
          }
        })
        break
      case 'Freshly Aped':
        sortedList = [...filteredChadLists].sort((a, b) => {
          if (orderValue.value === 'Ascending') {
            // TODO: Add sorting logic for ascending order
            return 0
          } else {
            // TODO: Add sorting logic for descending order
            return 0
          }
        })
        break
      case 'Messages':
        sortedList = [...filteredChadLists].sort((a, b) => {
          if (orderValue.value === 'Ascending') {
            // TODO: Add sorting logic for ascending order
            return 0
          } else {
            // TODO: Add sorting logic for descending order
            return 0
          }
        })
        break
      case 'Volume':
        sortedList = [...filteredChadLists].sort((a, b) => {
          if (orderValue.value === 'Ascending') {
            // TODO: Add sorting logic for ascending order
            return 0
          } else {
            // TODO: Add sorting logic for descending order
            return 0
          }
        })
        break
      default:
        break
    }
    setSortedChadLists(sortedList)
  }, [orderValue, sortValue, filteredChadLists])

  useEffect(() => {
    setSortedChadLists([...filteredChadLists])
  }, [filteredChadLists, orderValue, sortValue])

  useEffect(() => {
    setFilteredChadLists([...chadLists])
  }, [chadLists, statusValue])

  useEffect(() => {
    filterChadLists()
  }, [statusValue, filterChadLists])

  useEffect(() => {
    sortChadLists()
  }, [orderValue, sortValue, filteredChadLists, sortChadLists])

  const onSortChange = newValue => {
    setSortValue(newValue)
    sortChadLists()
  }

  const onOrderChange = newValue => {
    setOrderValue(newValue)
    sortChadLists()
  }

  const onStatusChange = newValue => {
    setStatusValue(newValue)
    filterChadLists()
  }

  const [animate, setAnimate] = useState(false)
  const prevAnimateRef = useRef(animate)
  const [animatedChadLists, setAnimatedChadLists] = useState([])

  useEffect(() => {
    if (animate !== prevAnimateRef.current) {
      if (animate) {
        setAnimatedChadLists(sortedChadLists)
      } else {
        sortChadLists()
      }
      prevAnimateRef.current = animate
    }
  }, [animate, sortChadLists, sortedChadLists])

  const animateList = useCallback(() => {
    if (animate && sortedChadLists.length > 0 && animatedChadLists.length > 0) {
      // Shift the list items by one
      const itemToMove = animatedChadLists.shift()
      animatedChadLists.push(itemToMove)
      setAnimatedChadLists([...animatedChadLists])
    }
  }, [animate, sortedChadLists, animatedChadLists])

  useEffect(() => {
    let intervalId = null
    if (animate) {
      intervalId = setInterval(() => {
        animateList()
      }, 600)
    }

    return () => {
      clearInterval(intervalId)
    }
  }, [animate, animateList])

  const overlayOpacity = useSpring({
    from: { opacity: 0 },
    to: [{ opacity: 0.8 }, { opacity: 0.6 }, { opacity: 0.2 }, { opacity: 0 }],
    config: {
      duration: 100,
      easing: t => t * (2 - t)
    }
  })

  const AnimatedOverlay = () => (
    <animated.div
      style={{
        ...overlayOpacity,
        position: 'absolute',
        top: 0,
        left: 'calc(50% - 320px / 2)',
        width: '320px',
        height: '100%',
        backgroundColor: 'white',
        zIndex: 1,
        borderRadius: '10px'
      }}
    />
  )

  const LaunchpadCardGrid = ({ items, animate, key }) => {
    const firstItemShakeAnimation = useSpring({
      from: { transform: 'translateX(0px)' },
      to: [
        { transform: 'translateX(-20px)' },
        { transform: 'translateX(15px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(5px)' },
        { transform: 'translateX(0px)' }
      ],
      config: {
        duration: 50, // Adjust duration as needed
        easing: t => t * (2 - t) // Easing function for a smooth start and end
      }
    })

    return (
      <div className="launchpad-card-grid" key={key}>
        {items.map(
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
            <animated.div
              style={{
                ...(i === 0 && prevAnimateRef.current
                  ? firstItemShakeAnimation
                  : '')
              }}
            >
              {prevAnimateRef.current && i === 0 && <AnimatedOverlay />}

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
            </animated.div>
          )
        )}
      </div>
    )
  }

  return (
    <div>
      <div className="GlobalContainer launches-all-padding">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div className="headerMargin" />
          <div className="MainDashboard">
            <div className="layout-container">
              <section className="FairLaunchFlexLayout">
                <section>
                  <p className="ContractContentTextTitle h1">
                    BlackPump.Fun on BSC Network
                  </p>
                  <p style={{ textAlign: 'center' }}>
                    <Link to="/CreateBlack" className="create-token-button">
                      Create&nbsp;Token
                    </Link>
                  </p>
                  <br />
                  <p>
                    <div className="launches-switch">
                      <Link
                        to="/AllLaunches"
                        className="launches-switch-passive"
                      >
                        All&nbsp;Launches
                      </Link>{' '}
                      <Link
                        to="/MyContributions"
                        className="launches-switch-active"
                      >
                        My&nbsp;Contributions
                      </Link>
                    </div>
                  </p>
                  <div className="launches-switch">
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        marginTop: '-15px'
                      }}
                    >
                      <FilterSelect
                        options={sortOptions}
                        defaultValue={sortValue}
                        onChange={onSortChange}
                      />
                      <FilterSelect
                        options={orderOptions}
                        defaultValue={orderValue}
                        onChange={onOrderChange}
                      />
                      <FilterSelect
                        options={statusOptions}
                        defaultValue={statusValue}
                        onChange={onStatusChange}
                      />
                      <div
                        className="Text1"
                        style={{
                          color: 'white',
                          display: 'flex',
                          flexDirection: 'row',
                          alignItems: 'center',
                          marginTop: '14px'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={animate}
                          onChange={handleAnimateChange}
                          style={{
                            width: '16px',
                            height: '16px',
                            marginTop: '2px'
                          }}
                        />
                        Animate
                      </div>
                    </div>
                  </div>

                  <br />
                  {sortedChadLists.length > 0 ? (
                    <>
                      {animate ? (
                        <LaunchpadCardGrid
                          items={animatedChadLists}
                          key={animatedChadLists.join(',')}
                        />
                      ) : (
                        <LaunchpadCardGrid
                          items={sortedChadLists}
                          key={sortedChadLists.join(',')}
                        />
                      )}

                      {loading === true ? (
                        <div className="loadingBox">
                          <ClipLoader
                            color={'#afccc6'}
                            loading={true}
                            size={50}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          />
                        </div>
                      ) : currentLength > 0 ? (
                        <p className="loadMoreText" onClick={loadMoreLists()}>
                          Load more ...
                        </p>
                      ) : (
                        <></>
                      )}
                    </>
                  ) : totalLength === 0 ? (
                    <div className="loadingBox">
                      <p className="Text1" style={{ color: 'white' }}>
                        No data yet
                      </p>
                    </div>
                  ) : (
                    <div className="EmptyLaunchpad">
                      <div className="loadingBox">
                        <p className="Text1" style={{ color: 'white' }}>
                          Loading...
                        </p>
                        <ClipLoader
                          color={'#afccc6'}
                          loading={true}
                          size={50}
                          aria-label="Loading Spinner"
                          data-testid="loader"
                        />
                      </div>
                    </div>
                  )}
                  <br />
                  <br />
                </section>
              </section>
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default App
