import React from 'react'
import { createRoot } from 'react-dom/client'
import { ExploreMelegaEcosystem } from '../../apps/web/src/views/HomeTrade/ExploreMelegaEcosystem'
import { CommercialCheckoutModal } from '../../apps/web/src/views/shared/monetization/CommercialCheckoutModal'
import { registerActiveMarcoConnectSdk } from '../../apps/web/src/components/MarcoWidgets/marcoConnectSession'

registerActiveMarcoConnectSdk({
  getState: () => ({
    connected: true,
    wallet: { address: '0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e' },
    mCredits: { available: 40, known: true, currency: 'M-Credits' },
  }),
  refresh: async () => undefined,
  authorizeMCreditsSpend: async ({ merchantOrderRef, maxAmountMinor }) => ({
    ok: true,
    mcreditsAuthorization: 'acceptance_passport_grant',
    merchantOrderRef,
    maxAmountMinor,
    expiresAt: '2099-01-01T00:00:00.000Z',
  }),
})
const token='0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
// Isolated acceptance fixture: NO live API, wallet, order or chain access.
window.fetch = async (input: any, options: any) => {
 const url=String(input)
 let value: any={}
 if(url.includes('/onboard')) value={ok:true,tier:'canonical',onChain:{verifiedDeployment:true,name:'MM72',symbol:'MM72',decimals:18,totalSupplyFormatted:'100000000000',explorerUrl:'https://bscscan.com/token/'+token},project:{displayName:'MM72',slug:'mm72',logoUrl:null,tokens:[{chainId:56,symbol:'MM72'}]},dex:{listed:true,projectClaimed:true,registrySlug:'mm72',symbol:'MM72',name:'MM72',logo:'/images/tokens/0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E.png'}}
 else if(url.includes('/readiness')) value={executable:false,reason:'Acceptance fixture: no payment connection',paymentMethods:{marco:false,mCredits:true}}
 else if(url.includes('/mcredits/orders')) {
  const body=JSON.parse(options?.body||'{}')
  if(body.action==='spend') value={order:{orderId:body.orderId||'mc_acceptance',state:'FULFILLED',referenceAmountMinor:'2900'},payment_id:null,approval_url:null}
  else value={order:{orderId:'mc_acceptance',state:'CREATED',referenceAmountMinor:'2900'},requiredAmountMinor:'2900',insufficient:false,payment_id:null,approval_url:null}
 }
 else if(url.includes('/pair-liquidity')) value={}
 else if(url.includes('/eligible-targets')) value={targets:[]}
 else throw new Error('Blocked acceptance request: '+url)
 return new Response(JSON.stringify(value),{status:200,headers:{'content-type':'application/json'}})
}
function App(){ const [open,setOpen]=React.useState(true);return <><ExploreMelegaEcosystem /><button onClick={()=>setOpen(true)}>Open Boost acceptance</button><CommercialCheckoutModal open={open} onClose={()=>setOpen(false)} projectId="" projectSlug="" chainId={56} identityReady visibilityOnly /></>}
createRoot(document.getElementById('root')!).render(<App/> )
