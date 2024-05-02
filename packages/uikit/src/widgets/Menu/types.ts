import { ElementType, ReactElement, ReactNode } from "react";
import { FooterLinkType } from "../../components/Footer/types";
import { MenuItemsType } from "../../components/MenuItems/types";
import { SubMenuItemsType } from "../../components/SubMenuItems/types";
import { Colors } from "../../theme/types";

export interface Language {
  code: string;
  language: string;
  locale: string;
}

export interface LinkStatus {
  text: string;
  color: keyof Colors;
}

export interface NavProps {
  linkComponent?: ElementType;
  leftSide?: ReactNode;
  rightSide?: ReactNode;
  banner?: ReactElement;
  links: Array<MenuItemsType>;
  topLinks: Array<MenuItemsType>;
  subLinks?: Array<SubMenuItemsType>;
  footerLinks: Array<FooterLinkType>;
  activeItem?: string;
  activeSubItem?: string;
  isDark: boolean;
  toggleTheme: (isDark: boolean) => void;
  cakePriceUsd?: number;
  currentLang: string;
  buyCakeLabel: string;
  buyCakeLink: string;
  langs: Language[];
  setLang: (lang: Language) => void;
}

export interface PanelProps {
  isDark: boolean;
  toggleTheme: (isDark: boolean) => void;
  cakePriceUsd?: number;
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
  links: Array<MenuItemsType>;
  activeItem: string | undefined;
  activeSubItem: string | undefined;
}

export interface PushedProps {
  isPushed: boolean;
  pushNav: (isPushed: boolean) => void;
}
