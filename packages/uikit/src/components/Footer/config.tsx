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
        href: "https://docs.melegaswap.finance",
      },
      {
        label: "Blog",
        href: "https://medium.com/melegaswap",
      },
      {
        label: "Community",
        href: "https://docs.melega.finance",
      },
      {
        label: "CAKE",
        href: "https://docs.melega.finance/tokenomics/cgt-token",
      },
      {
        label: "—",
      },
      {
        label: "Online Store",
        href: "https://pancakeswap.creator-spring.com/",
        isHighlighted: true,
      },
    ],
  },
  {
    label: "Help",
    items: [
      {
        label: "Customer",
        href: "Support https://docs.pancakeswap.finance/contact-us/customer-support",
      },
      {
        label: "Troubleshooting",
        href: "https://docs.pancakeswap.finance/help/troubleshooting",
      },
      {
        label: "Guides",
        href: "https://docs.pancakeswap.finance/get-started",
      },
    ],
  },
  {
    label: "Developers",
    items: [
      {
        label: "Github",
        href: "https://github.com/pancakeswap",
      },
      {
        label: "Documentation",
        href: "https://docs.pancakeswap.finance",
      },
      {
        label: "Bug Bounty",
        href: "https://app.gitbook.com/@pancakeswap-1/s/pancakeswap/code/bug-bounty",
      },
      {
        label: "Audits",
        href: "https://docs.pancakeswap.finance/help/faq#is-pancakeswap-safe-has-pancakeswap-been-audited",
      },
      {
        label: "Careers",
        href: "https://docs.pancakeswap.finance/hiring/become-a-chef",
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
    href: "https://twitter.com/meleganza",
  },
  {
    label: "Discord",
    icon: InstagramIcon,
    href: "https://www.instagram.com/melega.finance/",
  },
  // {
  //   label: "Github",
  //   icon: GithubIcon,
  //   href: "/",
  // },
  // {
  //   label: "Medium",
  //   icon: MediumIcon,
  //   href: "https://medium.com/@CyberglowCS",
  // },
  // {
  //   label: "Docs",
  //   icon: ResourcesIcon,
  //   href: "https://docs.cyberglow.finance",
  // },
];

export const langs: Language[] = range(20).map((_, i) => ({
  code: `en${i}`,
  language: `English${i}`,
  locale: `Locale${i}`,
}));
