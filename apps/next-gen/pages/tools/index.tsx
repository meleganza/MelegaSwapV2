import React from 'react'
import { BetaShell } from '../../components/BetaShell'
import { NonOperational } from '../../components/NonOperational'
import { getBetaPageProps } from '../../lib/page'
import { uxSectionById } from '../../lib/uxSections'
import { COMMERCIAL_TOOLS } from '../../lib/tools'
import { AppIcon } from '../../components/AppIcon'

export default function ToolsPage() {
  const section = uxSectionById('tools')
  return (
    <BetaShell section="tools">
      <NonOperational section={section} />
      <p className="tools-tagline">Launch and grow on BNB</p>
      <ul className="tools">
        {COMMERCIAL_TOOLS.map((tool) => (
          <li key={tool.id}>
            <a className="tool-link" href={`/tools/${tool.id}`}>
              <span className="tool-icon"><AppIcon name={tool.id === 'create-token' ? 'trade' : tool.id === 'trend-boost' ? 'explore' : 'portfolio'} /></span>
              <span className="tool-copy"><strong>{tool.label}</strong><small>{tool.summary}</small><em>Opens live service</em></span>
              <AppIcon name="arrow" />
            </a>
          </li>
        ))}
      </ul>
    </BetaShell>
  )
}

export const getServerSideProps = getBetaPageProps
