import { useIsMounted } from "@pancakeswap/hooks";
import { AtomBox } from "@pancakeswap/ui/components/AtomBox";
import throttle from "lodash/throttle";
import React, { useEffect, useRef, useState, useMemo } from "react";
import styled from "styled-components";
import BottomNav from "../../components/BottomNav";
import { Box } from "../../components/Box";
import Flex from "../../components/Box/Flex";
import CakePrice from "../../components/CakePrice/CakePrice";
import Footer from "../../components/Footer";
import LangSelector from "../../components/LangSelector/LangSelector";
import MenuItems from "../../components/MenuItems/MenuItems";
import { SubMenuItems } from "../../components/SubMenuItems";
import { useMatchBreakpoints } from "../../contexts";
import Logo from "./components/Logo";
import Panel from "./components/Panel";
import {
  MENU_HEIGHT,
  MOBILE_MENU_HEIGHT,
  TOP_BANNER_HEIGHT,
  TOP_BANNER_HEIGHT_MOBILE,
  SIDEBAR_WIDTH_REDUCED,
  SIDEBAR_WIDTH_FULL,
} from "./config";
import { MenuContext } from "./context";
import { NavProps } from "./types";
import { SkeletonV2 } from "../../components/Skeleton";
import { ThemeSwitcher } from "../../components/ThemeSwitcher";
import { PageOverlay } from "../../components/PageOverlay";
import { Button, NextLinkFromReactRouter } from "../../components";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 100vh;
  // background-color: ${({ theme }) => theme.colors.backgroundAltBlur};
`;

const StyledNav = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  height: ${MENU_HEIGHT + 16}px;
  background-color: ${({ theme }) => theme.colors.backgroundAltBlur};
  border-bottom: 2px solid #0e0e0e;
  transform: translate3d(0, 0, 0);

  // padding-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
`;

const FixedContainer = styled.div<{ showMenu: boolean; height: number }>`
  position: fixed;
  top: ${({ showMenu, height }) => (showMenu ? 0 : `-${height + 15}px`)};
  left: 0;
  transition: top 0.2s;
  height: ${({ height }) => `${height}px`};
  width: 100%;
  z-index: 20;
`;

const TopBannerContainer = styled.div<{ height: number }>`
  height: ${({ height }) => `${60}px`};
  min-height: ${({ height }) => `${60}px`};
  max-height: ${({ height }) => `${60}px`};
  width: 100%;
`;

const BodyWrapper = styled(Box)`
  position: relative;
  display: flex;
`;

const Inner = styled.div<{ isPushed: boolean; showMenu: boolean; isHome: boolean }>`
  flex-grow: 1;
  transition: margin-top 0.2s, margin-left 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translate3d(0, 0, 0);
  max-width: 100%;
  ${({ theme }) => theme.mediaQueries.lg} {
    margin-left: ${({ isPushed, isHome }) =>
      `${isHome ? 0 : isPushed ? SIDEBAR_WIDTH_FULL + 10 : SIDEBAR_WIDTH_REDUCED}px`};
    max-width: ${({ isPushed, isHome }) =>
      `calc(100% - ${isHome ? 0 : isPushed ? SIDEBAR_WIDTH_FULL + 10 : SIDEBAR_WIDTH_REDUCED}px)`};
  }
`;

const MobileOnlyOverlay = styled(PageOverlay)`
  position: fixed;
  height: 100%;

  ${({ theme }) => theme.mediaQueries.lg} {
    display: none;
  }
`;

const Menu: React.FC<React.PropsWithChildren<NavProps>> = ({
  linkComponent = "a",
  banner,
  leftSide,
  rightSide,
  isDark,
  toggleTheme,
  currentLang,
  setLang,
  cakePriceUsd,
  links,
  subLinks,
  footerLinks,
  activeItem,
  activeSubItem,
  langs,
  buyCakeLabel,
  buyCakeLink,
  children,
}) => {
  const { isMobile } = useMatchBreakpoints();
  const isMounted = useIsMounted();
  const [isPushed, setIsPushed] = useState(!isMobile);
  const [showMenu, setShowMenu] = useState(true);
  const refPrevOffset = useRef(typeof window === "undefined" ? 0 : window.pageYOffset);

  const topBannerHeight = isMobile ? TOP_BANNER_HEIGHT_MOBILE : TOP_BANNER_HEIGHT;

  // const totalTopMenuHeight = isMounted && banner ? MENU_HEIGHT + topBannerHeight : MENU_HEIGHT;
  const totalTopMenuHeight = MENU_HEIGHT;

  useEffect(() => {
    const handleScroll = () => {
      const currentOffset = window.pageYOffset;
      const isBottomOfPage = window.document.body.clientHeight === currentOffset + window.innerHeight;
      const isTopOfPage = currentOffset === 0;
      // Always show the menu when user reach the top
      if (isTopOfPage) {
        setShowMenu(true);
      }
      // Avoid triggering anything at the bottom because of layout shift
      else if (!isBottomOfPage) {
        // if (currentOffset < refPrevOffset.current || currentOffset <= totalTopMenuHeight) {
        if (currentOffset < refPrevOffset.current) {
          // Has scroll up
          setShowMenu(true);
        } else {
          // Has scroll down
          setShowMenu(false);
        }
      }
      refPrevOffset.current = currentOffset;
    };
    const throttledHandleScroll = throttle(handleScroll, 200);

    window.addEventListener("scroll", throttledHandleScroll);
    return () => {
      window.removeEventListener("scroll", throttledHandleScroll);
    };
  }, [totalTopMenuHeight]);

  // Find the home link if provided
  const homeLink = links.find((link) => link.label === "Home");

  const isHome = activeItem === "/disabled"; // isHome logic causes issues with responsiveness at the home page
  const isRoot = activeItem === "/";
  const isNft = activeItem === "/nft" || activeItem === "/viewNFTs" || activeItem === "/nftmarket";
  // const isIlo = activeItem === '/ilo';

  const subLinksWithoutMobile = subLinks?.filter((subLink) => !subLink.isMobileOnly);
  const subLinksMobileOnly = subLinks?.filter((subLink) => subLink.isMobileOnly);
  const providerValue = useMemo(() => ({ linkComponent }), [linkComponent]);
  return (
    <MenuContext.Provider value={providerValue}>
      <AtomBox
        asChild
        minHeight={{
          xs: "auto",
          md: "100vh",
        }}
      >
        <Wrapper>
          <FixedContainer showMenu={showMenu} height={totalTopMenuHeight}>
            {/* {banner && isMounted && <TopBannerContainer height={topBannerHeight}>{banner}</TopBannerContainer>} */}
            <StyledNav>
              {/* <Flex width="100%"> */}
              <Logo
                isHome={isHome}
                isPushed={isPushed}
                togglePush={() => setIsPushed((prevState: boolean) => !prevState)}
                isDark={isDark}
                // href={homeLink?.href ?? "/"}
                href="/"
              />
              {/* <AtomBox display={{ xs: "none", md: "block" }}>
                  <MenuItems items={links} activeItem={activeItem} activeSubItem={activeSubItem} />
                </AtomBox> */}
              {/* </Flex> */}
              {/* <Flex alignItems="center" height="100%">
                <AtomBox mr="12px" display={{ xs: "none", lg: "block" }}>
                  <CakePrice buyCakeLink={buyCakeLink} showSkeleton={false} cakePriceUsd={cakePriceUsd} />
                </AtomBox> */}
              {/* <Box mt="4px">
                  <LangSelector
                    currentLang={currentLang}
                    langs={langs}
                    setLang={setLang}
                    buttonScale="xs"
                    color="textSubtle"
                    hideLanguage
                  />
                </Box> */}
              {/* <SkeletonV2 variant="round" width="32px" height="32px" isDataReady={isMounted} ml="8px" >
                  <ThemeSwitcher isDark={isDark} toggleTheme={toggleTheme} />
                </SkeletonV2> */}
              <Flex>
                {/* {leftSide} */}
                {rightSide}
              </Flex>
              {/* </Flex> */}
            </StyledNav>
          </FixedContainer>
          <BodyWrapper mt={!isHome ? `${totalTopMenuHeight + 1}px` : `0`}>
            <Panel
              isPushed={isPushed}
              isMobile={isMobile}
              showMenu={showMenu}
              isDark={isDark}
              toggleTheme={toggleTheme}
              langs={langs}
              setLang={setLang}
              currentLang={currentLang}
              cakePriceUsd={cakePriceUsd}
              pushNav={setIsPushed}
              links={links}
              activeItem={activeItem}
              activeSubItem={activeSubItem}
            />
            <Inner isPushed={isPushed} showMenu={showMenu} isHome={isHome}>
              {subLinks && subLinks.length > 1 && !isNft ? (
                <Flex justifyContent="space-around" overflow="hidden">
                  <SubMenuItems
                    items={subLinksWithoutMobile}
                    mt={`${totalTopMenuHeight + 1}px`}
                    activeItem={activeSubItem}
                  />

                  {subLinksMobileOnly && subLinksMobileOnly?.length > 0 && (
                    <SubMenuItems
                      items={subLinksMobileOnly}
                      mt={`${totalTopMenuHeight + 1}px`}
                      activeItem={activeSubItem}
                      isMobileOnly
                    />
                  )}
                </Flex>
              ) : (
                <div />
              )}
              {children}
            </Inner>
            {!isHome && <MobileOnlyOverlay show={isPushed} onClick={() => setIsPushed(false)} role="presentation" />}
          </BodyWrapper>
        </Wrapper>
      </AtomBox>
      {/* <Footer
        items={footerLinks}
        isDark={isDark}
        toggleTheme={toggleTheme}
        langs={langs}
        setLang={setLang}
        currentLang={currentLang}
        cakePriceUsd={cakePriceUsd}
        buyCakeLabel={buyCakeLabel}
        buyCakeLink={buyCakeLink}
        mb={[`${MOBILE_MENU_HEIGHT}px`, null, `${MOBILE_MENU_HEIGHT}px`]}
      /> */}
      {/* <AtomBox display={{ xs: "block", md: "none" }}>
        <BottomNav items={links} activeItem={activeItem} activeSubItem={activeSubItem} />
      </AtomBox> */}
    </MenuContext.Provider>
  );
};

export default Menu;
