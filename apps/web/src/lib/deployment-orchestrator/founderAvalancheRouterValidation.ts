/**
 * Post-deploy validation plan for Avalanche V2 Router (no SSOT bind in this mission).
 */
import { Interface } from '@ethersproject/abi'
import { AUTHORIZED_MELEGA_DEPLOYER } from './founderDeployer'
import {
  AVAX_ROUTER_CHAIN_ID,
  AVAX_ROUTER_FACTORY,
  AVAX_ROUTER_WAVAX,
} from './founderAvalancheRouterArtifacts'

export const AVAX_ROUTER_POST_DEPLOY_CHECKS = [
  'receipt.status === success',
  'receipt.from === MELEGA DEPLOYER',
  'contract address has bytecode',
  'runtime bytecode SHA-256 matches certified expectedRuntimeBytecodeSha256',
  'router.factory() === Avalanche Factory',
  'router.WETH() === canonical WAVAX',
  'getAmountsOut selector encodes and responds (may revert without liquidity — encoding OK)',
  'addLiquidity calldata encodes correctly',
  'swapExactTokensForTokens calldata encodes correctly',
  'no proxy (implementation slot empty / no EIP-1967 admin)',
  'no owner() / no unexpected authority surface',
] as const

export type AvaxRouterPostDeployPlan = {
  chainId: typeof AVAX_ROUTER_CHAIN_ID
  requireDeployer: typeof AUTHORIZED_MELEGA_DEPLOYER
  expectedFactory: typeof AVAX_ROUTER_FACTORY
  expectedWeth: typeof AVAX_ROUTER_WAVAX
  bindSsotAfterPass: false
  markAvalancheLiveAfterPass: false
  checks: readonly string[]
  encodeSmoke: {
    factory: string
    WETH: string
    getAmountsOut: string
    addLiquidity: string
    swapExactTokensForTokens: string
  }
}

const ROUTER_IFACE = new Interface([
  'function factory() view returns (address)',
  'function WETH() view returns (address)',
  'function getAmountsOut(uint256 amountIn, address[] path) view returns (uint256[] amounts)',
  'function addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired, uint256 amountAMin, uint256 amountBMin, address to, uint256 deadline) returns (uint256 amountA, uint256 amountB, uint256 liquidity)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] path, address to, uint256 deadline) returns (uint256[] amounts)',
  'function owner() view returns (address)',
])

export function buildAvalancheRouterPostDeployPlan(): AvaxRouterPostDeployPlan {
  const deadline = 2_000_000_000
  return {
    chainId: AVAX_ROUTER_CHAIN_ID,
    requireDeployer: AUTHORIZED_MELEGA_DEPLOYER,
    expectedFactory: AVAX_ROUTER_FACTORY,
    expectedWeth: AVAX_ROUTER_WAVAX,
    bindSsotAfterPass: false,
    markAvalancheLiveAfterPass: false,
    checks: AVAX_ROUTER_POST_DEPLOY_CHECKS,
    encodeSmoke: {
      factory: ROUTER_IFACE.encodeFunctionData('factory', []),
      WETH: ROUTER_IFACE.encodeFunctionData('WETH', []),
      getAmountsOut: ROUTER_IFACE.encodeFunctionData('getAmountsOut', [
        1n,
        [AVAX_ROUTER_WAVAX, AVAX_ROUTER_FACTORY],
      ]),
      addLiquidity: ROUTER_IFACE.encodeFunctionData('addLiquidity', [
        AVAX_ROUTER_WAVAX,
        AVAX_ROUTER_FACTORY,
        1n,
        1n,
        0n,
        0n,
        AUTHORIZED_MELEGA_DEPLOYER,
        deadline,
      ]),
      swapExactTokensForTokens: ROUTER_IFACE.encodeFunctionData('swapExactTokensForTokens', [
        1n,
        0n,
        [AVAX_ROUTER_WAVAX, AVAX_ROUTER_FACTORY],
        AUTHORIZED_MELEGA_DEPLOYER,
        deadline,
      ]),
    },
  }
}

export const AVALANCHE_ACTIVATION_GATES = [
  'Router bound in canonical SSOT (melegaChainRegistry + exchange router map)',
  'At least one factual Melega Avalanche pair exists',
  'Pair has real liquidity',
  'getAmountsOut returns a valid quote',
  'Controlled wallet-signed swap succeeds',
  'Smart Swap uses the new Router',
  '25% estimated-gas fee paid in AVAX to 0xb6436EF4c7f76bE0f26c0C5C9dB72F2689abF65b',
] as const

export const AVALANCHE_STATUS_UNTIL_ACTIVATION = 'LIVE' as const
