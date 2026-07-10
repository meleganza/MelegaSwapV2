import React from 'react'
import { useRouter } from 'next/router'
import {
  MelegaStudioLiveBadge,
  MelegaStudioLiveDot,
  MelegaStudioOutlineBtn,
  MelegaStudioPageHeader,
  STUDIO_PAGE_TITLES,
  STUDIO_LIVE_RUNTIME_LABEL,
} from 'design-system/melega'
import { useRadarRuntime } from '../radarRuntime/RadarRuntimeContext'

export const RadarStudioPageHeader: React.FC = () => {
  const router = useRouter()
  const { runContractPreview } = useRadarRuntime()

  return (
    <MelegaStudioPageHeader
      data-studio-header="radar"
      title={STUDIO_PAGE_TITLES.radar}
      subtitle="AI operational console for live discovery, wallet activity and contract intelligence."
      actions={
        <>
          <MelegaStudioOutlineBtn type="button" onClick={() => router.push('/projects')}>
            AI Discovery Engine
          </MelegaStudioOutlineBtn>
          <MelegaStudioOutlineBtn
            type="button"
            data-rd-live-scan-btn
            onClick={() => {
              const featured = document.querySelector<HTMLInputElement>('[data-rd-contract-input]')
              if (featured?.value) runContractPreview(featured.value)
              else featured?.focus()
            }}
          >
            <MelegaStudioLiveDot aria-hidden />
            Live Scan
          </MelegaStudioOutlineBtn>
        </>
      }
      badge={
        <MelegaStudioLiveBadge>
          <MelegaStudioLiveDot aria-hidden />
          {STUDIO_LIVE_RUNTIME_LABEL}
        </MelegaStudioLiveBadge>
      }
    />
  )
}

export default RadarStudioPageHeader
