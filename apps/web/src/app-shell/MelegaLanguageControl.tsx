import React from 'react'
import styled from 'styled-components'
import { LangSelector } from '@pancakeswap/uikit'
import { useTranslation } from '@pancakeswap/localization'
import { languageList } from 'config/localization/languages'

const Slot = styled.div`
  display: flex;
  align-items: center;
  height: 40px;

  button {
    height: 40px !important;
    min-height: 40px !important;
    padding: 0 12px !important;
    border-radius: 10px !important;
    border: 1px solid rgba(255, 255, 255, 0.08) !important;
    background: transparent !important;
    box-shadow: none !important;
    font-size: 13px !important;
    font-weight: 600 !important;
    color: #b3b3b3 !important;
  }

  button:hover {
    border-color: rgba(212, 175, 55, 0.35) !important;
    color: #ffffff !important;
  }

  svg {
    width: 18px !important;
    height: 18px !important;
  }
`

export const MelegaLanguageControl: React.FC = () => {
  const { currentLanguage, setLanguage } = useTranslation()

  return (
    <Slot className="melega-shell-language" data-melega-language-control>
      <LangSelector
        currentLang={currentLanguage.code}
        langs={languageList}
        setLang={setLanguage}
        color="textSubtle"
        buttonScale="sm"
        dropdownPosition="bottom"
      />
    </Slot>
  )
}

export default MelegaLanguageControl
