import React from 'react'
import { BetaShell } from '../../components/BetaShell'
import { NonOperational } from '../../components/NonOperational'
import { getBetaPageProps } from '../../lib/page'
import { sectionById } from '../../lib/sections'
import { COMMERCIAL_TOOLS } from '../../lib/tools'

export default function ToolsPage() {
  const section = sectionById('tools')
  return (
    <BetaShell section="tools">
      <NonOperational section={section} />
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
