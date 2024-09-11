/* eslint-disable react-hooks/rules-of-hooks */
import React, { useState } from 'react'
import PropTypes from 'prop-types'
import WebsiteIcon from '../icons/website.png'
import TelegramIcon from '../icons/telegram.png'
import TwitterIcon from '../icons/x-icon.svg'
import CopyIcon from '../icons/copy.svg'
import ProfileIcon from '../icons/rocket.svg'
import DexIcon from '../icons/trader-joe.webp'
import InfoIcon from '../icons/info.png'
import { Link } from 'react-router-dom'

const SocialSection = ({ website, telegram, twitter }) => (
  <div
    className="buy-social-section"
    style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
  >
    {twitter && (
      <a href={`${twitter}`} target="_blank" rel="noopener noreferrer">
        <img src={TwitterIcon} alt="Twitter" className="social-icon" />
      </a>
    )}
    {telegram && (
      <a href={`${telegram}`} target="_blank" rel="noopener noreferrer">
        <img src={TelegramIcon} alt="Telegram" className="social-icon" />
      </a>
    )}
    {website && (
      <a href={website} target="_blank" rel="noopener noreferrer">
        <img src={WebsiteIcon} alt="Website" className="social-icon" />
      </a>
    )}
  </div>
)

const ChadPumpInfoSection = ({
  tokenSupplyUSD,
  tokenSupplyLiquidity,
  marketCap,
  tokenUnsoldTokens,
  maxBuyAmount,
  volume
}) => (
  <>
    <div className="fields flex justify-between">
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[#999999] text-[12px]">MC</span>
        <span className="font-bold text-white text-[20px]">
          ${new Intl.NumberFormat().format(
            marketCap
          )}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[#999999] text-[12px]">VL</span>
        <span className="font-bold text-white text-[20px]">
          ${new Intl.NumberFormat().format(tokenSupplyUSD.toFixed(0))}
        </span>
      </div>
      <div className="flex flex-col gap-1">
        <span className="font-semibold text-[#999999] text-[12px]">Volume</span>
        <span className="font-bold text-white text-[20px]">${(volume / (10 ** 18)).toFixed(5)}</span>
      </div>
    </div>
  </>
)

const ClaimCard = ({
  tokenName,
  Logo,
  tokenAddress,
  contractAddress,
  dexAddress,
  devAddress,
  dexName,
  tokenSymbol,
  tokenDecimals,
  tokenTotalSupply,
  maxBuyAmount,
  tokenSupplyUSD,
  tokenSupplyLiquidity,
  tokenPrice,
  tokenUnsoldTokens,
  tokenCover,
  website,
  telegram,
  twitter,
  volume,
  description,
  ethPrice
}) => {
  let marketCap = (tokenPrice * 1000000000 * Number(ethPrice)) / 10 ** 12
  let progress = marketCap * 100 / 69000
  
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)

  const [modalIsOpen, setModalIsOpen] = useState(false)

  const toggleModal = () => {
    setModalIsOpen(!modalIsOpen)
  }

  const closeModal = e => {
    if (e.target.id === 'modal') {
      setModalIsOpen(false)
    }
  }

  const modalContent = (
    <div
      id="modal"
      onClick={closeModal}
      className={`modal ${modalIsOpen ? 'show-modal' : ''}`}
    >
      <div className="modal-content">
        <p>{description}</p>
        <button onClick={toggleModal} className="save-button">
          Close
        </button>
      </div>
    </div>
  )

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

  return (
    <div className="relative overflow-hidden">
      <div className='relative flex flex-row items-center justify-center aspect-w-[208] w-full aspect-h-[85] overflow-hidden aspect-video z-1'>
        <img src={tokenCover} sizes='100vw' width={208} height={85} className='object-cover object-center' />
      </div>
      <div className='flex flex-col relative rounded-[25px] mt-[-42px] bg-[#090909] z-2 !rounded-b-none p-6 gap-[16px]'>
        <div className='flex justify-between gap-4'>

          <div className="flex gap-4 flex-grow">
            {Logo}
            <div className="flex flex-col gap-0">
              <span className="text-white font-bold text-[20px]">{tokenSymbol}</span>
              <span className="font-semibold text-[#919191] text-[16px]">{tokenName}</span>
            </div>
          </div>
          <SocialSection website={website} telegram={telegram} twitter={twitter} />
        </div>

        <div className=' font-light text-white text-[14px]'>
          {description}
        </div>

        <div className="launchpad-progress-container bg-[#101010] p-4 rounded-[16px] flex flex-col gap-6">
          <div className="h-6">
            <div className="relative w-full h-full bg-[#00f3ef17] rounded-[16px]">
              <div className=" items-center overflow-hidden rounded-[16px] launchpad-progress-bar-filled h-full" style={{ width: `${progress}%` }}></div>
              <span className="select-none absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-[16px]">
                {progress.toFixed(3)}%
              </span>
            </div>
          </div>
          <ChadPumpInfoSection
            tokenSupplyLiquidity={tokenSupplyLiquidity}
            marketCap={marketCap}
            tokenSupplyUSD={tokenSupplyUSD}
            tokenUnsoldTokens={tokenUnsoldTokens}
            maxBuyAmount={maxBuyAmount}
            volume={volume}
          />
        </div>

      </div>
    </div>
  )
}

ClaimCard.propTypes = {
  tokenName: PropTypes.string.isRequired,
  Logo: PropTypes.element.isRequired,
  about: PropTypes.string.isRequired,
  tokenAddress: PropTypes.string.isRequired,
  contractAddress: PropTypes.string.isRequired,
  dexAddress: PropTypes.string.isRequired,
  devAddress: PropTypes.string.isRequired,
  dexName: PropTypes.string.isRequired,
  tokenSymbol: PropTypes.string.isRequired,
  tokenDecimals: PropTypes.number.isRequired,
  tokenTotalSupply: PropTypes.number.isRequired,
  tokenSupplyLiquidity: PropTypes.number.isRequired,
  tokenSupplyUSD: PropTypes.number.isRequired,
  tokenUnsoldTokens: PropTypes.string.isRequired,
  tokenCover: PropTypes.string.isRequired,
  website: PropTypes.string,
  telegram: PropTypes.string,
  twitter: PropTypes.string
}

export default ClaimCard
