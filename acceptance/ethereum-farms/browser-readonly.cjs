const {chromium}=require('playwright');
(async()=>{const b=await chromium.launch({channel:'chrome',headless:true});const p=await b.newPage({viewport:{width:1440,height:1000}});p.on('pageerror',e=>console.log('ERROR',e.message));await p.addInitScript(()=>{const events={};window.ethereum={isMetaMask:true,on:(e,f)=>(events[e]??=[]).push(f),removeListener:()=>{},request:async({method,params})=>{if(['eth_accounts','eth_requestAccounts'].includes(method))return ['0xB6eEb3ab9695979F5b2Ef6Df4112e63212E33EE0'];if(method==='eth_chainId')return '0x1';if(method==='net_version')return '1';if(method.startsWith('wallet_'))return null;if(/sign|send/i.test(method))throw Error('READ_ONLY');const r=await fetch('https://ethereum-rpc.publicnode.com',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})});const j=await r.json();if(j.error)throw Error(j.error.message);return j.result}}});await p.goto('http://127.0.0.1:3180/farms?chain=ethereum',{timeout:120000});await p.waitForFunction(()=>document.body.innerText.includes('LP tokens: 14.85') && document.body.innerText.includes('0.00260 MARCO'),{},{timeout:60000});for (const width of [1440,1280,1024,390]) {
 await p.setViewportSize({width,height:900});
 await p.waitForTimeout(500);
 const bounds=await p.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,cards:[...document.querySelectorAll('[data-testid="farms-explore-card"]')].map(e=>{const r=e.getBoundingClientRect();return {left:r.left,right:r.right}})}));
 console.log('LAYOUT',JSON.stringify(bounds));
 if(bounds.document>width || bounds.cards.some(c=>c.left<0||c.right>width)) throw Error('HORIZONTAL_OVERFLOW_'+width);
 await p.screenshot({path:`outputs/farms-ethereum-${width}.png`,fullPage:true});
}
require('fs').writeFileSync('outputs/farms-ethereum-page.txt',await p.locator('body').innerText());
console.log((await p.locator('body').innerText()).slice(-8000));await b.close()})().catch(e=>{console.error(e);process.exitCode=1})
