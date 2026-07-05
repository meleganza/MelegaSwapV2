import React, { useState } from 'react'
import styled from 'styled-components'
import { buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsBody, BsLabel } from './buildStudioPrimitives'
import CreateTokenPanel from './CreateTokenPanel'
import SecondRowCards from './SecondRowCards'
import AIValidationEngine from './AIValidationEngine'
import OptionalServices from './OptionalServices'
import AIManifestPanel from './AIManifestPanel'
import TrustedInfrastructurePanel from './TrustedInfrastructurePanel'
import RecentBuildsTable from './RecentBuildsTable'
import AIBuildAdvisorPanel from './AIBuildAdvisorPanel'

const Shell = styled.section`
  border: 1px solid ${buildStudioColors.border};
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
  overflow: hidden;
`

const Toggle = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: ${buildStudioColors.white};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  text-align: left;
`

const Inner = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${buildStudioLayout.sectionGap};
  padding: 0 20px 20px;
`

/** Preparation-only modules — collapsed until production execution ships. */
export const FutureProductionModules: React.FC = () => {
  const [open, setOpen] = useState(false)

  return (
    <Shell data-bs-future-production>
      <Toggle type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>Future Production Modules</span>
        <BsLabel style={{ color: buildStudioColors.muted }}>{open ? 'Hide' : 'Show'}</BsLabel>
      </Toggle>
      {open ? (
        <Inner>
          <BsBody style={{ margin: 0, fontSize: 13, color: buildStudioColors.muted }}>
            Create Token, Farm, Pool, and Lock Liquidity remain preparation-only. Import &amp; analyze is the live
            production entry.
          </BsBody>
          <CreateTokenPanel />
          <AIBuildAdvisorPanel />
          <SecondRowCards />
          <AIValidationEngine />
          <OptionalServices />
          <AIManifestPanel />
          <TrustedInfrastructurePanel />
          <RecentBuildsTable />
        </Inner>
      ) : null}
    </Shell>
  )
}

export default FutureProductionModules
