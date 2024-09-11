import React, { useContext, useRef, useEffect } from "react";
import { MenuContext } from "../../widgets/Menu/context";
import StyledMenuItem, { StyledMenuItemContainer } from "./styles";
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
  // const link = href === "/docs" ? "https://docs.cyberglow.finance/" : href === "/bridge" ? "https://shimmersea.finance/bridge" : href === "/home" ? "https://cyberglow.finance" : href;
  const link = href === "/docs" ? "https://docs.cyberglow.finance/" : href === "/bridge" ? "https://shimmersea.finance/bridge" : href;
  // const target = href === "/docs" || href === "/bridge" || href === "/home" ? "_blank" : "";
  const target = href === "/docs" || href === "/bridge" ? "_blank" : "";
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
    <StyledMenuItemContainer $isActive={isActive} $variant={variant} ref={menuItemRef}>
      <StyledMenuItem
        {...itemLinkProps}
        $isActive={isActive}
        $isDisabled={isDisabled}
        $variant={variant}
        $statusColor={statusColor}
        {...props}
      >
        {children}
      </StyledMenuItem>
    </StyledMenuItemContainer>
  );
};

export default MenuItem;
