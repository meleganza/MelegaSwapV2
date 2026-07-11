import React from 'react'
import styled from 'styled-components'
import { buildStudioColors, buildStudioLayout } from '../buildStudioTokens'
import { BsPanel } from './buildStudioPrimitives'
import BuildStudioImportWorkflow from './BuildStudioImportWorkflow'

const Inner = styled.div`
  padding: 16px 20px 20px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  min-height: 0;
  min-width: 0;
  overflow: visible;
`

export const ImportTokenPanel: React.FC = () => (
  <BsPanel
    data-bs-panel
    data-bs-import-token
    data-bs-primary-entry
    $emphasis="primary"
    $height={buildStudioLayout.importTokenH}
  >
    <Inner>
      <BuildStudioImportWorkflow />
    </Inner>
  </BsPanel>
)

export default ImportTokenPanel
