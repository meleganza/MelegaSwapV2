// Read-only BSC evidence: only eth_chainId, eth_blockNumber, eth_getCode,
// eth_getStorageAt, eth_call, eth_getLogs and transaction/receipt reads.
const fs=require('fs'),path=require('path'),{utils}=require('ethers')
const out=path.join(__dirname,'evidence'), RPC=process.env.AUDIT_RPC || 'https://bsc-dataseed.binance.org'
async function rpc(method,params){const r=await fetch(RPC,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),signal:AbortSignal.timeout(20000)});return r.json()}
const prefix=process.env.FACTORY_PREFIX || 'factory'
const factory=process.env.FACTORY_ADDRESS || '0x4c33eb3d40c78461dd1a079150fcac6da3c701cf',ordinary='0x0000000000000000000000000000000000001234'
const meta=JSON.parse(fs.readFileSync(path.join(out,`${prefix}-sourcify.json`)))
const abi=new utils.Interface(meta.abi)
;(async()=>{
 const block=await rpc('eth_blockNumber',[]),tag=block.result
 const report={rpc:RPC,observedAt:new Date().toISOString(),chain:await rpc('eth_chainId',[]),block,reads:{}}
 const read=async(name,method,params)=>report.reads[name]=await rpc(method,params)
 await read('factoryCode','eth_getCode',[factory,tag]); await read('factoryOwner','eth_call',[{to:factory,data:abi.encodeFunctionData('owner')},tag])
 report.sourceRuntimeMatchesRpc=report.reads.factoryCode.result===meta.runtimeBytecode.onchainBytecode
 const owner=utils.defaultAbiCoder.decode(['address'],report.reads.factoryOwner.result)[0]
 await read('ownerCode','eth_getCode',[owner,tag])
 const args=['0x963556de0eb8138e97a85f0a86ee0acd159d210b','0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',1,parseInt(tag,16)+100,parseInt(tag,16)+200,0,ordinary]
 const data=abi.encodeFunctionData('deployPool',args)
 await read('ordinaryDeployPoolSimulation','eth_call',[{from:ordinary,to:factory,data},tag])
 const slot='0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc'
 await read('factoryEip1967Implementation','eth_getStorageAt',[factory,slot,tag])
 const pools=['0x99a44d26defb3f0a5b4e306ce45538c66c05b69e','0x7b072c20d2f03393145c6829175e9ac975fa2cfe','0x2bd7d2a773b525133c9a87910ae6baf8159d9484']
 report.pools=[]
 const view=new utils.Interface(['function owner() view returns(address)','function stakedToken() view returns(address)','function rewardToken() view returns(address)','function SMART_CHEF_FACTORY() view returns(address)','function startBlock() view returns(uint256)','function bonusEndBlock() view returns(uint256)','function rewardPerBlock() view returns(uint256)'])
 for(const address of pools){const p={address,code:await rpc('eth_getCode',[address,tag]),calls:{}}; for(const name of ['owner','stakedToken','rewardToken','SMART_CHEF_FACTORY','startBlock','bonusEndBlock','rewardPerBlock']){const res=await rpc('eth_call',[{to:address,data:view.encodeFunctionData(name)},tag]);p.calls[name]=res.result?String(view.decodeFunctionResult(name,res.result)[0]):res}
  report.pools.push(p)
 }
 await read('factoryDeploymentTx','eth_getTransactionByHash',[meta.deployment.transactionHash]);await read('factoryDeploymentReceipt','eth_getTransactionReceipt',[meta.deployment.transactionHash])
 const topic=utils.id('NewSmartChefContract(address)')
 await read('earlyCreationEvents','eth_getLogs',[{address:factory,fromBlock:utils.hexValue(Number(meta.deployment.blockNumber)),toBlock:utils.hexValue(Number(meta.deployment.blockNumber)+49999),topics:[topic]}])
 const logs=report.reads.earlyCreationEvents.result||[]
 if(logs.length){await read('samplePoolCreationTx','eth_getTransactionByHash',[logs[0].transactionHash]);await read('samplePoolCreationReceipt','eth_getTransactionReceipt',[logs[0].transactionHash])}
 fs.writeFileSync(path.join(out,`${prefix}-rpc-audit.json`),JSON.stringify(report,null,2));console.log({block:parseInt(tag,16),owner,matched:report.sourceRuntimeMatchesRpc,permission:report.reads.ordinaryDeployPoolSimulation,events:report.reads.earlyCreationEvents,pools:report.pools.map(p=>({address:p.address,calls:p.calls}))})
})().catch(e=>{console.error(e);process.exitCode=1})
