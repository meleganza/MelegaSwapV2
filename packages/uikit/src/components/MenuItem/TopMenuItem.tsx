import React, { useContext, useRef, useEffect } from "react";
import { MenuContext } from "../../widgets/Menu/context";
import { StyledTopMenuItemContainer, StyledTopMenuItem } from "./styles";
import { MenuItemProps } from "./types";
import { useMatchBreakpoints } from "../../contexts";

const MenuItem: React.FC<React.PropsWithChildren<MenuItemProps>> = ({
  children,
  href,
  isActive = false,
  isDisabled = false,
  variant = "default",
  scrollLayerRef,
  statusColor,
  ...props
}) => {
  const { isMobile } = useMatchBreakpoints();
  const menuItemRef = useRef<HTMLDivElement>(null);
  const { linkComponent } = useContext(MenuContext);
  const link = href === "/docs" ? "https://docs.kronoswap.com/" : (href === "/ifo" ? "https://www.pinksale.finance/launchpad/0xfF99F5d8d6a723907AC4d8c4bec298573b848c24?chain=Arbitrum" : href);
  const target = href === "/docs"? "_blank" : (href === "/ifo"? "_blank" : "");
  const itemLinkProps: any = link
    ? {
        as: linkComponent,
        href: link,
        target: target,
      }
    : {
        as: "div",
      };
  useEffect(() => {
    if (!isMobile || !isActive || !menuItemRef.current || !scrollLayerRef?.current) return;
    const scrollLayer = scrollLayerRef.current;
    const menuNode = menuItemRef.current.parentNode as HTMLDivElement;
    if (!menuNode) return;
    if (
      scrollLayer.scrollLeft > menuNode.offsetLeft ||
      scrollLayer.scrollLeft + scrollLayer.offsetWidth < menuNode.offsetLeft + menuNode.offsetWidth
    ) {
      scrollLayer.scrollLeft = menuNode.offsetLeft;
    }
  }, [isActive, isMobile, scrollLayerRef]);
  return (
    <StyledTopMenuItemContainer $isActive={isActive} $variant={variant} ref={menuItemRef}>
      <StyledTopMenuItem
        {...itemLinkProps}
        $isActive={isActive}
        $isDisabled={isDisabled}
        $variant={variant}
        $statusColor={statusColor}
        {...props}
      >
        {children}
      </StyledTopMenuItem>
    </StyledTopMenuItemContainer>
  );
};

export default MenuItem;
