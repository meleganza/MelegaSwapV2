import { Language } from "../LangSelector/types";
import { FlexProps } from "../Box";

export type FooterLinkType = {
  label: string;
  href?: string;
  isHighlighted?: boolean;
  items: { label: string; href?: string; isHighlighted?: boolean; blank?: boolean; }[];
};

export type FooterProps = {
  items: FooterLinkType[];
  buyCakeLabel: string;
  buyCakeLink: string;
  isDark: boolean;
  toggleTheme: (isDark: boolean) => void;
  cakePriceUsd?: number;
  currentLang: string;
  langs: Language[];
  setLang: (lang: Language) => void;
} & FlexProps;
