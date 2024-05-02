import React from "react";
import styled from "styled-components";
import { useRouter } from "next/router";
import { useTranslation } from "@pancakeswap/localization";
import { NextLinkFromReactRouter } from "../../../components/NextLink";
import { NotificationDot } from "../../../components/NotificationDot";
import { ButtonMenu, ButtonMenuItem } from "../../../components/ButtonMenu";
import { Text } from "../../../components/Text";
import { Flex } from "../../../components/Box";

const Wrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  ${({ theme }) => theme.mediaQueries.sm} {
    margin-left: 16px;
  }
`;

interface FarmTabButtonsProps {
  hasStakeInFinishedFarms: boolean;
  tokenMode?: boolean;
}

export const FarmTabButtons: React.FC<React.PropsWithChildren<FarmTabButtonsProps>> = ({ hasStakeInFinishedFarms, tokenMode }) => {
  const router = useRouter();
  const { t } = useTranslation();

  let activeIndex;
  switch (router.pathname) {
    case "/farms":
      activeIndex = 0;
      break;
    case "/pools":
      activeIndex = 0;
      break;
    case "/farms/history":
      activeIndex = 1;
      break;
    case "/pools/history":
      activeIndex = 1;
      break;
    case "/_mp/farms/history":
      activeIndex = 1;
      break;
    case "/farms/archived":
      activeIndex = 2;
      break;
    default:
      activeIndex = 0;
      break;
  }

  return (
    <Wrapper>
      <Flex width="max-content" flexDirection="column">
        {/* <Text textTransform="uppercase" color="textSubtle" fontSize="12px" bold>
          {t("Filter by")}
        </Text> */}
        <ButtonMenu activeIndex={activeIndex} scale="sm" variant="subtle">
          <ButtonMenuItem as={NextLinkFromReactRouter} to={tokenMode ? "/pools" : "/farms"}>
            {t("Live")}
          </ButtonMenuItem>
          <NotificationDot show={hasStakeInFinishedFarms}>
            <ButtonMenuItem as={NextLinkFromReactRouter} to={tokenMode ? "/pools/history" : "/farms/history"} id="finished-farms-button">
              {t("Finished")}
            </ButtonMenuItem>
          </NotificationDot>
        </ButtonMenu>
      </Flex>
    </Wrapper>
  );
};
