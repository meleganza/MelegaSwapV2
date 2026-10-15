import React from 'react'
import assert from 'node:assert/strict'
import {create,act} from 'react-test-renderer'
import {BnbWalletPrepare} from '../../../apps/next-gen/modules/trade/BnbWalletPrepare'
const tx={to:'0x7c07082839edd5797737640bba6af47992b9861e',data:'0x12345678',value:'0x0',chainId:56}
const ready={ok:true,feeBps:20,feeAmountRaw:'2000',gasUnits:'180000',venueLabel:'mock',amountInRaw:'1000000',amountOutRaw:'500000',slippageBps:50,destination:tx.to,approvalTx:null,unsignedTx:tx}
const approval={...ready,ok:false,approvalTx:{...tx,data:'0x095ea7b3'},unsignedTx:null}
const timer=globalThis.setTimeout
;(globalThis as any).setTimeout=(fn:any)=>timer(fn,0)
async function run(name:string,options:any={}){
 let sends=0,reads=0,chain='0x38',view:any
 ;(globalThis as any).fetch=async()=>({json:async()=>{reads++;return options.review?options.review(reads):ready}})
 ;(globalThis as any).window={ethereum:{request:async({method}:any)=>{
  if(method==='eth_requestAccounts')return ['0x1111111111111111111111111111111111111111']
  if(method==='eth_chainId')return chain
  if(method==='eth_sendTransaction'){if(options.reject)throw {code:4001};sends++;return '0x'+'a'.repeat(64)}
  if(method==='eth_getTransactionReceipt'){if(options.receiptError)throw Error('RPC_DOWN');return options.pending?null:{status:options.failed?'0x0':'0x1'}}
  throw Error(method)
 }}}
 await act(async()=>{view=create(<BnbWalletPrepare sell="WBNB" buy="USDC" amount="0.01"/>)})
 const click=async(label:string)=>{const b=view.root.findAllByType('button').find((x:any)=>x.children.join('')===label);if(b&&!b.props.disabled)await act(async()=>{await b.props.onClick()})}
 assert.equal(sends,0)
 await click('Connect BNB wallet');await click('Review BNB swap');assert.equal(sends,0)
 if(options.wrongChain)chain='0x1'
 const label=options.approve?'Approve token in wallet':'Sign and send swap'
 await click(label);if(!options.once)await click(label)
 assert.equal(sends,options.expected??1,name)
 if(options.approve&&options.completeApproval){assert.equal(sends,1);await click('Sign and send swap');assert.equal(sends,2)}
 console.log(JSON.stringify({name,sends,pass:true}));view.unmount()
}
async function main(){
 await run('confirmed no duplicate')
 await run('pending no duplicate',{pending:true})
 await run('failed receipt no duplicate',{failed:true})
 await run('receipt RPC error no duplicate',{receiptError:true})
 await run('reject sends nothing',{reject:true,expected:0})
 await run('chain changes before click',{wrongChain:true,expected:0})
 await run('gas missing',{review:()=>({...ready,gasUnits:null}),expected:0})
 await run('calldata replacement',{once:true,review:(n:number)=>n===1?ready:{...ready,unsignedTx:{...tx,data:'0x99999999'}},expected:0})
 await run('stale quote',{review:(n:number)=>n===1?ready:{ok:false,code:'QUOTE_STALE',approvalTx:null,unsignedTx:null},expected:0})
 await run('approval pending locked',{approve:true,pending:true,review:()=>approval})
 await run('allowance race locked',{approve:true,review:()=>approval})
 await run('approve receipt then separate swap click',{approve:true,completeApproval:true,review:(n:number)=>n<=2?approval:ready})
}
main().catch(e=>{console.error(e);process.exitCode=1})
