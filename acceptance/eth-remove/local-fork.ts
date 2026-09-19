import { Contract, providers } from 'ethers'
import routerAbi from '../../apps/web/src/config/abi/IPancakeRouter02.json'
import tokenAbi from '../../apps/web/src/config/abi/erc20.json'

// Only the localhost fork is writable. No injected wallet or private key is used.
export async function createLocalFork(evidence: unknown[]) {
  const provider = new providers.JsonRpcProvider('http://127.0.0.1:18545')
  if (!(await provider.send('web3_clientVersion', [])).toLowerCase().includes('anvil')) throw Error('ANVIL_REQUIRED')
  if ((await provider.getNetwork()).chainId !== 1) throw Error('CHAIN_1_REQUIRED')
  const owner = '0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'
  const lp = '0x7f0183D7C1B0365A3580ecBdB2f0D8DB2D693c5E'
  const routerAddress = '0xFF8EBf8edf1C533A02d066f852788773BdCD631C'
  await provider.send('anvil_setAutomine', [true])
  await provider.send('anvil_impersonateAccount', [owner])
  await provider.send('anvil_setBalance', [owner, '0x56BC75E2D63100000'])
  const signer = provider.getSigner(owner)
  const token = new Contract(lp, [...tokenAbi, 'function getReserves() view returns(uint112,uint112,uint32)'], signer)
  const router = new Contract(routerAddress, routerAbi, signer)
  const balance = await token.balanceOf(owner)
  const supply = await token.totalSupply()
  const reserves = await token.getReserves()
  evidence.push({
    event: 'fork initial state',
    walletChain: 1,
    signerChain: await signer.getChainId(),
    owner,
    lp,
    router: routerAddress,
    balance: balance.toString(),
    allowance: (await token.allowance(owner, routerAddress)).toString(),
  })
  // Reset approval only on Anvil to exercise the complete approval UI.
  await (await token.approve(routerAddress, 0)).wait()
  let approvalHash: string | undefined
  const publicReader = {
    allowance: async () => {
      throw Error('Unauthorized: You must authenticate your request with an API key')
    },
  }
  return {
    owner,
    balance: balance.toString(),
    supply: supply.toString(),
    reserves: reserves.map(String),
    tokenContract: (address: string, withSigner = true) =>
      withSigner ? new Contract(address, tokenAbi, signer) : publicReader,
    approve: async (contract: Contract, method: string, args: unknown[], overrides: unknown) => {
      await provider.send('anvil_setAutomine', [false])
      const tx = await contract[method](...args, overrides)
      approvalHash = tx.hash
      evidence.push({ event: 'fork approve payload', to: tx.to, hash: tx.hash, data: tx.data, chainId: tx.chainId })
      return tx
    },
    confirm: async () => {
      await provider.send('evm_mine', [])
      await provider.send('anvil_setAutomine', [true])
      const receipt = await provider.getTransactionReceipt(approvalHash!)
      if (receipt.status !== 1) throw Error('APPROVAL_FAILED')
      evidence.push({
        event: 'fork approval receipt',
        hash: receipt.transactionHash,
        status: receipt.status,
        allowance: (await token.allowance(owner, routerAddress)).toString(),
      })
    },
    router: {
      address: routerAddress,
      estimateGas: router.estimateGas,
      removeLiquidity: async (...args: unknown[]) => {
        const txArgs = args.slice(0, -1)
        const result = await router.callStatic.removeLiquidity(...txArgs)
        const payload = await router.populateTransaction.removeLiquidity(...args)
        evidence.push({
          event: 'fork remove payload ready',
          chainId: 1,
          walletChain: 1,
          signerChain: await signer.getChainId(),
          permit: false,
          args: txArgs,
          payload,
          ethCallResult: result.map(String),
        })
        return router.removeLiquidity(...args)
      },
    },
  }
}
