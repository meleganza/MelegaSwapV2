import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'
import iconChadPump from '../icons/fair-launch.svg'
import iconTokerCreator from '../icons/token-creator.svg'
import iconCreateChad from '../icons/create-chad.png'
import iconTelegram from '../icons/telegram.svg'
import iconCopy from '../icons/copy.svg'
import iconChart from '../icons/chart.svg'
import iconX from '../icons/x.svg'
import classnames from 'classnames'
import { contractAddress } from '../utils/constants.ts'

const LeftBar = ({ isExpanded, onHamburgerClick }) => {
  const [showLinks] = useState(true)
  const [isHovered, setIsHovered] = useState(false)
  const { address } = useAccount()
  const [isTooltipDisplayed, setIsTooltipDisplayed] = useState(false)

  function displayTooltip() {
    let timeoutId
    setIsTooltipDisplayed(true)
    timeoutId = setTimeout(() => {
      setIsTooltipDisplayed(false)
    }, 1000)
    return () => clearTimeout(timeoutId)
  }

  const copyAddress = address => async () => {
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

  const handleHover = () => {
    setIsHovered(true)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }
  let currentPath = window.location.pathname
  const textClass = classnames('left-bar-text', {
    'left-bar-text-active': isExpanded || isHovered
  })

  return (
    <div
      className={`left-bar ${isExpanded ? 'left-bar-expanded' : ''}`}
      onMouseEnter={handleHover}
      onMouseLeave={handleMouseLeave}
      onClick={onHamburgerClick}
    >
      <ul className="left-bar-links">
        {(isHovered || showLinks) && (
          <>
            <li>
              <Link to="/AllLaunches" className="left-bar-link">
                <img
                  src={iconChadPump}
                  alt="All Launches"
                  className="left-bar-icon"
                />
                <span
                  className={
                    currentPath === '/' || currentPath === '/AllLaunches'
                      ? 'listSelected ' + textClass
                      : 'listUnselected ' + textClass
                  }
                >
                  All&nbsp;Launches
                </span>
              </Link>
            </li>
            <li>
              <Link to="/CreateBlack" className="left-bar-link">
                <img
                  src={iconCreateChad}
                  alt="Create Token"
                  className="left-bar-icon"
                />
                <span
                  className={
                    currentPath === '/CreateBlack'
                      ? 'listSelected ' + textClass
                      : 'listUnselected ' + textClass
                  }
                >
                  Create&nbsp;Token
                </span>
              </Link>
            </li>
            <li>
              <Link to={'/profile/?address=' + address} target={currentPath.includes('profile') ? '_blank' : ''} className="left-bar-link">
                <img
                  src={iconTokerCreator}
                  alt="Fair Launch"
                  className="left-bar-icon"
                />
                <span
                  className={
                    currentPath.includes('/profile')
                      ? 'listSelected ' + textClass
                      : 'listUnselected ' + textClass
                  }
                >
                  Profile
                </span>
              </Link>
            </li>
            <li>
              <Link to="/about-us" className="left-bar-link">
                <img
                  src={iconCreateChad}
                  alt="Create Token"
                  className="left-bar-icon"
                />
                <span
                  className={
                    currentPath === '/about-us'
                      ? 'listSelected ' + textClass
                      : 'listUnselected ' + textClass
                  }
                >
                  Create&nbsp;Token
                </span>
              </Link>
            </li>

            {/* <li>
            <Link to="/NotFound" className="left-bar-link">
              <img
                src={iconTutorials}
                alt="Tutorials"
                className="left-bar-icon"
                style={{marginLeft:'18px'}}
              />
              <span className={textClass}>Tutorials</span>
            </Link>
          </li>
          <li>
            <Link to="/NotFound" className="left-bar-link">
              <img
                src={iconDocuments}
                alt="Documents"
                className="left-bar-icon"
              />
              <span className={textClass}>Documents</span>
            </Link>
          </li>
          <li>
            <Link to="/NotFound" className="left-bar-link">
              <img
                src={iconCompetitions}
                alt="Competitions"
                className="left-bar-icon"
              />
              <span className={textClass}>Competitions</span>
            </Link>
          </li> */}
            <hr className="left-bar-hr" />
            <li>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="left-bar-link"
              >
                <img
                  src={iconTelegram}
                  alt="Telegram"
                  className="left-bar-icon"
                  style={{ width: '22px' }}
                />
                <span className={textClass}>Telegram</span>
              </a>
            </li>
            <li>
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="left-bar-link"
              >
                <img src={iconX} alt="X" className="left-bar-icon" />
                <span className={textClass}>X.com</span>
              </a>
            </li>
            <hr className="left-bar-hr" />
            <li>
              <a
                href="#ca"
                onClick={copyAddress(contractAddress)}
                className="left-bar-link"
              >
                <img
                  src={iconCopy}
                  alt="CA"
                  className="left-bar-icon"
                  style={{ width: '22px' }}
                />
                <span className={textClass}>CA</span>
              </a>
              {isTooltipDisplayed && (
                <span className="tooltiptext center-aligned">Copied!</span>
              )}
            </li>
            <li>
              <a
                href="https://dexscreener.com"
                target="_blank"
                rel="noreferrer"
                className="left-bar-link"
              >
                <img src={iconChart} alt="X" className="left-bar-icon" />
                <span className={textClass}>Chart</span>
              </a>
            </li>
          </>
        )}
      </ul>
    </div>
  )
}

export default LeftBar
