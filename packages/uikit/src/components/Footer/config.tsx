import { range } from "lodash";
import { Language } from "../LangSelector/types";
import { FooterLinkType } from "./types";
import {
  TwitterIcon,
  TelegramIcon,
  RedditIcon,
  InstagramIcon,
  GithubIcon,
  ResourcesIcon,
  DiscordIcon,
  MediumIcon,
  YoutubeIcon,
} from "../Svg";

export const footerLinks: FooterLinkType[] = [
  {
    label: "About",
    items: [
      {
        label: "Contact",
        href: "https://www.melega.finance/apply",
      },
      {
        label: "Blog",
        href: "https://medium.com/melegaswap",
      },
      {
        label: "Community",
        href: "https://t.me/melegacommunity",
      },
      {
        label: "MARCO",
        href: "https://www.melega.finance/marco-token",
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Documentation",
        href: "https://www.melega.finance/about",
      },
      {
        label: "Support",
        href: "mailto:support@melega.finance",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Github",
        href: "https://github.com/meleganza/MelegaSwapV2",
      },
      {
        label: "Melega DEX",
        href: "https://melega.finance",
      },
    ],
  },
];

export const socials = [
  {
    label: "Telegram",
    icon: TelegramIcon,
    href: "https://t.me/melegacommunity"
  },
  {
    label: "Twitter",
    icon: TwitterIcon,
    href: "https://twitter.com/meleganews",
  },
  {
    label: "Discord",
    icon: InstagramIcon,
    href: "https://www.instagram.com/melega.finance/",
  },
];

export const langs: Language[] = range(20).map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}));
