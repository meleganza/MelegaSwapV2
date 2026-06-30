import React from 'react'
import styled from 'styled-components'
import { Flex, Text, SearchInput, Select, OptionProps } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import {
  DISCOVERY_CAPABILITY_CHIPS,
  DISCOVERY_CHAIN_CHIPS,
  DiscoveryCapabilityChipKey,
  DiscoveryFilters,
  DiscoverySortOption,
  MachineManifestFilter,
  TreasuryFilter,
} from 'registry/projects/discovery'
import { ProjectRegistryStatus, ProjectTrustBadge } from 'registry/projects/types'
import CapabilityChip from './CapabilityChip'
import ChainChip from './ChainChip'

const Panel = styled(Flex)`
  flex-direction: column;
  gap: 16px;
  width: 100%;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.02);
`

const ChipRow = styled(Flex)`
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
`

const SelectRow = styled(Flex)`
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-end;
`

const LabelWrapper = styled(Flex)`
  flex-direction: column;
  gap: 4px;
  flex: 1 1 160px;
  min-width: 140px;
`

export interface DiscoveryFilterState {
  filters: DiscoveryFilters
  sortBy: DiscoverySortOption
}

interface DiscoveryFiltersPanelProps {
  state: DiscoveryFilterState
  onChange: (state: DiscoveryFilterState) => void
}

const toggleArrayItem = <T,>(items: T[] | undefined, item: T): T[] => {
  const current = items ?? []
  return current.includes(item) ? current.filter((value) => value !== item) : [...current, item]
}

const DiscoveryFiltersPanel: React.FC<DiscoveryFiltersPanelProps> = ({ state, onChange }) => {
  const { t } = useTranslation()
  const { filters, sortBy } = state

  const updateFilters = (patch: Partial<DiscoveryFilters>) => {
    onChange({ filters: { ...filters, ...patch }, sortBy })
  }

  const sortOptions: OptionProps[] = [
    { label: t('Alphabetical'), value: 'alphabetical' },
    { label: t('Recently Added'), value: 'recently_added' },
    { label: t('Capability Completeness'), value: 'capability_completeness' },
    { label: t('Civilization Readiness'), value: 'civilization_readiness' },
  ]

  const trustOptions: OptionProps[] = [
    { label: t('All trust statuses'), value: 'all' },
    { label: t('Canonical project'), value: 'canonical' },
    { label: t('Observed'), value: 'observed' },
    { label: t('Unverified'), value: 'unverified' },
    { label: t('Planned'), value: 'planned' },
  ]

  const lifecycleOptions: OptionProps[] = [
    { label: t('All lifecycle'), value: 'all' },
    { label: t('Listed'), value: 'listed' },
    { label: t('Archived'), value: 'archived' },
  ]

  const treasuryOptions: OptionProps[] = [
    { label: t('Any treasury status'), value: 'any' },
    { label: t('Treasury live'), value: 'live' },
    { label: t('Treasury partial or live'), value: 'partial_or_live' },
    { label: t('Treasury planned'), value: 'planned' },
    { label: t('Treasury none'), value: 'none' },
  ]

  const manifestOptions: OptionProps[] = [
    { label: t('Any manifest status'), value: 'any' },
    { label: t('Machine manifest live'), value: 'live' },
    { label: t('Machine manifest not live'), value: 'not_live' },
  ]

  const activeTrust = filters.trustBadges?.[0] ?? 'all'
  const activeLifecycle = filters.lifecycle ?? 'all'

  return (
    <Panel>
      <LabelWrapper style={{ flex: '1 1 100%', maxWidth: '100%' }}>
        <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
          {t('Discovery search')}
        </Text>
        <SearchInput
          initialValue={filters.query ?? ''}
          onChange={(e) => updateFilters({ query: e.target.value })}
          placeholder={t('Search projects by name, ticker, tags...')}
        />
      </LabelWrapper>

      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Text fontSize="12px" color="textSubtle" textTransform="uppercase">
          {t('Chain filter')}
        </Text>
        <ChipRow>
          {DISCOVERY_CHAIN_CHIPS.map((chain) => (
            <ChainChip
              key={chain.chainId}
              chainId={chain.chainId}
              label={chain.label}
              active={filters.chains?.includes(chain.chainId)}
              onToggle={(chainId) =>
                updateFilters({ chains: toggleArrayItem(filters.chains, chainId) })
              }
            />
          ))}
        </ChipRow>
      </Flex>

      <Flex flexDirection="column" style={{ gap: '8px' }}>
        <Text fontSize="12px" color="textSubtle" textTransform="uppercase">
          {t('Capability filter')}
        </Text>
        <ChipRow>
          {DISCOVERY_CAPABILITY_CHIPS.map((chip) => (
            <CapabilityChip
              key={chip.key}
              capabilityKey={chip.key}
              label={chip.label}
              active={filters.capabilities?.includes(chip.key)}
              onToggle={(key: DiscoveryCapabilityChipKey) =>
                updateFilters({ capabilities: toggleArrayItem(filters.capabilities, key) })
              }
            />
          ))}
        </ChipRow>
      </Flex>

      <SelectRow>
        <LabelWrapper>
          <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
            {t('Trust Status')}
          </Text>
          <Select
            options={trustOptions}
            onOptionChange={(option) => {
              const value = option.value as ProjectTrustBadge | 'all'
              updateFilters({
                trustBadges: value === 'all' ? undefined : [value],
              })
            }}
            defaultOptionIndex={trustOptions.findIndex((o) => o.value === activeTrust)}
          />
        </LabelWrapper>

        <LabelWrapper>
          <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
            {t('Lifecycle')}
          </Text>
          <Select
            options={lifecycleOptions}
            onOptionChange={(option) =>
              updateFilters({
                lifecycle: option.value as ProjectRegistryStatus | 'all',
              })
            }
            defaultOptionIndex={lifecycleOptions.findIndex((o) => o.value === activeLifecycle)}
          />
        </LabelWrapper>

        <LabelWrapper>
          <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
            {t('Treasury Compatibility')}
          </Text>
          <Select
            options={treasuryOptions}
            onOptionChange={(option) =>
              updateFilters({ treasury: option.value as TreasuryFilter })
            }
            defaultOptionIndex={treasuryOptions.findIndex((o) => o.value === (filters.treasury ?? 'any'))}
          />
        </LabelWrapper>

        <LabelWrapper>
          <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
            {t('Machine Manifest')}
          </Text>
          <Select
            options={manifestOptions}
            onOptionChange={(option) =>
              updateFilters({ machineManifest: option.value as MachineManifestFilter })
            }
            defaultOptionIndex={manifestOptions.findIndex(
              (o) => o.value === (filters.machineManifest ?? 'any'),
            )}
          />
        </LabelWrapper>

        <LabelWrapper>
          <Text textTransform="uppercase" fontSize="12px" color="textSubtle">
            {t('Sort by')}
          </Text>
          <Select
            options={sortOptions}
            onOptionChange={(option) =>
              onChange({ filters, sortBy: option.value as DiscoverySortOption })
            }
            defaultOptionIndex={sortOptions.findIndex((o) => o.value === sortBy)}
          />
        </LabelWrapper>
      </SelectRow>
    </Panel>
  )
}

export default DiscoveryFiltersPanel
