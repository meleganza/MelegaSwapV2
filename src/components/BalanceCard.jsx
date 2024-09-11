import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const BalanceCard = ({
    chainId,
    name,
    symbol,
    tokenAddress,
    Logo,
    balance
}) => {
    const link = `/buy/?chain=${chainId}&address=${tokenAddress}`
    return (
        <div className="balances-box">
            <Link to={link}>
                <div className='flex flex-row items-center py-4 gap-4'>
                    {Logo}
                    <div className="flex flex-col gap-2">
                        <p className="text-white text-base">{name}</p>
                        <div className='flex flex-row text-sm'>
                            <p className="Balance-token-name left-aligned">{Number(balance).toLocaleString()}</p>
                            <p className="Balance-token-name left-aligned">&nbsp;{symbol.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    )
}

BalanceCard.propTypes = {
    name: PropTypes.string.isRequired,
    symbol: PropTypes.string.isRequired,
    tokenAddress: PropTypes.string.isRequired,
}

export default BalanceCard
