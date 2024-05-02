import styled from "styled-components";
import { NextSeo } from "next-seo";
import { Button, Heading, Text, LogoIcon } from "@pancakeswap/uikit";
import { useTranslation } from "@pancakeswap/localization";
import Link from "next/link";

const StyledComing = styled.div`
  align-items: center;
  display: flex;
  position: absolute;
  top: 100px;
  flex-direction: column;
  justify-content: center;
  z-index: 1;
`;

const Coming1 = ({ text = "CyberGlow", mt = 0 }: { text?: string, mt?: number }) => {
  const { t } = useTranslation();

  return (
    <StyledComing>
      <img src="/logo.png" width="72px" />
      <Heading scale="xl" mb="8px">{text}</Heading>
      <Text>{t("Official Launch")}</Text>
      <Text fontSize="24px" bold>{t("October 15")}</Text>
    </StyledComing>
  );
};

export default Coming1;
