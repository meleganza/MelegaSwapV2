import { createPublicClient, http } from 'viem'
import { avalancheFuji, sepolia, bscTestnet, bsc } from 'viem/chains'
import { useNetwork } from 'wagmi'
import Web3 from 'web3'

export const publicClient = createPublicClient({
    chain: bsc,
    transport: http()
})

const isProduct = 'local'

const PROVIDER_URL_BSC = 'https://endpoints.omniatech.io/v1/bsc/mainnet/public'
const PROVIDER_URL_TESTBSC = 'https://endpoints.omniatech.io/v1/bsc/testnet/public'
// const PROVIDER_URL = 'https://avalanche-fuji-c-chain-rpc.publicnode.com'

export const web3ClientBsc = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_BSC))
export const web3ClientTestBsc = new Web3(new Web3.providers.HttpProvider(PROVIDER_URL_TESTBSC))

export const web3Clients = {
    56: web3ClientBsc,
    97: web3ClientTestBsc,

}

export const imageUrl = isProduct !== 'local' ? 'http://localhost:8000/api/uploads/' : 'https://api.blackpump.net/api/uploads/'

export const apiUrl = isProduct !== 'local' ? 'http://localhost:8000' : 'https://api.blackpump.net'

export const imageUploadUrl = isProduct !== 'local' ? 'http://localhost:8000/' : 'https://api.blackpump.net/'

export const ethPriceApiUrl = {
 1: 'https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD',
 56: 'https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD',
 97: 'https://min-api.cryptocompare.com/data/price?fsym=BNB&tsyms=USD',
}

export const supportedChainIds = [bscTestnet.id, bsc.id]

export const chainLogos = {
    1: '/eth.svg',
    56: '/bsc.svg',
    97: '/testbsc.svg',
}

export const YourApiKeyToken = "SD2FMSFHNMIHRS3ZBUBRDK7HRM7RIA94RM"

export default function formatNumber(number) {
    if (number >= 1000000) {
        return (number / 1000000).toLocaleString() + 'M';
    } else if (number >= 1000) {
        return (number / 1000).toLocaleString() + 'K';
    } else {
        return number.toString();
    }
}