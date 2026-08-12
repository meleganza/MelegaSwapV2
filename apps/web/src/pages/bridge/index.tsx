import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { PageMeta } from 'components/Layout/Page'
import { SUPPORT_MULTI_CHAINS } from 'config/constants/supportChains'
import styled from 'styled-components'
import SmartSwapBridgeTabs, { TradeWorkspaceTab } from 'views/MarcoBridge/SmartSwapBridgeTabs'
import { HomeSwapPanelShell } from 'views/HomeTrade/HomeSwapPanelShell'

const MarcoBridgeWorkspace = dynamic(() => import('views/MarcoBridge/MarcoBridgeWorkspace'), {
  ssr: false,
  loading: () => null,
})

const Surface = styled.main`
  width: min(680px, calc(100% - 28px));
  margin: clamp(28px, 6vw, 72px) auto;
`

const Bolt = styled.span`
  color: ${({ theme }) => theme.colors.primary};
  font-size: 20px;
  line-height: 1;
`

const BridgePage = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TradeWorkspaceTab>('bridge')
  const handleTab = (tab: TradeWorkspaceTab) => {
    if (tab === 'swap') {
      router.push('/swap')
      return
    }
    setActiveTab(tab)
  }

  return (
    <>
      <PageMeta title="MARCO Bridge" />
      <Surface>
        <HomeSwapPanelShell
          headerLeading={<Bolt aria-hidden>⚡</Bolt>}
          headerCenter={<SmartSwapBridgeTabs active={activeTab} onChange={handleTab} />}
        >
          <MarcoBridgeWorkspace />
        </HomeSwapPanelShell>
      </Surface>
    </>
  )
}

BridgePage.chains = SUPPORT_MULTI_CHAINS

export default BridgePage
