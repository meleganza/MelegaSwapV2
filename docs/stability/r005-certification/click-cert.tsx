import React from 'react'
import assert from 'node:assert/strict'
import {create, act} from 'react-test-renderer'
import {BnbWalletPrepare} from '../../../apps/next-gen/modules/trade/BnbWalletPrepare'
const tx = {to:'0x7c07082839edd5797737640bba6af47992b9861e',data:'0x12345678',value:'0x0',chainId:56}
const ready = {ok:true,feeBps:20,feeAmountRaw:'2000',gasUnits:'180000',venueLabel:'mock',amountInRaw:'1000000',amountOutRaw:'500000',slippageBps:50,destination:tx.to,approvalTx:null,unsignedTx:tx}
const originalTimer=globalThis.setTimeout
;(globalThis as any).setTimeout=(fn:any)=>originalTimer(fn,0)
async function scenario(receipt:any) {
 let sends=0
 ;(globalThis as any).window={ethereum:{request:async({method}:any)=>{if(method==='eth_requestAccounts')return ['0x1111111111111111111111111111111111111111']; if(method==='eth_chainId')return '0x38';if(method==='eth_sendTransaction'){sends++; return '0x'+'a'.repeat(64)}if(method==='eth_getTransactionReceipt')return receipt;throw Error(method)}}}
 ;(globalThis as any).fetch=async()=>({json:async()=>ready})
 let view:any
 await act(async()=>{view=create(<BnbWalletPrepare sell="WBNB" buy="USDC" amount="0.01"/>)})
 const click=async(label:string)=>{const button=view.root.findAllByType('button').find((b:any)=>b.children.join('')===label);if(button && !button.props.disabled)await act(async()=>{await button.props.onClick()})}
 assert.equal(sends,0)
 await click('Connect BNB wallet');await click('Review BNB swap');assert.equal(sends,0)
 await click('Sign and send swap');assert.equal(sends,1)
 await click('Sign and send swap')
 console.log(JSON.stringify({receipt,sends,duplicate:sends>1}))
 view.unmount()
 return sends
}
async function main(){
const confirmed=await scenario({status:'0x1'})
const pending=await scenario(null)
assert.equal(confirmed,1,'confirmed swap must not be sent twice')
assert.equal(pending,1,'pending swap must not be sent twice')

}
main().catch(e=>{console.error(e);process.exitCode=1})
