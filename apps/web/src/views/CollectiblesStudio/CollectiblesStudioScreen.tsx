import React from 'react'
import styled from 'styled-components'
import { PageMeta } from 'components/Layout/Page'
import TrendingRibbon from 'views/HomeTrade/TrendingRibbon'
import CollectiblesStudioGlobalStyle from './CollectiblesStudioGlobalStyle'
import { CollectiblesRuntimeProvider } from './collectiblesRuntime/CollectiblesRuntimeContext'
import IdentityPageHeader from './components/IdentityPageHeader'
import {
  GenesisIdentityCollectionPanel,
  IdentityActionsPanel,
  IdentityCapabilitiesPanel,
  IdentityCollectionsPanel,
  IdentityLevelsPanel,
  IdentityMachinePanel,
  IdentityPrivilegesPanel,
  YourIdentityPanel,
} from './components/IdentityStudioSections'
import { CS_FONT_BODY, collectiblesStudioColors, collectiblesStudioLayout } from './collectiblesStudioTokens'

const Root = styled.div`
  color: ${collectiblesStudioColors.white};
  font-family: ${CS_FONT_BODY};
  background: ${collectiblesStudioColors.pageBg};
  padding: 0 0 32px;
  min-width: 0;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 0 0 ${collectiblesStudioLayout.mobileBottomPad};
  }
`

const Content = styled.div`
  max-width: ${collectiblesStudioLayout.contentMax};
  margin: 0 auto;
  padding: ${collectiblesStudioLayout.contentPaddingTop} ${collectiblesStudioLayout.contentPaddingX}
    ${collectiblesStudioLayout.contentPaddingBottom};
  box-sizing: border-box;
  min-width: 0;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: ${collectiblesStudioLayout.sectionGap};

  @media (max-width: 768px) {
    padding: 20px;
    gap: calc(${collectiblesStudioLayout.sectionGap} + 6px);
  }
`

export const CollectiblesStudioScreen: React.FC = () => (
  <CollectiblesRuntimeProvider>
    <Root data-collectibles-studio-screen="true" data-r400-identity="true" data-r401-identity-hub="true" data-r402-identity-hub="true">
      <PageMeta />
      <CollectiblesStudioGlobalStyle />
      <TrendingRibbon />
      <Content>
        <IdentityPageHeader />
        <YourIdentityPanel />
        <IdentityCollectionsPanel />
        <GenesisIdentityCollectionPanel />
        <IdentityPrivilegesPanel />
        <IdentityCapabilitiesPanel />
        <IdentityLevelsPanel />
        <IdentityActionsPanel />
        <IdentityMachinePanel />
      </Content>
    </Root>
  </CollectiblesRuntimeProvider>
)

export default CollectiblesStudioScreen
