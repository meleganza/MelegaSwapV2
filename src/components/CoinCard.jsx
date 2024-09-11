import React from 'react'
import PropTypes from 'prop-types'
// import Logo from '../icons/ETH-logo.svg'

const CoinCard = ({
    tokenAddress,
    tokenName,
    LogoUrl,
    BannerUrl,
    LpBurnAmount
}) => {
    const badges = [
        {
            name: 'Rug-Proof',
            className: 'launchpad-badge-rug-proof',
            condition: true
        },
    ]
    const link = `/token/?address=${tokenAddress}`
    const bannerUrl = 'url("' + BannerUrl + '")'
    return (
        <div className="launchpad-card" style={{
            backgroundImage: bannerUrl,
            backgroundSize: '100% 120px',
            height: '450px'
        }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            </div>

            <div className="launchpad-eth-logo-container"
                style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                {LogoUrl}
            </div>

            <p className="launchpad-token-name" >{tokenName}</p>

            <div
                className="launchpad-badges-row"
                style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}
            >
                {badges.map((badge, index) => (
                    LpBurnAmount ?
                        <div
                            key={index}
                            className={badge.className}
                            style={{ display: badge.condition ? 'flex' : 'none' }}
                        >
                            <span className="launchpad-badge-text">{badge.name}</span>
                        </div>
                        :
                        <div
                            className={badge.className}
                            style={{ background: 'transparent' }}
                        ></div>
                ))}
            </div>

            <p className="lauchpad-cap-limit" style={{ marginTop: '20px' }}>COMMUNITY FUNDED</p>
            {LpBurnAmount ?
                <p className="launchpda-cap-type" style={{ fontSize: '16px' }}>Automatic Burn 🔥</p>
                :
                <p className="launchpda-cap-type" style={{ height: '16px' }}></p>
            }


            <div className="launchpad-hr">
                <hr />
            </div>

            <div className="launchpad-bottom-row">
                <a className="launchpad-details-button" href={link} style={{ width: '70%', margin: 'auto' }}>
                    <span className="launchpad-details-button-text">Details</span>
                </a>
            </div>
        </div>
    )
}

CoinCard.propTypes = {
    tokenName: PropTypes.string.isRequired,
    tokenAddress: PropTypes.string.isRequired
}

CoinCard.defaultProps = {
    RugProof: false,
}

export default CoinCard
