import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://bsc.nodereal.io'
export const BASE_PROD_NODE = 'https://base-rpc.publicnode.com'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)
export const baseRpcProvider = new StaticJsonRpcProvider(BASE_PROD_NODE)

export default null
