import React from "react";
import styled from "styled-components";
import { CogIcon } from "../../../components/Svg";
import IconButton from "../../../components/Button/IconButton";
import { MENU_HEIGHT } from "../config";
import { PanelProps, PushedProps } from "../types";
import CakePrice from "../../../components/CakePrice/CakePrice";
// import ThemeSwitcher from "./ThemeSwitcher";
import SocialLinks from "../../../components/Footer/Components/SocialLinks";
import LangSelector from "../../../components/LangSelector/LangSelector";

interface Props extends PanelProps, PushedProps {}

const Container = styled.div`
  flex: none;
  padding: 8px 4px;
  background-color: ${({ theme }) => theme.nav.background};
  border-top: 2px solid #0e0e0e;
`;

const SettingsEntry = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: ${MENU_HEIGHT}px;
  padding: 0 8px;
`;

const SocialEntry = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  margin-bottom: 16px;
`;

const Content = styled.div`
  display: flex;
  flex-direction: row;
  padding-left: 16px;
  align-items: flex-start;
  margin-top: 8px;
`;

const LangSelectorWrapper = styled.div`
  margin-left: 12px;
  margin-top: 12px;
`;

const PanelFooter: React.FC<Props> = ({
  isPushed,
  pushNav,
  toggleTheme,
  isDark,
  cakePriceUsd,
  currentLang,
  langs,
  setLang,
}) => {
  if (!isPushed) {
    return (
      <Container>
        <IconButton variant="text" onClick={() => pushNav(true)}>
          <CogIcon />
        </IconButton>
      </Container>
    );
  }

  return (
    <Container>
      <Content>
        <CakePrice cakePriceUsd={cakePriceUsd} />
        <SocialEntry>
          <SocialLinks />
        </SocialEntry>
      </Content>
      <LangSelectorWrapper>
        <LangSelector currentLang={currentLang} langs={langs} setLang={setLang} buttonScale="xs" color="textSubtle" />
      </LangSelectorWrapper>
    </Container>
  );
};

export default PanelFooter;
