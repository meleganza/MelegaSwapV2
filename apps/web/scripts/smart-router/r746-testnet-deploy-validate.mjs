#!/usr/bin/env node
/**
 * R746 — BSC Testnet wrapper deploy, BscScan verify, constitutional validation (3/3), registry publish.
 *
 * Required env:
 *   TESTNET_DEPLOYER — hex private key (broadcast + validation swaps)
 *   DEPLOYER_OWNER   — wrapper Ownable owner (defaults to deployer address)
 *   BSCSCAN_API_KEY  — optional but required for --verify
 *
 * Optional:
 *   WRAPPER_ADDRESS  — skip deploy, validate existing wrapper
 *   SKIP_DEPLOY=1    — validate only
 *   SKIP_VERIFY=1    — skip BscScan verification
 *   SKIP_REGISTRY=1  — do not write registry files
 */
import { spawnSync } from 'child_process'
import { readFileSync, readdirSync, existsSync } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { Contract } from '@ethersproject/contracts'
import { Wallet } from '@ethersproject/wallet'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { Interface } from '@ethersproject/abi'
import { parseUnits, formatUnits } from '@ethersproject/units'
import { id } from '@ethersproject/hash'
import {
  PATHS,
  loadJson,
  writeJson,
  optionalEnv,
  requireEnv,
  todayIso,
} from './_deployEnv.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '../../../..')

const CHAIN_ID = 97
const RPC = optionalEnv('BNB_TESTNET_RPC_URL') ?? 'https://data-seed-prebsc-1-s1.binance.org:8545/'
const EXPLORER = 'https://testnet.bscscan.com'

const ADDR = {
  underlyingRouter: '0xD99D1c33F9fC3444f8101754aBC46c52416550D1',
  treasuryIntake: '0xe674b1d925d79f5A0053e40cC7cdED7841AD4164',
  marco: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  wbnb: '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
  usdt: '0x337610d27c682E347C9cD60BD4b3b107C9d34dDd',
  pairMarcoWbnb: '0x6eFCe8f5C7Fb3B979A6a2Be4a62DB4A055c666E0',
}

const WRAPPER_IFACE = new Interface([
  'function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address recipient, uint256 deadline) payable returns (uint256 amountOut)',
  'function swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path, address recipient, uint256 deadline) returns (uint256 amountOut)',
  'event ProtocolFeeCollected(address indexed user, address indexed inputToken, address indexed outputToken, address feeToken, uint256 grossAmountIn, uint256 netAmountIn, uint256 feeAmount, uint16 protocolFeeBps, bool buyMarcoIncentiveApplied, address underlyingRouter, address treasuryCollector, bytes32 pricingRefHash, bytes32 treasuryPolicyRefHash)',
  'event SmartRouterSwapRouted(address indexed user, address indexed inputToken, address indexed outputToken, uint256 grossAmountIn, uint256 netAmountIn, uint256 amountOut, address underlyingRouter, bytes32 routeHash)',
  'event TreasuryHandoffPrepared(bytes32 indexed executionId, bytes32 indexed routeType, address treasuryCollector, uint256 protocolFee, bytes32 treasuryPolicyRefHash, bytes32 pricingRefHash)',
])

const ERC20_IFACE = new Interface([
  'function approve(address spender, uint256 amount) returns (bool)',
  'function balanceOf(address owner) view returns (uint256)',
  'function allowance(address owner, address spender) view returns (uint256)',
])

 = id(
  'ProtocolFeeCollected(address,address,address,address,uint256,uint256,uint256,uint16,bool,address,address,bytes32,bytes32)',
)
const TOPIC_SWAP_ROUTED = id(
  'SmartRouterSwapRouted(address,address,address,uint256,uint256,uint256,address,bytes32)',
)
const TOPIC_HANDOFF = id(
  'TreasuryHandoffPrepared(bytes32,bytes32,address,uint256,bytes32,bytes32)',
)

function envAddress(name, fallback) {
  const v = optionalEnv(name)
  if (v && /^0x[a-fA-F0-9]{40}$/.test(v)) return v
  return fallback
}

function latestBroadcastWrapper() {
  const dir = path.join(REPO_ROOT, 'broadcast/DeployMelegaSmartRouterWrapper.s.sol', String(CHAIN_ID))
  if (!existsSync(dir)) return null
  const runs = readdirSync(dir)
    .filter((f) => f.endsWith('.json') && f !== 'run-latest.json')
    .sort()
  if (runs.length === 0) return null
  const latest = path.join(dir, runs[runs.length - 1])
  const data = JSON.parse(readFileSync(latest, 'utf8'))
  for (const tx of data.transactions ?? []) {
    if (tx.contractName === 'MelegaSmartRouterWrapper' && tx.contractAddress) {
      return tx.contractAddress
    }
  }
  return null
}

function runForgeDeploy(privateKey, owner) {
  const env = {
    ...process.env,
    CHAIN_ID: String(CHAIN_ID),
    UNDERLYING_ROUTER: ADDR.underlyingRouter,
    TREASURY_INTAKE: ADDR.treasuryIntake,
    MARCO_TOKEN: ADDR.marco,
    DEPLOYER_OWNER: owner,
    BNB_TESTNET_RPC_URL: RPC,
  }

  const args = [
    'script',
    'script/DeployMelegaSmartRouterWrapper.s.sol',
    '--rpc-url',
    RPC,
    '--private-key',
    privateKey,
    '--broadcast',
    '-vvvv',
  ]
  if (!optionalEnv('SKIP_VERIFY') && optionalEnv('BSCSCAN_API_KEY')) {
    args.push('--verify')
  }

  const result = spawnSync('forge', args, { cwd: REPO_ROOT, env, encoding: 'utf8' })
  return {
    ok: result.status === 0,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
    status: result.status,
  }
}

async function ensureAllowance(signer, token, spender, amount) {
  const c = new Contract(token, ERC20_IFACE, signer)
  const owner = await signer.getAddress()
  const current = await c.allowance(owner, spender)
  if (current.gte(amount)) return
  const tx = await c.approve(spender, BigNumber.from(2).pow(256).sub(1))
  await tx.wait(1)
}

function parseReceiptEvents(receipt) {
  const found = {
    ProtocolFeeCollected: false,
    SmartRouterSwapRouted: false,
    TreasuryHandoffPrepared: false,
    protocolFeeBps: null,
    buyMarcoIncentiveApplied: null,
    feeAmount: null,
  }
  for (const log of receipt.logs ?? []) {
    if (log.topics[0] === TOPIC_PROTOCOL_FEE) {
      found.ProtocolFeeCollected = true
      const decoded = WRAPPER_IFACE.decodeEventLog('ProtocolFeeCollected', log.data, log.topics)
      found.protocolFeeBps = decoded.protocolFeeBps
      found.buyMarcoIncentiveApplied = decoded.buyMarcoIncentiveApplied
      found.feeAmount = decoded.feeAmount.toString()
    }
    if (log.topics[0] === TOPIC_SWAP_ROUTED) found.SmartRouterSwapRouted = true
    if (log.topics[0] === TOPIC_HANDOFF) found.TreasuryHandoffPrepared = true
  }
  return found
}

async function treasuryBalanceDelta(provider, token, before) {
  const c = new Contract(token, ERC20_IFACE, provider)
  const after = await c.balanceOf(ADDR.treasuryIntake)
  return after.sub(before)
}

async function runConstitutionalSwap({ provider, signer, wrapper, routeType }) {
  const owner = await signer.getAddress()
  const deadline = Math.floor(Date.now() / 1000) + 1200
  const wrapperC = new Contract(wrapper, WRAPPER_IFACE, signer)
  let tx

  if (routeType === 'STANDARD_SWAP') {
    const gross = parseUnits('0.01', 18)
    const pathTokens = [ADDR.wbnb, ADDR.usdt]
    tx = await wrapperC.swapExactETHForTokens(1, pathTokens, owner, deadline, { value: gross })
    const expectedBps = 30
    const receipt = await tx.wait(1)
    const events = parseReceiptEvents(receipt)
    const pass =
      receipt.status === 1 &&
      events.ProtocolFeeCollected &&
      events.SmartRouterSwapRouted &&
      events.TreasuryHandoffPrepared &&
      events.protocolFeeBps === expectedBps &&
      events.buyMarcoIncentiveApplied === false
    return { routeType, txHash: receipt.transactionHash, pass, events, executionManifest: buildManifest(routeType, receipt.transactionHash) }
  }

  if (routeType === 'BUY_MARCO') {
    const gross = parseUnits('0.005', 18)
    const pathTokens = [ADDR.wbnb, ADDR.marco]
    tx = await wrapperC.swapExactETHForTokens(1, pathTokens, owner, deadline, { value: gross })
    const receipt = await tx.wait(1)
    const events = parseReceiptEvents(receipt)
    const pass =
      receipt.status === 1 &&
      events.ProtocolFeeCollected &&
      events.SmartRouterSwapRouted &&
      events.TreasuryHandoffPrepared &&
      events.protocolFeeBps === 20 &&
      events.buyMarcoIncentiveApplied === true
    return { routeType, txHash: receipt.transactionHash, pass, events, executionManifest: buildManifest(routeType, receipt.transactionHash) }
  }

  if (routeType === 'SELL_MARCO') {
    const gross = parseUnits('100', 18)
    await ensureAllowance(signer, ADDR.marco, wrapper, gross)
    const pathTokens = [ADDR.marco, ADDR.wbnb]
    tx = await wrapperC.swapExactTokensForTokens(gross, 1, pathTokens, owner, deadline)
    const receipt = await tx.wait(1)
    const events = parseReceiptEvents(receipt)
    const pass =
      receipt.status === 1 &&
      events.ProtocolFeeCollected &&
      events.SmartRouterSwapRouted &&
      events.TreasuryHandoffPrepared &&
      events.protocolFeeBps === 30 &&
      events.buyMarcoIncentiveApplied === false
    return { routeType, txHash: receipt.transactionHash, pass, events, executionManifest: buildManifest(routeType, receipt.transactionHash) }
  }

  throw new Error(`Unknown route type: ${routeType}`)
}

function buildManifest(routeType, txHash) {
  return {
    schema: 'melega.execution-manifest.v1',
    executionId: txHash,
    executionTimestamp: new Date().toISOString(),
    chainId: CHAIN_ID,
    routeType,
    status: 'prepared',
    validationState: 'valid',
    receiptHash: txHash,
  }
}

function updateRegistries(wrapperAddress) {
  const index = loadJson(PATHS.registryIndex)
  const chain = index.chains['97']
  if (!chain) throw new Error('Chain 97 missing from registry index')

  chain.wrapperAddress = wrapperAddress
  chain.status = 'active_testnet'
  chain.executableRouteTypes = ['STANDARD_SWAP', 'BUY_MARCO', 'SELL_MARCO']
  chain.blockerReason = null
  chain.lastVerification = todayIso()
  if (chain.wrapper) {
    chain.wrapper.address = wrapperAddress
    chain.wrapper.status = 'active_testnet'
  }
  index.asOf = todayIso()
  writeJson(PATHS.registryIndex, index)

  const civ = loadJson(PATHS.civilizationContract)
  const c97 = civ.supportedChains?.['97']
  if (c97) {
    c97.wrapperAddress = wrapperAddress
    c97.underlyingRouter = ADDR.underlyingRouter
    c97.treasuryCollector = ADDR.treasuryIntake
    c97.status = 'active_testnet'
    c97.blockerReason = null
    c97.lastVerifiedAt = todayIso()
  }
  civ.wrapperAddress = wrapperAddress
  civ.wrapperStatus = 'active_testnet'
  civ.ABI = { ...civ.ABI, deployed: true }
  civ.lastVerifiedAt = todayIso()
  writeJson(PATHS.civilizationContract, civ)

  return { indexPath: PATHS.registryIndex, civPath: PATHS.civilizationContract }
}

async function main() {
  const report = {
    task: 'R746',
    chainId: CHAIN_ID,
    timestamp: new Date().toISOString(),
    addresses: ADDR,
    verdict: 'BLOCKED',
  }

  const skipDeploy = optionalEnv('SKIP_DEPLOY') === '1'
  let wrapperAddress = optionalEnv('WRAPPER_ADDRESS')
  let deployTxHash = optionalEnv('DEPLOY_TX_HASH')

  if (!wrapperAddress && !skipDeploy) {
    const privateKey = optionalEnv('TESTNET_DEPLOYER')
    if (!privateKey) {
      report.blocker = 'TESTNET_DEPLOYER not set — cannot broadcast wrapper deploy'
      report.dryRunCommand = `CHAIN_ID=97 UNDERLYING_ROUTER=${ADDR.underlyingRouter} TREASURY_INTAKE=${ADDR.treasuryIntake} MARCO_TOKEN=${ADDR.marco} DEPLOYER_OWNER=<owner> forge script script/DryRunWrapperDeploy.s.sol -vvv`
      report.deployCommand = `TESTNET_DEPLOYER=<key> DEPLOYER_OWNER=<owner> BSCSCAN_API_KEY=<key> node apps/web/scripts/smart-router/r746-testnet-deploy-validate.mjs`
      console.log(JSON.stringify(report, null, 2))
      process.exit(1)
    }

    const provider = new JsonRpcProvider(RPC, CHAIN_ID)
    const wallet = new Wallet(privateKey, provider)
    const owner = envAddress('DEPLOYER_OWNER', await wallet.getAddress())

    report.deployer = await wallet.getAddress()
    report.owner = owner

    const build = spawnSync('forge', ['build'], { cwd: REPO_ROOT, encoding: 'utf8' })
    if (build.status !== 0) {
      report.blocker = 'forge build failed'
      report.forgeBuild = build.stderr?.slice(-500)
      console.log(JSON.stringify(report, null, 2))
      process.exit(1)
    }

    const deploy = runForgeDeploy(privateKey, owner)
    report.deploy = { ok: deploy.ok, status: deploy.status, tail: (deploy.stdout + deploy.stderr).slice(-3000) }
    if (!deploy.ok) {
      report.blocker = 'Wrapper deploy broadcast failed'
      console.log(JSON.stringify(report, null, 2))
      process.exit(1)
    }

    wrapperAddress = latestBroadcastWrapper()
    if (!wrapperAddress) {
      const match = (deploy.stdout + deploy.stderr).match(/MelegaSmartRouterWrapper:\s*(0x[a-fA-F0-9]{40})/)
      wrapperAddress = match?.[1] ?? null
    }
    if (!wrapperAddress) {
      report.blocker = 'Deploy succeeded but wrapper address not found in broadcast artifacts'
      console.log(JSON.stringify(report, null, 2))
      process.exit(1)
    }
    deployTxHash = deployTxHash ?? 'see broadcast artifact'
  }

  if (!wrapperAddress) {
    report.blocker = 'WRAPPER_ADDRESS required when SKIP_DEPLOY=1'
    console.log(JSON.stringify(report, null, 2))
    process.exit(1)
  }

  report.wrapperAddress = wrapperAddress
  report.deployTxHash = deployTxHash
  report.verificationUrl = `${EXPLORER}/address/${wrapperAddress}`

  const privateKey = requireEnv('TESTNET_DEPLOYER')
  const provider = new JsonRpcProvider(RPC, CHAIN_ID)
  const signer = new Wallet(privateKey, provider)

  const routeTypes = ['STANDARD_SWAP', 'BUY_MARCO', 'SELL_MARCO']
  const validations = []
  for (const routeType of routeTypes) {
    try {
      const result = await runConstitutionalSwap({ provider, signer, wrapper: wrapperAddress, routeType })
      validations.push(result)
    } catch (e) {
      validations.push({ routeType, pass: false, error: e?.message ?? String(e) })
    }
  }

  report.validations = validations.map((v) => ({
    routeType: v.routeType,
    pass: v.pass,
    txHash: v.txHash ?? null,
    bscScan: v.txHash ? `${EXPLORER}/tx/${v.txHash}` : null,
    events: v.events ?? null,
    executionManifest: v.executionManifest ?? null,
    error: v.error ?? null,
  }))

  const passCount = validations.filter((v) => v.pass).length
  report.passCount = `${passCount}/3`

  if (passCount === 3) {
    report.verdict = 'PASS'
    if (optionalEnv('SKIP_REGISTRY') !== '1') {
      report.registryUpdate = updateRegistries(wrapperAddress)
    }
  } else {
    report.verdict = 'BLOCKED'
    report.blocker = 'Constitutional validation did not reach 3/3 PASS'
  }

  console.log(JSON.stringify(report, null, 2))
  process.exit(report.verdict === 'PASS' ? 0 : 1)
}

main().catch((e) => {
  console.error(JSON.stringify({ task: 'R746', verdict: 'BLOCKED', error: e?.message ?? String(e) }, null, 2))
  process.exit(1)
})
