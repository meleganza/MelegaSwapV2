import React, { useEffect, useId, useState } from 'react'
import Link from 'next/link'
import styled from 'styled-components'
import { MelegaSidebarSection, MelegaSidebarItem } from 'design-system/melega'
import type { ShellNavItem } from '../config/navigation'
import { ShellNavIcon } from './icons'

const MoreButton = styled.button<{ $open?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  height: 26px;
  padding: 0 12px 0 30px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.45);
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: color 150ms ease;

  &:hover {
    color: #a8a8a8;
  }
`

const Chevron = styled.span<{ $open?: boolean }>`
  margin-left: auto;
  font-size: 12px;
  line-height: 1;
  color: #5f5f5f;
  transform: rotate(${({ $open }) => ($open ? '90deg' : '0deg')});
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
`

const Expandable = styled.div<{ $open?: boolean }>`
  display: grid;
  grid-template-rows: ${({ $open }) => ($open ? '1fr' : '0fr')};
  transition: grid-template-rows 220ms cubic-bezier(0.22, 1, 0.36, 1);
`

const ExpandInner = styled.div<{ $open?: boolean }>`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: ${({ $open }) => ($open ? 1 : 0)};
  transform: translateY(${({ $open }) => ($open ? '0' : '8px')});
  transition:
    opacity 220ms cubic-bezier(0.22, 1, 0.36, 1),
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
`

export interface SidebarExpandableSectionProps {
  label: string
  items: ShellNavItem[]
  visibleCount: number
  pathname: string
}

export const SidebarExpandableSection: React.FC<SidebarExpandableSectionProps> = ({
  label,
  items,
  visibleCount,
  pathname,
}) => {
  const panelId = useId()
  const primary = items.slice(0, visibleCount)
  const extra = items.slice(visibleCount)
  const extraActive = extra.some((item) => item.match(pathname))
  const [open, setOpen] = useState(extraActive)

  useEffect(() => {
    if (extraActive) setOpen(true)
  }, [extraActive])

  const renderItem = (item: ShellNavItem) => (
    <Link key={`${label}-${item.id}`} href={item.href} passHref legacyBehavior>
      <MelegaSidebarItem
        label={item.label}
        active={item.match(pathname)}
        icon={<ShellNavIcon name={item.icon} />}
      />
    </Link>
  )

  return (
    <MelegaSidebarSection label={label}>
      {primary.map(renderItem)}
      {extra.length > 0 && (
        <>
          <MoreButton
            type="button"
            $open={open}
            aria-expanded={open}
            aria-controls={panelId}
            aria-label={open ? 'Collapse menu' : 'Expand menu'}
            onClick={() => setOpen((v) => !v)}
          >
            ...
            <Chevron $open={open} aria-hidden>
              ›
            </Chevron>
          </MoreButton>
          <Expandable $open={open} id={panelId}>
            <ExpandInner $open={open}>{extra.map(renderItem)}</ExpandInner>
          </Expandable>
        </>
      )}
    </MelegaSidebarSection>
  )
}

export default SidebarExpandableSection
