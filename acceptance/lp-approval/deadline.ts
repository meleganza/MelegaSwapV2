import { BigNumber } from '@ethersproject/bignumber'
const deadline = BigNumber.from(Math.floor(Date.now() / 1000) + 1200)
export default () => deadline
