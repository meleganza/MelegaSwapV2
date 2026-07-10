import React, { useState } from 'react'
import styled from 'styled-components'
import { tradeColors } from '../tradeTokens'

const Toggle = styled.button`
  margin-top: 10px;
  border: none;
  background: transparent;
  color: ${tradeColors.muted};
  font-size: 12px;
  font-weight: 600;
  text-align: left;
  cursor: pointer;
  padding: 0;

  &:hover {
    color: ${tradeColors.gold};
  }
`

const Detail = styled.pre`
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #0a0a0a;
  border: 1px solid rgba(255, 255, 255, 0.06);
  font-size: 11px;
  line-height: 1.45;
  color: ${tradeColors.muted};
  max-height: 120px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
`

export interface TradeTechnicalDetailsProps {
  detail?: string
  className?: string
}

/** R759 — runtime diagnostics hidden until explicitly expanded. */
export const TradeTechnicalDetails: React.FC<TradeTechnicalDetailsProps> = ({ detail, className }) => {
  const [open, setOpen] = useState(false)
  if (!detail) return null

  return (
    <div className={className} data-trade-technical-details>
      <Toggle type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        {open ? 'Hide technical details' : 'Show technical details'}
      </Toggle>
      {open ? <Detail>{detail}</Detail> : null}
    </div>
  )
}

export default TradeTechnicalDetails
