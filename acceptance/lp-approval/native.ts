import { tokenB } from './mocks'
export default () => ({ ...tokenB, symbol: tokenB.chainId === 1 ? 'ETH' : 'BNB' })
