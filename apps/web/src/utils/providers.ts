import { StaticJsonRpcProvider } from '@ethersproject/providers'

export const BSC_PROD_NODE = process.env.NEXT_PUBLIC_NODE_PRODUCTION || 'https://bsc.nodereal.io'
export const BASE_PROD_NODE = 'https://base-rpc.publicnode.com'
export const POLYGON_PROD_NODE = 'https://polygon.drpc.org'

export const bscRpcProvider = new StaticJsonRpcProvider(BSC_PROD_NODE)
export const baseRpcProvider = new StaticJsonRpcProvider(BASE_PROD_NODE)
export const polygonRpcProvider = new StaticJsonRpcProvider(POLYGON_PROD_NODE)

export default null
