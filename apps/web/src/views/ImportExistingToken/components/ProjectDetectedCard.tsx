import React, { useState } from 'react'
import styled from 'styled-components'
import { PROJECT_DETECTED } from '../importTokenData'
import { IT_FONT_BODY, importTokenColors } from '../importTokenTokens'
import { IconChevronDown } from './importTokenIcons'
import { ItBody, ItPanel, ItSectionLabel, ItSourceTag } from './importTokenPrimitives'

const Panel = styled(ItPanel)`
  padding: 24px;
`

const Top = styled.div`
  display: flex;
  gap: 20px;
  align-items: flex-start;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`

const Logo = styled.div`
  width: 72px;
  height: 72px;
  border-radius: 16px;
  border: 1px solid ${importTokenColors.border};
  background: linear-gradient(135deg, rgba(214, 180, 69, 0.2), rgba(19, 19, 19, 0.9));
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${IT_FONT_BODY};
  font-size: 24px;
  font-weight: 800;
  color: ${importTokenColors.gold};
  flex-shrink: 0;
`

const Meta = styled.div`
  flex: 1;
  min-width: 0;
`

const Name = styled.h3`
  margin: 0;
  font-family: ${IT_FONT_BODY};
  font-size: 24px;
  font-weight: 700;
  color: ${importTokenColors.white};
`

const TickerRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  color: ${importTokenColors.muted};
`

const LinkGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`

const LinkItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  color: ${importTokenColors.body};
`

const LinkVal = styled.span`
  color: ${importTokenColors.white};
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const AiSummary = styled.div`
  margin-top: 20px;
  padding: 16px;
  border-radius: 14px;
  border: 1px solid rgba(27, 231, 122, 0.25);
  background: rgba(27, 231, 122, 0.04);
`

const AiLabel = styled.div`
  font-family: ${IT_FONT_BODY};
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${importTokenColors.green};
  margin-bottom: 8px;
`

const OwnerToggle = styled.button`
  margin-top: 12px;
  border: none;
  background: transparent;
  font-family: ${IT_FONT_BODY};
  font-size: 12px;
  font-weight: 600;
  color: ${importTokenColors.gold};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`

const OwnerBlock = styled.div`
  margin-top: 10px;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid ${importTokenColors.border};
  font-family: ${IT_FONT_BODY};
  font-size: 13px;
  line-height: 20px;
  color: ${importTokenColors.muted};
`

const p = PROJECT_DETECTED

export const ProjectDetectedCard: React.FC = () => {
  const [showOwner, setShowOwner] = useState(false)

  return (
    <Panel data-iet-project-detected>
      <ItSectionLabel>Step 3 — Project Detected</ItSectionLabel>
      <Top>
        <Logo>{p.logo}</Logo>
        <Meta>
          <Name>{p.name}</Name>
          <TickerRow>
            <span>{p.ticker}</span>
            <span>·</span>
            <span>{p.chain}</span>
            <span>·</span>
            <span>{p.category}</span>
            <span>·</span>
            <span>Age {p.age}</span>
          </TickerRow>
        </Meta>
      </Top>
      <LinkGrid>
        {[
          { label: 'Website', value: p.website },
          { label: 'Twitter', value: p.twitter },
          { label: 'Telegram', value: p.telegram },
          { label: 'Discord', value: p.discord },
          { label: 'GitHub', value: p.github },
          { label: 'Whitepaper', value: p.whitepaper },
        ].map((item) => {
          const field = p.fields.find((f) => f.label.toLowerCase() === item.label.toLowerCase())
          return (
            <LinkItem key={item.label}>
              <span>{item.label}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <LinkVal>{item.value}</LinkVal>
                {field ? <ItSourceTag>{field.source}</ItSourceTag> : null}
              </span>
            </LinkItem>
          )
        })}
      </LinkGrid>
      <AiSummary>
        <AiLabel>AI Summary — priority</AiLabel>
        <ItBody>{p.aiSummary}</ItBody>
      </AiSummary>
      <OwnerToggle type="button" onClick={() => setShowOwner(!showOwner)}>
        Project owner description {showOwner ? '(collapse)' : '(expand)'}
        <IconChevronDown />
      </OwnerToggle>
      {showOwner ? <OwnerBlock>{p.ownerDescription}</OwnerBlock> : null}
    </Panel>
  )
}

export default ProjectDetectedCard
