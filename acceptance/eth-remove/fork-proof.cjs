// Local Anvil only: never signs or sends to a public RPC.
const { providers, Contract, constants, utils } = require('ethers')
const fs = require('fs')
const endpoint = process.env.LOCAL_FORK_URL || 'http://127.0.0.1:18545'
if (!/^http:\/\/127\.0\.0\.1:\d+$/.test(endpoint)) throw Error('LOCAL_FORK_REQUIRED')
const owner = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
const lpAddress = '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E'
const routerAddress = '0xFF8EBf8edf1C533A02d066f852788773BdCD631C'
async function main() {
  const p = new providers.JsonRpcProvider(endpoint)
  if (!(await p.send('web3_clientVersion', [])).toLowerCase().includes('anvil')) throw Error('ANVIL_REQUIRED')
  if ((await p.getNetwork()).chainId !== 1) throw Error('CHAIN_1_REQUIRED')
  await p.send('anvil_reset', [
    { forking: { jsonRpcUrl: 'https://ethereum-rpc.publicnode.com', blockNumber: 26013025 } },
  ])
  await p.send('anvil_impersonateAccount', [owner])
  await p.send('anvil_setBalance', [owner, '0x56BC75E2D63100000'])
  const signer = p.getSigner(owner)
  const lp = new Contract(
    lpAddress,
    [
      'function token0() view returns(address)',
      'function token1() view returns(address)',
      'function factory() view returns(address)',
      'function getReserves() view returns(uint112,uint112,uint32)',
      'function totalSupply() view returns(uint256)',
      'function balanceOf(address) view returns(uint256)',
      'function allowance(address,address) view returns(uint256)',
      'function approve(address,uint256) returns(bool)',
    ],
    signer,
  )
  const router = new Contract(
    routerAddress,
    [
      'function factory() view returns(address)',
      'function WETH() view returns(address)',
      'function removeLiquidity(address,address,uint256,uint256,uint256,address,uint256) returns(uint256,uint256)',
      'function removeLiquidityETH(address,uint256,uint256,uint256,address,uint256) returns(uint256,uint256)',
    ],
    signer,
  )
  const [token0, token1, factory, routerFactory, weth, balance, supply, reserves, allowance] = await Promise.all([
    lp.token0(),
    lp.token1(),
    lp.factory(),
    router.factory(),
    router.WETH(),
    lp.balanceOf(owner),
    lp.totalSupply(),
    lp.getReserves(),
    lp.allowance(owner, routerAddress),
  ])
  if (factory !== routerFactory) throw Error('FACTORY_MISMATCH')
  const factoryContract = new Contract(factory, ['function getPair(address,address) view returns(address)'], p)
  if ((await factoryContract.getPair(token0, token1)).toLowerCase() !== lpAddress.toLowerCase())
    throw Error('PAIR_MISMATCH')
  const liquidity = balance.div(2),
    amountA = reserves[0].mul(liquidity).div(supply),
    amountB = reserves[1].mul(liquidity).div(supply)
  const deadline = (await p.getBlock('latest')).timestamp + 1200
  const args = [
    token0,
    token1,
    liquidity.toString(),
    amountA.mul(9950).div(10000).toString(),
    amountB.mul(9950).div(10000).toString(),
    owner,
    String(deadline),
  ]
  const evidence = {
    forkBlock: 26013025,
    owner,
    lp: lpAddress,
    router: routerAddress,
    factory,
    routerFactory,
    weth,
    token0,
    token1,
    lpBalance: balance.toString(),
    totalSupply: supply.toString(),
    reserves: reserves.map(String),
    publicAllowance: allowance.toString(),
    walletChainId: 1,
    signerChainId: await signer.getChainId(),
    permit: false,
    slippageBips: 50,
    amountA: amountA.toString(),
    amountB: amountB.toString(),
    args,
  }
  await (await lp.approve(routerAddress, 0)).wait()
  evidence.allowanceBefore = (await lp.allowance(owner, routerAddress)).toString()
  try {
    await router.callStatic.removeLiquidity(...args)
    throw Error('EXPECTED_EVM_REVERT')
  } catch (e) {
    if (e.code !== 'CALL_EXCEPTION' || e.reason !== 'ds-math-sub-underflow' || !e.data?.startsWith('0x08c379a0'))
      throw e
    evidence.beforeApprovalRevert = { code: e.code, reason: e.reason, data: e.data }
  }
  const approval = await lp.approve(routerAddress, constants.MaxUint256)
  const receipt = await approval.wait()
  if (receipt.status !== 1) throw Error('APPROVAL_FAILED')
  evidence.approve = {
    hash: approval.hash,
    to: approval.to,
    data: approval.data,
    receipt: { status: receipt.status, blockNumber: receipt.blockNumber, transactionHash: receipt.transactionHash },
  }
  evidence.allowanceAfter = (await lp.allowance(owner, routerAddress)).toString()
  evidence.removeCallResult = (await router.callStatic.removeLiquidity(...args)).map(String)
  evidence.removeEstimateGas = (await router.estimateGas.removeLiquidity(...args)).toString()
  evidence.removePayload = {
    to: routerAddress,
    data: router.interface.encodeFunctionData('removeLiquidity', args),
    value: '0',
    chainId: 1,
    from: owner,
  }
  const nativeArgs = [token0, ...args.slice(2)]
  evidence.nativeCallResult = (await router.callStatic.removeLiquidityETH(...nativeArgs)).map(String)
  fs.writeFileSync(
    process.env.EVIDENCE_PATH || 'acceptance/eth-remove/fork-evidence.json',
    JSON.stringify(evidence, null, 2) + '\n',
  )
  console.log(JSON.stringify(evidence, null, 2))
  await p.send('anvil_stopImpersonatingAccount', [owner])
}
main().catch((e) => {
  console.error(e)
  process.exitCode = 1
})
