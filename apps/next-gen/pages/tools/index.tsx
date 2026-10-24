import React from 'react'
import { BetaShell } from '../../components/BetaShell'
import { NonOperational } from '../../components/NonOperational'
import { getBetaPageProps } from '../../lib/page'
import { uxSectionById } from '../../lib/uxSections'
import { COMMERCIAL_TOOLS } from '../../lib/tools'

export default function ToolsPage() {
  const section = uxSectionById('tools')
  return (
    <BetaShell section="tools">
      <NonOperational section={section} />
      <p className="console-intro">Professional utilities stay separate from the core Trade, Earn, Portfolio, and Explore journey.</p>
      <ul className="tools">
        {COMMERCIAL_TOOLS.map((tool) => (
          <li key={tool.id}>
            <a className="tool-link" href={`/tools/${tool.id}`}>
              <strong>{tool.label}</strong>
              <span>{tool.summary}</span>
            </a>
          </li>
        ))}
      </ul>
    </BetaShell>
  )
}

export const getServerSideProps = getBetaPageProps
