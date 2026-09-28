import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { vanillaExtractPlugin } from '@vanilla-extract/vite-plugin'
export default defineConfig({ root:__dirname, plugins:[react(),vanillaExtractPlugin()], resolve:{dedupe:['react','react-dom','styled-components']}, build:{outDir:'/private/tmp/melega-swap-confirm-browser',emptyOutDir:true}, server:{host:'127.0.0.1',port:3121}, preview:{host:'127.0.0.1',port:3121} })
