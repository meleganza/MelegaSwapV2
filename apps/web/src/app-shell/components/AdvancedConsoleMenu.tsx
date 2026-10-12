import React, { useEffect, useId, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import styled from 'styled-components'
import { ADVANCED_CONSOLE_GROUPS, ADVANCED_CONSOLE_ITEMS } from 'app-shell/config/advancedConsole'
import { preserveEarlyNavigation } from 'lib/navigation/preserveEarlyNavigation'
import { uxRebuildColors } from 'design-system/melega/tokens/uxRebuild'

const Root = styled.div`
  position: relative;
  flex-shrink: 0;
`

const Trigger = styled.button`
  min-height: 40px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: transparent;
  color: ${uxRebuildColors.secondary};
  font-size: 13px;
  font-weight: 650;
  letter-spacing: -0.01em;
  cursor: pointer;
  white-space: nowrap;

  &:hover,
  &[aria-expanded='true'] {
    color: ${uxRebuildColors.text};
    border-color: rgba(221, 185, 47, 0.45);
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
    outline-offset: 2px;
  }

  @media (max-width: 1023px) {
    min-height: 44px;
    min-width: 44px;
    padding: 0 10px;
  }
`

const Panel = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: min(280px, calc(100vw - 24px));
  padding: 8px;

  @media (max-width: 1023px) {
    position: fixed;
    top: calc(56px + env(safe-area-inset-top, 0px) + 8px);
    left: 12px;
    right: 12px;
    width: auto;
    max-height: calc(100dvh - 140px - env(safe-area-inset-top, 0px) - env(safe-area-inset-bottom, 0px));
    overflow: auto;
  }
  border-radius: 14px;
  background: rgba(12, 12, 12, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  z-index: 120;
`

const GroupLabel = styled.div`
  margin: 8px 8px 4px;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.42);
`

const ItemLink = styled.a`
  display: flex;
  align-items: center;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 10px;
  color: #f2f2f2;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;

  @media (max-width: 1023px) {
    min-height: 36px;
  }

  &:hover,
  &:focus-visible {
    background: rgba(255, 255, 255, 0.05);
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid ${uxRebuildColors.gold};
  }
`

const Unavailable = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  min-height: 40px;
  padding: 0 10px;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: rgba(255, 255, 255, 0.38);
  font-size: 13px;
  font-weight: 600;
  text-align: left;
  cursor: not-allowed;

  @media (max-width: 1023px) {
    min-height: 36px;
  }
`

const Reason = styled.span`
  font-size: 11px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.45);
`

export const AdvancedConsoleMenu: React.FC<{ placement: 'header' | 'mobile' }> = ({ placement }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const panelId = useId()

  useEffect(() => {
    setOpen(false)
  }, [router.asPath])

  useEffect(() => {
    if (!open) return undefined
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <Root ref={rootRef} data-advanced-placement={placement}>
      <Trigger
        type="button"
        aria-label="Tools"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={panelId}
        data-testid="melega-advanced-console"
        onClick={() => setOpen((value) => !value)}
      >
        Tools
      </Trigger>
      {open ? (
        <Panel id={panelId} role="menu" aria-label="Tools" data-testid="melega-advanced-console-menu">
          {ADVANCED_CONSOLE_GROUPS.map((group) => (
            <div key={group}>
              <GroupLabel>{group}</GroupLabel>
              {ADVANCED_CONSOLE_ITEMS.filter((item) => item.group === group).map((item) =>
                item.unavailable || !item.href ? (
                  <Unavailable
                    key={item.id}
                    type="button"
                    role="menuitem"
                    aria-disabled="true"
                    data-disabled-reason={item.reason ?? 'Unavailable'}
                    data-testid={`melega-advanced-${item.id}`}
                    onClick={(event) => event.preventDefault()}
                  >
                    {item.label}
                    <Reason>Unavailable</Reason>
                  </Unavailable>
                ) : (
                  <Link key={item.id} href={item.href} passHref legacyBehavior>
                    <ItemLink
                      role="menuitem"
                      data-testid={`melega-advanced-${item.id}`}
                      onClick={(event) => {
                        setOpen(false)
                        preserveEarlyNavigation(event, item.href!)
                      }}
                    >
                      {item.label}
                    </ItemLink>
                  </Link>
                ),
              )}
            </div>
          ))}
        </Panel>
      ) : null}
    </Root>
  )
}

export default AdvancedConsoleMenu
