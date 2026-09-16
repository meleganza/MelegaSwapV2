import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { realpathSync } from 'fs'
const r=(v:string)=>path.resolve(__dirname,v)
export default defineConfig({root:__dirname,publicDir:r('../../apps/web/public'),plugins:[react()],cacheDir:r('.vite'),resolve:{alias:[{find:'next/link',replacement:r('link.tsx')},{find:'wagmi',replacement:r('wallet.tsx')},{find:'components/ConnectWalletButton',replacement:r('wallet.tsx')},{find:'components/MarcoWidgets/marcoConnectSession',replacement:r('../../apps/web/src/components/MarcoWidgets/marcoConnectSession.ts')},{find:'components/MarcoWidgets',replacement:r('wallet.tsx')},...['lib','utils','config','views','registry','design-system'].map(x=>({find:x,replacement:r('../../apps/web/src/'+x)})),{find:'@pancakeswap/utils/uriToHttp',replacement:r('../../packages/utils/uriToHttp.ts')} ]},server:{host:'127.0.0.1',port:4317,fs:{allow:[r('../..'),path.dirname(realpathSync(r('../../node_modules')))]}}})
