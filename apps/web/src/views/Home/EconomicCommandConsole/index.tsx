import React from 'react'
import Head from 'next/head'
import { SwapFeaturesProvider } from 'views/Swap/SwapFeaturesContext'
import CommandBackground from './components/CommandBackground'
import CommandHeader from './components/CommandHeader'
import CommandFooter from './components/CommandFooter'
import MobileBottomNav from './components/MobileBottomNav'
import SwapCommandCenter from './components/SwapCommandCenter'
import CanonicalEconomyPanel from './components/CanonicalEconomyPanel'
import ExecutionEnginePanel from './components/ExecutionEnginePanel'
import MarcoVenuesPanel from './components/MarcoVenuesPanel'
import EconomicIntelligencePanel from './components/EconomicIntelligencePanel'
import QueryPreviewPanel from './components/QueryPreviewPanel'
import {
  Root,
  Shell,
  MainGrid,
  LeftCol,
  CenterCol,
  RightCol,
} from './styles'

const EconomicCommandConsole: React.FC = () => (
  <SwapFeaturesProvider>
    <Head>
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Orbitron:wght@500;600;700&display=swap"
        rel="stylesheet"
      />
    </Head>
    <Root>
      <CommandBackground />
      <CommandHeader />
      <Shell>
        <MainGrid>
          <CenterCol>
            <SwapCommandCenter />
          </CenterCol>
          <LeftCol>
            <CanonicalEconomyPanel />
            <ExecutionEnginePanel />
            <MarcoVenuesPanel />
          </LeftCol>
          <RightCol>
            <EconomicIntelligencePanel />
            <QueryPreviewPanel />
          </RightCol>
        </MainGrid>
      </Shell>
      <CommandFooter />
      <MobileBottomNav />
    </Root>
  </SwapFeaturesProvider>
)

export default EconomicCommandConsole
