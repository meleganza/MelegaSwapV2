import React from 'react'
import { useAccount, useSigner } from 'wagmi'
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { CommercialCheckoutModal } from '../CommercialCheckoutModal'
import { ECOSYSTEM_DESTINATIONS } from 'views/HomeTrade/ecosystemDestinations'
vi.mock('wagmi', () => ({ useAccount: vi.fn(() => ({address: undefined})), useSigner: vi.fn(() => ({data: undefined})) }))
vi.mock('components/MarcoWidgets', () => ({ MarcoPay: () => null }))
vi.mock('components/ConnectWalletButton', () => ({default: (props: any) => <button {...props}>Connect Wallet</button>}))
const ADDRESS='0xdf9e1a85db4f985d5bb5644ad07d9d7ee5673b5e'
const requests: string[]=[]
const next=()=>fireEvent.click(screen.getByTestId('commercial-checkout-next'))
const back=()=>fireEvent.click(screen.getByTestId('commercial-checkout-back'))
beforeEach(()=>{
 requests.length=0
 vi.mocked(useAccount).mockReturnValue({address:undefined} as any)
 vi.mocked(useSigner).mockReturnValue({data:undefined} as any)
 vi.stubGlobal('fetch',vi.fn(async(input:string)=>{
  requests.push(input)
  let data:any
  if(input.includes('/onboard')) data={ok:true,tier:'canonical',onChain:{verifiedDeployment:true,name:'MM72',symbol:'MM72',decimals:18},project:{displayName:'MM72',slug:'mm72'},dex:{listed:true,logo:'https://example.test/mm72.png'}}
  else if(input.includes('/readiness')) data={executable:false,paymentMethods:{mCredits:false}}
  else if(input.includes('/pair-liquidity')) data={}
  else if(input.includes('/eligible-targets')) data={targets:[]}
  else throw Error('Unexpected API: '+input)
  return {ok:true,json:async()=>data}
 }))
})
afterEach(()=>{cleanup();vi.unstubAllGlobals()})
async function open(service='trend-boost'){
 const close=vi.fn()
 render(<CommercialCheckoutModal open onClose={close} projectId="" projectSlug="" identityReady />)
 fireEvent.change(screen.getByPlaceholderText('Paste the token address (0x...)'),{target:{value:ADDRESS}})
 fireEvent.click(screen.getByRole('button',{name:'Detect token'}))
 await screen.findByText('Project Page @mm72')
 next()
 fireEvent.click(screen.getByTestId('commercial-service-'+service))
 return close
}
describe('Boost P0 behaviour',()=>{
 it('retains exactly the active ecosystem destinations',()=>{
  expect(ECOSYSTEM_DESTINATIONS.map(x=>x.id)).toEqual(['passport','smartdrop'])
 })
 it('navigates all canonical stages with identity, price, back and wallet gate; no order writes',async()=>{
  const close=await open()
  expect(screen.getByAltText('MM72 logo').getAttribute('src')).toBe('https://example.test/mm72.png')
  fireEvent.error(screen.getByAltText('MM72 logo'))
  expect(screen.getByAltText('MM72 logo').getAttribute('src')).toBe('/images/56/tokens/0xdF9e1A85dB4f985D5BB5644aD07d9D7EE5673B5E.png')
  next(); expect(screen.getByTestId('commercial-step-package')).toBeTruthy()
  fireEvent.click(screen.getByTestId('commercial-pkg-trend_6h'))
  next(); expect(screen.getByTestId('commercial-step-chain')).toBeTruthy()
  next(); expect(screen.getByTestId('commercial-pay-MARCO_PAY').hasAttribute('disabled')).toBe(true)
  expect(screen.getByTestId('commercial-pay-M_CREDITS').hasAttribute('disabled')).toBe(true)
  fireEvent.click(screen.getByTestId('commercial-pay-USDT')); next()
  expect(screen.getByTestId('commercial-step-review').textContent).toContain('USDT on BNB Chain')
  expect(screen.getByTestId('commercial-step-review').textContent).toContain('$29')
  expect(screen.getByTestId('commercial-checkout-connect')).toBeTruthy()
  for(const step of ['payment','chain','package','service','project']) {back();expect(screen.getByTestId('commercial-step-'+step)).toBeTruthy()}
  fireEvent.click(screen.getByTestId('commercial-checkout-cancel'));expect(close).toHaveBeenCalledOnce()
  expect(requests.some(x=>x.includes('/orders')||x.includes('/claim'))).toBe(false)
 })
 it('keeps activation-pending services visibly pending and blocked at review',async()=>{
  await open('sponsored-research')
  for (const id of ['sponsored-research', 'featured-farm', 'featured-pool']) expect(screen.getByTestId('commercial-service-'+id).textContent).toContain('Activation pending')
  next();next();next();next()
  expect(screen.getByTestId('commercial-step-review').textContent).toContain('awaiting production activation')
  expect(requests.some(x=>x.includes('/orders'))).toBe(false)
 })
 it('completes a simulated checkout through receipt confirmation without a real provider',async()=>{
  const sendTransaction=vi.fn(async()=>({hash:'0x'+'1'.repeat(64),wait:async()=>({to:ADDRESS,status:1,logs:[]})}))
  vi.mocked(useAccount).mockReturnValue({address:ADDRESS} as any)
  vi.mocked(useSigner).mockReturnValue({data:{getChainId:async()=>56,sendTransaction}} as any)
  const baseFetch=global.fetch
  const actions:string[]=[]
  vi.stubGlobal('fetch',vi.fn(async(input:string,options:any)=>{
   if(!input.includes('/orders')) return baseFetch(input,options)
   const body=JSON.parse(options.body); actions.push(body.action)
   const data=body.action==='create'?{order:{orderId:'fixture-order'}}:body.action==='quote'?{quote:{tokenAmount:'0.05',quoteExpiration:'2099-01-01'},prepared:{to:ADDRESS,valueHex:'0x0',data:'0x'}}:{ok:true}
   return {ok:true,json:async()=>data}
  }))
  await open();next();next();next();next()
  fireEvent.click(screen.getByTestId('commercial-checkout-pay'))
  await waitFor(()=>expect(screen.getByTestId('commercial-checkout-success')).toBeTruthy())
  expect(actions).toEqual(['create','quote','submit','confirm-receipt'])
  expect(sendTransaction).toHaveBeenCalledOnce()
  expect(screen.queryByTestId('commercial-checkout-pay')).toBeNull()
 })

})
