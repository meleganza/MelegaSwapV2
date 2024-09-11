import { useMatchBreakpoints } from '@pancakeswap/uikit'
import { baseColors } from "@pancakeswap/ui/tokens/colors";
import React, { useContext } from "react";
import styled, { keyframes, ThemeConsumer } from "styled-components";
import { colorStyle, fontFamily } from "styled-system";
import Flex from "../../../components/Box/Flex";
import { HamburgerCloseIcon, HamburgerIcon, LogoIcon, LogoWithTextIcon } from "../../../components/Svg";
import { MenuContext } from "../context";
import MenuButton from "./MenuButton";

interface Props {
  isHome?: boolean;
  isPushed?: boolean;
  isDark?: boolean;
  togglePush?: () => void;
  href: string;
}

const blink = keyframes`
  0%,  100% { transform: scaleY(1); }
  50% { transform:  scaleY(0.1); }
`;

const LogoText = styled("div")`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 3px;
  margin-left: 10px;
`;

const StyledLink = styled("a")`
  display: flex;
  .mobile-icon {
    width: 40px;
    ${({ theme }) => theme.mediaQueries.sm} {
      display: none;
    }
  }
  .desktop-icon {
    width: 160px;
    display: none;
    ${({ theme }) => theme.mediaQueries.sm} {
      display: block;
    }
  }
  .eye {
    animation-delay: 20ms;
  }
  &:hover {
    .eye {
      transform-origin: center 60%;
      animation-name: ${blink};
      animation-duration: 350ms;
      animation-iteration-count: 1;
    }
  }
`;

const mediaQueryLg = '@media (max-width: ${({ theme }) => theme.breakpoints.lg})'

const Logo: React.FC<React.PropsWithChildren<Props>> = ({ isHome = false, isPushed = false, togglePush, isDark, href }) => {
  const { linkComponent } = useContext(MenuContext);
  const isAbsoluteUrl = href.startsWith("http");

  const innerLogo = (
    <>
      <LogoIcon className="mobile-icon" />
      <LogoWithTextIcon className="desktop-icon" />
      {/* <LogoText>
        <span style={{ color: baseColors.primary, fontFamily: "Relative, sans-serif", fontSize: "24px", fontWeight: "600" }}> NebulaSwap </span>
      </LogoText> */}
    </>
  );

  return (
    <Flex alignItems="center">
      <MenuButton aria-label="Toggle menu" onClick={togglePush} mr="24px">
        {isPushed ? (
          <HamburgerCloseIcon width="24px" color="textSubtle" />
        ) : (
          <HamburgerIcon width="24px" color="textSubtle" />
        )}
      </MenuButton>
      {isAbsoluteUrl ? (
        <StyledLink as="a" href={href} aria-label="Pancake home page" target="_blank">
          {innerLogo}
        </StyledLink>
      ) : (
        <StyledLink href={href} as={linkComponent} aria-label="Pancake home page">
          {innerLogo}
        </StyledLink>
      )}
    </Flex>
  );
};

export default React.memo(Logo);
