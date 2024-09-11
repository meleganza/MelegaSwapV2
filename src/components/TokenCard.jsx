/* eslint-disable react-hooks/rules-of-hooks */
import React from 'react'
import PropTypes from 'prop-types'
import { ReactComponent as StatusSaleLive } from '../icons/status-sale-live.svg'
import { ReactComponent as StatusSaleClosed } from '../icons/status-closed.svg'
import { ReactComponent as StatusUpcoming } from '../icons/status-upcoming.svg'
import WebsiteIcon from '../icons/website.png'
import TelegramIcon from '../icons/telegram.png'
import TwitterIcon from '../icons/x-icon.svg'
import DiscordIcon from '../icons/discord-icon.svg'

const AboutSection = ({ about }) => (
    <>
        <p className="claim-header">About</p>
        <p className="claim-text">{about}</p>
    </>
)

const SocialSection = ({ website, telegram, twitter, discord }) => (
    <div
        className="social-section"
        style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}
    >
        {/* Website */}
        {website && (
            <a href={website} target="_blank" rel="noopener noreferrer">
                <img src={WebsiteIcon} alt="Website" className="social-icon" />
            </a>
        )}

        {/* Telegram */}
        {telegram && (
            <a href={`${telegram}`} target="_blank" rel="noopener noreferrer">
                <img src={TelegramIcon} alt="Telegram" className="social-icon" />
            </a>
        )}

        {/* Twitter */}
        {twitter && (
            <a href={`${twitter}`} target="_blank" rel="noopener noreferrer">
                <img src={TwitterIcon} alt="Twitter" className="social-icon" />
            </a>
        )}

        {/* Discord */}
        {discord && (
            <a href={`${discord}`} target="_blank" rel="noopener noreferrer">
                <img src={DiscordIcon} alt="Discord" className="social-icon" />
            </a>
        )}
    </div>
)

function isMobile() {
    try {
        document.createEvent('TouchEvent')
        return true
    } catch (e) {
        return false
    }
}

const copyAddress = address => async () => {
    if (document.queryCommandSupported('copy')) {
        const ele = document.createElement('textarea')
        ele.value = address
        document.body.appendChild(ele)
        ele.select()
        document.execCommand('copy')
        document.body.removeChild(ele)
    }
}

const addTokenToWallet = (tokenSymbol, tokenAddress) => async () => {
    try {
        // eslint-disable-next-line no-undef
        await ethereum.request({
            method: 'wallet_watchAsset',
            params: {
                type: 'ERC20',
                options: {
                    address: tokenAddress,
                    symbol: tokenSymbol
                }
            }
        })
    } catch (error) {
        console.log(error)
    }
}

const TokenSection = ({
    tokenName,
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    tokenTotalSupply,
    tokenSupplyLiquidity,
    RugProof
}) => (
    <>
        <div style={{ display: 'flex', marginTop: '10px', marginBottom: ' 10px', justifyContent: 'space-between' }}>
            <p className="claim-header">Token</p>
            <p >
                <p
                    className="token-info-value token-info-address"
                    onClick={
                        isMobile()
                            ? copyAddress(tokenAddress)
                            :
                            addTokenToWallet(tokenSymbol, tokenAddress)
                    }
                >
                    {
                        isMobile()
                            ? 'Copy Token Address'
                            :
                            'Add Token To Wallet'
                    }
                </p>
            </p>
        </div>

        <div className="token-info-container">
            <div className="token-info-item">
                <span className="token-info-label">Address</span>
                <div className="token-info-subitem">
                    <span className="token-info-value token-info-address">
                        {tokenAddress}
                    </span>
                    <span className="token-info-value token-info-address-warning">
                        DO NOT send BNB to this address.
                    </span>
                </div>
            </div>
            <hr />
            <div className="token-info-item">
                <span className="token-info-label">Name</span>
                <span className="token-info-value">{tokenName}</span>
            </div>
            <hr />
            <div className="token-info-item">
                <span className="token-info-label">Symbol</span>
                <span className="token-info-value">${tokenSymbol}</span>
            </div>
            <hr />
            <div className="token-info-item">
                <span className="token-info-label">Decimals</span>
                <span className="token-info-value">{tokenDecimals}</span>
            </div>
            <hr />
            <div className="token-info-item">
                <span className="token-info-label">Total Supply</span>
                <span className="token-info-value">
                    {new Intl.NumberFormat().format(tokenTotalSupply)}
                </span>
            </div>
            <hr />
            {Number(tokenSupplyLiquidity) > 0
                ?
                <>
                    <div className="token-info-item">
                        <span className="token-info-label">Liquidity</span>
                        <span className="token-info-value">
                            {new Intl.NumberFormat().format(tokenSupplyLiquidity)}
                        </span>
                    </div>
                    <hr />
                </>
                :
                <></>
            }

            <div className="token-info-item">
                <span className="token-info-label">Liquidity lock-up</span>
                <span className="token-info-value">
                    {RugProof ? 'Burned on launch 🔥' : 'Unlocked'}
                </span>
            </div>
            <hr />
        </div>
    </>
)

const TokenCard = ({
    status,
    RugProof,
    AllIn,
    Doxed,
    KYC,
    tokenName,
    Logo,
    about,
    tokenAddress,
    tokenSymbol,
    tokenDecimals,
    tokenTotalSupply,
    tokenCover,
    website,
    telegram,
    twitter,
    discord
}) => {
    const statusIcons = {
        0: <StatusUpcoming />,
        1: <StatusSaleLive />,
        2: <StatusSaleClosed />
    }

    const statusClasses = {
        0: 'launchpad-status-upcoming',
        1: 'launchpad-status-sale-live',
        2: 'launchpad-status-closed'
    }
    const bannerUrl = 'url("' + tokenCover + '")'
    const badges = [
        {
            name: 'Rug-Proof',
            className: 'launchpad-badge-rug-proof',
            condition: RugProof
        },
        { name: 'All-In', className: 'launchpad-badge-all-in', condition: AllIn },
        { name: 'Doxed', className: 'launchpad-badge-doxed', condition: Doxed },
        { name: 'KYC', className: 'launchpad-badge-kyc', condition: KYC }
    ]

    return (
        <div
            className="claim-card" style={{ backgroundImage: bannerUrl, backgroundSize: '100% 210px' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '70px', position: 'relative'}}>
                <div
                    className={`launchpad-status-text ${statusClasses[status]}`}
                    style={{ position: 'absolute', top: '100px' }}
                >
                    <div className="launchpad-status-icon">{statusIcons[status]}</div>
                    <span className="launchpad-status-text">
                        {status === 1 ? 'Live' : status === 0 ? 'Upcoming' : 'Closed'}
                    </span>
                </div>
            </div>

            <div className="claim-eth-logo-container" style={{ display: 'flex', justifyContent: 'center' }}>
                {Logo}
            </div>

            <p className="claim-token-name">{tokenName}</p>

            <div className="claim-badges-row" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
                {badges.map((badge, index) => (
                    <div key={index} className={badge.className} style={{ display: badge.condition ? 'flex' : 'none' }}>
                        <span className="launchpad-badge-text">{badge.name}</span>
                    </div>
                ))}
            </div>

            <SocialSection
                website={website}
                telegram={telegram}
                twitter={twitter}
                discord={discord}
            />

            <div className="claim-hr">
                <hr />
            </div>

            {/* Show more data here */}
            <AboutSection about={about} />
            <TokenSection
                tokenName={tokenName}
                tokenAddress={tokenAddress}
                tokenSymbol={tokenSymbol}
                tokenDecimals={tokenDecimals}
                tokenTotalSupply={tokenTotalSupply}
                RugProof={RugProof}
            />
        </div>
    )
}

TokenCard.propTypes = {
    RugProof: PropTypes.bool,
    AllIn: PropTypes.bool,
    Doxed: PropTypes.bool,
    KYC: PropTypes.bool,
    CapType: PropTypes.string.isRequired,
    CapLimit: PropTypes.number.isRequired,
    saleStarts: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    saleEnds: PropTypes.string.isRequired,
    tokenName: PropTypes.string.isRequired,
    Logo: PropTypes.element.isRequired,
    about: PropTypes.string.isRequired,
    tokenAddress: PropTypes.string.isRequired,
    tokenSymbol: PropTypes.string.isRequired,
    tokenDecimals: PropTypes.number.isRequired,
    tokenTotalSupply: PropTypes.number.isRequired,
    tokenSupplySale: PropTypes.number.isRequired,
    tokenSupplyLiquidity: PropTypes.number.isRequired,
    tokenUnsoldTokens: PropTypes.string.isRequired,
    tokenCover: PropTypes.string.isRequired,
    website: PropTypes.string,
    telegram: PropTypes.string,
    twitter: PropTypes.string,
    discord: PropTypes.string
}

TokenCard.defaultProps = {
    RugProof: false,
    AllIn: false,
    Doxed: false,
    KYC: false
}

export default TokenCard
