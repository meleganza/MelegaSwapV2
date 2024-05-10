import { bscTokens } from '@pancakeswap/tokens'
import { SerializedFarmConfig } from '@pancakeswap/farms'

const farms: SerializedFarmConfig[] = [
  // {
  //   pid: 0,
  //   lpSymbol: 'MARCO',
  //   lpAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
  //   quoteToken: bscTokens.wbnb,
  //   token: bscTokens.gtoken,
  //   isTokenOnly: true,
  // },
  // {
  //   pid: 1,
  //   lpSymbol: 'MARCO-BNB LP',
  //   lpAddress: '0x80bD4f52f36b5772b89A2EC0b80c5080cFf4BaC9',
  //   quoteToken: bscTokens.wbnb,
  //   token: bscTokens.gtoken,
  // },
  // {
  //   pid: 2,
  //   lpSymbol: 'MARCO-USDT LP',
  //   lpAddress: '0xf31f31b198e19E12baF3Aa2A9e0F05E837dDDBC0',
  //   quoteToken: bscTokens.usdt,
  //   token: bscTokens.gtoken,
  // },
  // {
  //   pid: 3,
  //   lpSymbol: 'MARCO-USDC LP',
  //   lpAddress: '0xd598Cd93103D205ceAaEa3b05733FA0e19EE8E76',
  //   quoteToken: bscTokens.usdc,
  //   token: bscTokens.gtoken,
  // },
  // {
  //   pid: 4,
  //   lpSymbol: 'MARCO-DAI LP',
  //   lpAddress: '0x5b644fa75dFC91f453190c4eBCD85AfE365f8202',
  //   quoteToken: bscTokens.dai,
  //   token: bscTokens.gtoken,
  // },
  // {
  //   pid: 5,
  //   lpSymbol: 'BNB-USDT LP',
  //   lpAddress: '0x8E3084D1F7246BD63f8df09eCa075B738C757696',
  //   quoteToken: bscTokens.bnb,
  //   token: bscTokens.usdt,
  // },
  // {
  //   pid: 6,
  //   lpSymbol: 'BNB-USDC LP',
  //   lpAddress: '0xf1F27432eE9f9D1c366C45Ff06dEa2C38586F825',
  //   quoteToken: bscTokens.bnb,
  //   token: bscTokens.usdc,
  // },
  // {
  //   pid: 7,
  //   lpSymbol: 'USDT-USDC LP',
  //   lpAddress: '0x06Da11093bc03D54d214391e32A1A61A527A71C3',
  //   quoteToken: bscTokens.usdt,
  //   token: bscTokens.usdc,
  // },
  // {
  //   pid: 8,
  //   lpSymbol: 'USDC-DAI LP',
  //   lpAddress: '0x3dc0814D9DB34Dd6223c727000a05ea0e8cB0d34',
  //   quoteToken: bscTokens.usdc,
  //   token: bscTokens.dai,
  // },
  // {
  //   pid: 9,
  //   lpSymbol: 'BTCB-USDT LP',
  //   lpAddress: '0x89276b05e5702904915BCbc6A0e217fd28F94694',
  //   quoteToken: bscTokens.usdt,
  //   token: bscTokens.btcb,
  // },
  // {
  //   pid: 10,
  //   lpSymbol: 'BTCB-DAI LP',
  //   lpAddress: '0x8Cba424799789F7E1c0090445fDDB0c1399aF00b',
  //   quoteToken: bscTokens.btcb,
  //   token: bscTokens.dai,
  // },
  // {
  //   pid: 11,
  //   lpSymbol: 'BNB-ETH LP',
  //   lpAddress: '0x4889dbeB2467Cd4f343B5Cf0FB9448dD090a0198',
  //   quoteToken: bscTokens.wbnb,
  //   token: bscTokens.eth,
  // },
  // {
  //   pid: 12,
  //   lpSymbol: 'USDC-ETH LP',
  //   lpAddress: '0x19751f7F4d1b697f09f6306e0CB3924E42E9c545',
  //   quoteToken: bscTokens.usdc,
  //   token: bscTokens.eth,
  // },
  {
    pid: 0,
    lpSymbol: 'MARCO',
    lpAddress: '0x963556de0eb8138E97A85F0A86eE0acD159D210b',
    token: bscTokens.syrup,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 1,
    lpSymbol: 'MARCO-BNB LP',
    lpAddress: '0x7286c16c3c05d4c17B689bE7948Ec4Fa4e861d1E',
    token: bscTokens.cake,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 2,
    lpSymbol: 'BUSD-BNB LP',
    lpAddress: '0x564863b0267d9fed9c7d414113d7dd60cf4b253e',
    token: bscTokens.wbnb,
    quoteToken: bscTokens.busd,
  },
  {
    pid: 3,
    lpSymbol: 'GIOTTO-BNB LP',
    lpAddress: '0x443f2e9A5877e2896d1248288c73AA6B7402fbBe',
    token: bscTokens.gitto,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 4,
    lpSymbol: 'ZLT-BNB LP',
    lpAddress: '0xD656C120E843012C33187E8732B83F0c1FC1f858',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 5,
    lpSymbol: 'MXMX-BNB LP',
    lpAddress: '0x8481c346D5348A7b543Cb3755beBB68799d375d0',
    token: bscTokens.mxmx,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 6,
    lpSymbol: 'MM72-BNB LP',
    lpAddress: '0x7825da4753eb52d918dAc368f59D1FB734daFB72',
    token: bscTokens.mm72,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 7,
    lpSymbol: '2GCC-BNB LP',
    lpAddress: '0xfEf01a730432A74d359B01CA9a6c51e2583E4224',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 8,
    lpSymbol: 'M01-BNB LP',
    lpAddress: '0x2E1B5FdDa0A20e1cd8E4131408a0BbEF4FAeB8a2',
    token: bscTokens.m01,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 9,
    lpSymbol: 'RMBR-BNB LP',
    lpAddress: '0xBd47F3a3D0B7C21Ab393a157d0A46a1733eC1b01',
    token: bscTokens.rmbr,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 10,
    lpSymbol: 'MARCO-BUSD LP',
    lpAddress: '0x0c655F723F8765009016426aa454950216B5Bc08',
    token: bscTokens.cake,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 11,
    lpSymbol: 'MARCO-USDT LP',
    lpAddress: '0xb1857b7A6650C5711cCFae451d79bF86C6CbAca4',
    token: bscTokens.usdt,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 12,
    lpSymbol: 'MARCO-USDC LP',
    lpAddress: '0x6804D8b2be83f8e38b26552aD445906C696a671C',
    token: bscTokens.usdc,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 13,
    lpSymbol: 'MARCO-CAKE LP',
    lpAddress: '0x75E6E495a4bDA582CbEd52dbfCb6F69D39C2cAeA',
    token: bscTokens.pancake,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 14,
    lpSymbol: 'MXMX-BUSD LP',
    lpAddress: '0x17313681251d12e0d7df38168E18B6B19367Bd09',
    token: bscTokens.mxmx,
    quoteToken: bscTokens.busd,
  },
  {
    pid: 15,
    lpSymbol: 'MXMX-USDT LP',
    lpAddress: '0xD4C94859046693E670D6008886A2cD75aA4B2Db4',
    token: bscTokens.usdt,
    quoteToken: bscTokens.mxmx,
  }
  ,
  {
    pid: 16,
    lpSymbol: 'MARCO-DOGE LP',
    lpAddress: '0xd36421fdF280bA36Db6FBb67F4985aF91b47d16c',
    token: bscTokens.doge,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 17,
    lpSymbol: 'MARCO-DAI LP',
    lpAddress: '0x42d6B0155d1c9cb480ed30c331e32DD08c49541e',
    token: bscTokens.dai,
    quoteToken: bscTokens.cake,
  },
  {
    pid: 18,
    lpSymbol: 'MARCO-SHIB LP',
    lpAddress: '0x004EdaC5B404Cad0a0E77F87EB2B99E130a346B3',
    token: bscTokens.shib,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 19,
    lpSymbol: 'MARCO-USDD LP',
    lpAddress: '0x0A6477716f1a2682EC0442Cc07Ae7E329aaE4EA2',
    token: bscTokens.usdd,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 20,
    lpSymbol: 'MARCOLP-BNB LP',
    lpAddress: '0x9209c62C7A0Fa63919b48Ab4d18942b0BDF646c5',
    token: bscTokens.marcobnb,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 21,
    lpSymbol: 'MXMXLP-BNB LP',
    lpAddress: '0x92D67958e922d46EceA95d0C8AC9446b83aF5075',
    token: bscTokens.mxmxbnb,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 22,
    lpSymbol: 'MM72LP-BNB LP',
    lpAddress: '0x5B610D743CeeC54EDccD5E724d75A768E30D2a45',
    token: bscTokens.mm72bnb,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 23,
    lpSymbol: 'MM72-USDT LP',
    lpAddress: '0xA3f45B7C666883F06C88906E76Dfa9831c5545D0',
    token: bscTokens.usdt,
    quoteToken: bscTokens.mm72,
  }
  ,
  {
    pid: 24,
    lpSymbol: 'MM19-BNB LP',
    lpAddress: '0x56c52BBcDCE21C49f8944301694fbFF2c71A397F',
    token: bscTokens.mm19,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 25,
    lpSymbol: 'BEAR-BNB LP',
    lpAddress: '0x0Fdd8f7F59C2995595A07323C6555d4b4417eB38',
    token: bscTokens.bear,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 26,
    lpSymbol: 'MARCO-VAI LP',
    lpAddress: '0x4c4666572E3A315fA3Cf732E455Da77073ce5b2B',
    token: bscTokens.vai,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 27,
    lpSymbol: 'MARCO-ETH LP',
    lpAddress: '0x82a1Bb35955a5eAc598665F4255817e13f1E6A7E',
    token: bscTokens.eth,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 28,
    lpSymbol: 'MARCO-BTCB LP',
    lpAddress: '0x84f6372D7e53C75C2D505Bb6D67aEBf116850A08',
    token: bscTokens.btcb,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 29,
    lpSymbol: 'MARCO-DOT LP',
    lpAddress: '0x3bc28dEe541413D37A212C4ccC4b743C6B904c53',
    token: bscTokens.dot,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 30,
    lpSymbol: 'VOLT-BNB LP',
    lpAddress: '0xf1D2a396848d81616d650b099ddD639331b552b1',
    token: bscTokens.volt,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 31,
    lpSymbol: 'VOLT-MARCO LP',
    lpAddress: '0xc5c866268b2F02C8074A2bf6dF2908cEe1172A83',
    token: bscTokens.volt,
    quoteToken: bscTokens.cake,
  },
  {
    pid: 32,
    lpSymbol: 'FBTC-BNB LP',
    lpAddress: '0x9152995AEc7C2dEBCc6e2d34c5E30d3d25D4cEa4',
    token: bscTokens.fbtc,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 33,
    lpSymbol: 'GWT-BNB LP',
    lpAddress: '0xDcf86B2472aFd4C16132d9A4C9891A16aF439be5',
    token: bscTokens.gwt,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 34,
    lpSymbol: 'MARCO-QCWC LP',
    lpAddress: '0x4142B4a2857E1D8cD2cdCBCcB5D2fE871c7b4E80',
    token: bscTokens.qcwc,
    quoteToken: bscTokens.cake,
  },
  {
    pid: 35,
    lpSymbol: 'MARCO-OSTRICH LP',
    lpAddress: '0x24d0aC1D7a12835d013cb6386F1a13C41fF7F2ce',
    token: bscTokens.ostrich,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 36,
    lpSymbol: 'KOALA-USDT LP',
    lpAddress: '0xbd19ebeC69eB3D70EAF840a24FC599bba9d1052A',
    token: bscTokens.koala,
    quoteToken: bscTokens.usdt,
  } ,
  {
    pid: 37,
    lpSymbol: 'KOALA-BNB LP',
    lpAddress: '0x005ab723E40401dFe81C4d427DA62b4ea89Ec4eA',
    token: bscTokens.koala,
    quoteToken: bscTokens.wbnb,
  } ,
  {
    pid: 38,
    lpSymbol: 'FROGE-MARCO LP',
    lpAddress: '0xe2c1D33a6b38E750F7C327a75e8bCF801722Fb7d',
    token: bscTokens.froge,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 39,
    lpSymbol: 'ROTTO-BUSD LP',
    lpAddress: '0xef2e91559b3360e5c287fAC62c9034A5ea4AE1E0',
    token: bscTokens.rotto,
    quoteToken: bscTokens.busd,
  },
  {
    pid: 40,
    lpSymbol: 'GPAY-BNB LP',
    lpAddress: '0x53B134E5B12D2BF914d23f556465B3b14efcdE69',
    token: bscTokens.gpay,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 41,
    lpSymbol: 'GGW-BNB LP',
    lpAddress: '0x9819ba5974E5A5062d9cC91ED1a39E5eeb8D43F8',
    token: bscTokens.ggw,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 42,
    lpSymbol: 'HBIT-BNB LP',
    lpAddress: '0x2415807a26c84C35Ff8898142556c4A41738f138',
    token: bscTokens.hbit,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 43,
    lpSymbol: 'MARCO-KOALA LP',
    lpAddress: '0x8d0ba725A53048b946ADA25423117F209A4Cb36C',
    token: bscTokens.koala,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 44,
    lpSymbol: 'LIRA-BNB LP',
    lpAddress: '0x51D3e3B8Fc52B34466F19d1f9Cdba7F28DF95181',
    token: bscTokens.lira,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 45,
    lpSymbol: 'MARCO-LIRA LP',
    lpAddress: '0x79Ccd7f1687f71a45d3746374236061CE677c12b',
    token: bscTokens.lira,
    quoteToken: bscTokens.cake,
  },
  {
    pid: 46,
    lpSymbol: 'MARCO-SPX LP',
    lpAddress: '0x45fF0D167289A92df343535E4ECfFB9FF0C702c7',
    token: bscTokens.spx,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 47,
    lpSymbol: 'MARCO-LOIS LP',
    lpAddress: '0xf83Fc461E9BF886cF6a60256cA1Fb4eeBeEeF2ce',
    token: bscTokens.lois,
    quoteToken: bscTokens.cake,
  },
  {
    pid: 48,
    lpSymbol: 'MARCO-DOG LP',
    lpAddress: '0x110fc3c2BE135553Aee5A132BBf30cb858a3dA8c',
    token: bscTokens.dogebit,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 49,
    lpSymbol: 'MARCO-C4Cv2 LP',
    lpAddress: '0x1BbdBB9306b0F3a62981BEa3A67336180d4ad935',
    token: bscTokens.C4Cv2,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 50,
    lpSymbol: 'LIRA-HBIT LP',
    lpAddress: '0x53eD8B7E8f2D221c28337FFe89BF89D16fcf5ED1',
    token: bscTokens.lira,
    quoteToken: bscTokens.hbit,
  }
  ,
  {
    pid: 51,
    lpSymbol: 'MARCO-MXMX LP',
    lpAddress: '0x1e090805D6A9CEa65e61aF67e272377CfDfD564D',
    token: bscTokens.mxmx,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 52,
    lpSymbol: 'MARCO-2GCC LP',
    lpAddress: '0x68daD1b10fbED92EDec1Afd9c5ffD7f6D78f7065',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 53,
    lpSymbol: 'MARCO-BEAR LP',
    lpAddress: '0x3fD9C2CD6186A0e90d0357CE100b3C13Bc2accDA',
    token: bscTokens.bear,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 54,
    lpSymbol: 'GPAY-2GCC LP',
    lpAddress: '0xc09ecE1ECee683Cc53D19CB4CE27eaa6Ef3141ff',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.gpay,
  }
  ,
  {
    pid: 55,
    lpSymbol: 'SFE-MARCO LP',
    lpAddress: '0x7755F749F5b16d2335D928EcBc9Da3aF210546fe',
    token: bscTokens.sfe,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 56,
    lpSymbol: 'BEFX-BNB LP',
    lpAddress: '0x9C7D868232B503DD23C5bD57D1F42564f43117C1',
    token: bscTokens.befxold,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 57,
    lpSymbol: 'FWC-BUSD LP',
    lpAddress: '0xe923F39def21c2BA761A973f4c87B2c656b310e1',
    token: bscTokens.fwc,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 58,
    lpSymbol: 'BORZ-MARCO LP',
    lpAddress: '0x61ef3c8f0463921a76b0e20f717BfCA9F634C56E',
    token: bscTokens.borz,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 59,
    lpSymbol: 'FAS-BNB LP',
    lpAddress: '0xaa1634C5e09B2F8855e7646edE3c01B1B0d3CeC7',
    token: bscTokens.fas,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 60,
    lpSymbol: 'LIRA-2GCC LP',
    lpAddress: '0xFe4651cc36905E71511b881f7bdB8250606Cd704',
    token: bscTokens.lira,
    quoteToken: bscTokens.gcc2,
  }
  ,
  {
    pid: 61,
    lpSymbol: 'GPAY-M01 LP',
    lpAddress: '0x4B12EA1fc357Db0957a364d07B71d7236612722a',
    token: bscTokens.gpay,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 62,
    lpSymbol: 'CTI-MARCO LP',
    lpAddress: '0x4cF18Cef70147c8659d10227577B0377Ef211ABf',
    token: bscTokens.cti,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 63,
    lpSymbol: 'CVL-MARCO LP',
    lpAddress: '0xeBa697Bd9588fF34061AD47cFe9017A29341EC8f',
    token: bscTokens.cvl,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 64,
    lpSymbol: 'GIOTTO-M01 LP',
    lpAddress: '0x91012f390EC692Bcdd4356bbBD0c021AE6dF62ce',
    token: bscTokens.gitto,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 65,
    lpSymbol: 'ZLT-M01 LP',
    lpAddress: '0x5b7abe34510Ec0D0cdb062CC52a6399d40F81DFA',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 66,
    lpSymbol: 'POOP-BNB LP',
    lpAddress: '0x4e6D297f9Cd3e93D0Ae5BbD8330bBD751996F03c',
    token: bscTokens.poop,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 67,
    lpSymbol: 'LUCK-BNB LP',
    lpAddress: '0x5a19fde41461eb998e74839e8a7527e7dc376850',
    token: bscTokens.luck,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 68,
    lpSymbol: 'HSE-BNB LP',
    lpAddress: '0x0F329A55e665686c1153C7157441BeEb04174679',
    token: bscTokens.hse,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 69,
    lpSymbol: 'TPCV3-BNB LP',
    lpAddress: '0xA8C3FD42A5bAc6418D01f7889B3d4FD01e542cA2',
    token: bscTokens.tpcv3,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 70,
    lpSymbol: 'SPACEAPE-BNB LP',
    lpAddress: '0x8cD571B07df38460DCDEC21a95Cb36127593Ea3B',
    token: bscTokens.spaceape,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 71,
    lpSymbol: 'SFEA-SFE LP',
    lpAddress: '0x33Da61a585b9341F511698637ED0B4cFE61ab47b',
    token: bscTokens.sfea,
    quoteToken: bscTokens.sfe,
  }
  ,
  {
    pid: 72,
    lpSymbol: 'SFE-BNB LP',
    lpAddress: '0xCd6Ee29017F14dBe79f26968874Cf502347450F8',
    token: bscTokens.sfe,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 73,
    lpSymbol: 'GGTKN-BNB LP',
    lpAddress: '0x99C47A3C9895c47ab1a5F18341b8fC1720DD022e',
    token: bscTokens.ggtkn,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 74,
    lpSymbol: 'SBDEX-BNB LP',
    lpAddress: '0x6521d46A2dEA6580095956D697Dc72E480CD26B6',
    token: bscTokens.sbdex,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 75,
    lpSymbol: 'RUG-BNB LP',
    lpAddress: '0x079C06834F9575a2BE909D187084513622ca27F2',
    token: bscTokens.rug,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 76,
    lpSymbol: 'LCSTOKEN-BNB LP',
    lpAddress: '0x40Ec919bc6052C810ef31a8d5737c830114EF288',
    token: bscTokens.lcsc,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 77,
    lpSymbol: 'BORZ-BNB LP',
    lpAddress: '0xA5427dc9E81a8d51Fdb0A8A7CD9AEDa9591a5B43',
    token: bscTokens.borz,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 78,
    lpSymbol: 'DYN-BNB LP',
    lpAddress: '0x58b80D19A2d74aAb63a888a4e0891b696d071074',
    token: bscTokens.dyn,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 79,
    lpSymbol: 'IPL-BNB LP',
    lpAddress: '0xD84A8D737dcD790FB14618501CdDb4fAE0F49778',
    token: bscTokens.ipl,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 80,
    lpSymbol: 'SUSU-BUSD LP',
    lpAddress: '0x0676f0b348C60437Eb530a9d864581ecAecffB7b',
    token: bscTokens.susu,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 81,
    lpSymbol: 'WHEXDAO-BNB LP',
    lpAddress: '0x32e7f908145E96E0dF986E1E662b4d110C78c184',
    token: bscTokens.WHEXDAO,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 82,
    lpSymbol: 'DIGA-BNB LP',
    lpAddress: '0x9C8be4d92021C9669D3a526D51d131bFfbb78203',
    token: bscTokens.diga,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 83,
    lpSymbol: 'SWEEP-BNB LP',
    lpAddress: '0xBc96d691dc546391E115d17aC050a22D651FA401',
    token: bscTokens.sweep,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 84,
    lpSymbol: 'XPHX-BNB LP',
    lpAddress: '0x6F47AEAA25267321CD499d8Da11f54175e392d90',
    token: bscTokens.XPHX,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 85,
    lpSymbol: 'HYPEC-BNB LP',
    lpAddress: '0x410FFBD6f6ff6364416EA5e3bE6CDFbA0558AcD7',
    token: bscTokens.HYPEC,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 86,
    lpSymbol: 'DOGEUM-BNB LP',
    lpAddress: '0x51DE40396691D9FfaF78a9eD13Dd9d1090D97F27',
    token: bscTokens.DOGEUM,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 87,
    lpSymbol: 'HELP-BNB LP',
    lpAddress: '0x84BF506f3b519ef1cc8889D211e56B046896A2c6',
    token: bscTokens.help,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 88,
    lpSymbol: 'ALT-BUSD LP',
    lpAddress: '0x3B743d85aEE0F27aCB5154cdf453cce27acD41A8',
    token: bscTokens.alt,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 89,
    lpSymbol: 'BEP40-BNB LP',
    lpAddress: '0xe2A68B1C1dfA3ab427E1f4E6FA6943944741291d',
    token: bscTokens.BEP40,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 90,
    lpSymbol: 'WHEX-BNB LP',
    lpAddress: '0x3E91c7AB0BeE50881d8805690D020CcC1be101fd',
    token: bscTokens.WHEX,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 91,
    lpSymbol: 'BTCF-BUSD LP',
    lpAddress: '0xC20652C24A23b0aadce0915a72A16202E6EA8D6c',
    token: bscTokens.BTCF,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 92,
    lpSymbol: 'DOWA-BNB LP',
    lpAddress: '0xD0808Ef15d37346E29031ab91F98Df049192eA1b',
    token: bscTokens.DOWA,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 93,
    lpSymbol: 'BEFX-BNB LP',
    lpAddress: '0x0f9793160960f33b402BdDfCB6cd410D361e6624',
    token: bscTokens.befx,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 94,
    lpSymbol: 'MRABBIT-BNB LP',
    lpAddress: '0x36F32642Ab0C815709eE131e239CCC0ee51B7f82',
    token: bscTokens.MRABBIT,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 95,
    lpSymbol: 'FNT-BNB LP',
    lpAddress: '0xbF34cdE9D1225f43cCC5080Db2F80C4bE884ECE5',
    token: bscTokens.FNT,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 96,
    lpSymbol: 'wCHK-BNB LP',
    lpAddress: '0xc1abc7bEc45faadD806647b9B211973e7B4814c3',
    token: bscTokens.wCHK,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 97,
    lpSymbol: 'YKS-BNB LP',
    lpAddress: '0x1cE423C43CA549B94C5277748B033C653d4a54E8',
    token: bscTokens.YKS,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 98,
    lpSymbol: 'BERA-BNB LP',
    lpAddress: '0x66d83c46cEA99B361Df85B3982a374915107b57E',
    token: bscTokens.Bera,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 99,
    lpSymbol: 'REAL-BNB LP',
    lpAddress: '0x2Ab9727C2b0Ed72c01498B3c469964dbaba0EDDE',
    token: bscTokens.REAL,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 100,
    lpSymbol: 'TREE-BNB LP',
    lpAddress: '0x71Fc590900C421bC9B3590BA55056dEa9df19589',
    token: bscTokens.TREE,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 101,
    lpSymbol: 'FLOSHIDO-BNB LP',
    lpAddress: '0x135cCfB6Eb2C1E890F18379C104FC52cf4f0355f',
    token: bscTokens.FLOSHIDO,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 102,
    lpSymbol: 'RFX-BNB LP',
    lpAddress: '0x4a3D4885A82CD48C805b432E16066c1D44e1AC1C',
    token: bscTokens.RFX,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 103,
    lpSymbol: 'MIR-BNB LP',
    lpAddress: '0x796e3846Fe1ac6D839154737Da28110aaA9D419C',
    token: bscTokens.MIR,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 104,
    lpSymbol: 'TFT-BNB LP',
    lpAddress: '0x3ff4C9f2B9eF1938bEfa2Ef7BCa71A2479A08953',
    token: bscTokens.TFT,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 105,
    lpSymbol: 'LMCSWAP-BNB LP',
    lpAddress: '0x5EC62Eac240F3E81A397677017f866E31761264C',
    token: bscTokens.LMCSWAP,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 106,
    lpSymbol: 'BYTC-BNB LP',
    lpAddress: '0xf4eFCE0862E5AF477B31abd773067CC5d4FF4e4C',
    token: bscTokens.bytc,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 107,
    lpSymbol: 'KUSH-BNB LP',
    lpAddress: '0xe18448B931B832928D3cb709Da51DA71FADa5154',
    token: bscTokens.KUSH,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 108,
    lpSymbol: 'SHIBACASH-BNB LP',
    lpAddress: '0x20919173f9600be72Ba3ed09125ec682a8FcBc5E',
    token: bscTokens.SHIBACASH,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 109,
    lpSymbol: 'RMOON-BNB LP',
    lpAddress: '0x8Ea2Aa7e3AF826037EFa1E8F5c2AeDf6657cA83B',
    token: bscTokens.RMOON,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 110,
    lpSymbol: 'KAREN-BNB LP',
    lpAddress: '0x42A3c9FEd9fdD0737B9368a9f551f4aDd28f656c',
    token: bscTokens.KAREN,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 111,
    lpSymbol: 'FRTC-BNB LP',
    lpAddress: '0xa952FCc2cf6d82a78Fa1469aD7440C9c81b9587E',
    token: bscTokens.FRTC,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 112,
    lpSymbol: 'EBTC-BNB LP',
    lpAddress: '0x109fbFA9Dc5E4a81Bf68950C3ceda4eF00bE354A',
    token: bscTokens.EBTC,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 113,
    lpSymbol: 'PHDAO-BNB LP',
    lpAddress: '0x7bD82E397BCCB39827C675B1ef0878CAfb7AD061',
    token: bscTokens.PHDAO,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 114,
    lpSymbol: 'UFCB-BNB LP',
    lpAddress: '0xfFd276124d09d515f0e3948f1f6016D76ce43864',
    token: bscTokens.UFCB,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 115,
    lpSymbol: 'UFCB-BNB LP',
    lpAddress: '0xA5261287b07C1CE9884a20DE3548D1bC92b5a1a2',
    token: bscTokens.UFCB,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 116,
    lpSymbol: 'NERVE-BNB LP',
    lpAddress: '0x326Af65F7b5879d9E1c987B3792d7B54f01B5853',
    token: bscTokens.NERVE,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 117,
    lpSymbol: 'CDIG-BNB LP',
    lpAddress: '0xa8C3c4CD17B965593CAD379ddBCfe9c0F62C98d4',
    token: bscTokens.CDIG,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 118,
    lpSymbol: 'Dsun-BNB LP',
    lpAddress: '0x2b2B1cb7CEf2D72FC77bB8405D32e5Cd75f5d74A',
    token: bscTokens.Dsun,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 119,
    lpSymbol: 'LUCK-MARCO LP',
    lpAddress: '0x119446446103a23a70Cf56b65B235cEaA0e0f0e4',
    token: bscTokens.luck,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 120,
    lpSymbol: 'SLR-BUSD LP',
    lpAddress: '0xA304275faFE95C8f8aa37489508BB507BEEB71A1',
    token: bscTokens.SLR,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 121,
    lpSymbol: 'LIRA-USDC LP',
    lpAddress: '0x98927FaD5ae7076ddF0CD226Ca6c5EE06995784b',
    token: bscTokens.usdc,
    quoteToken: bscTokens.lira,
  }
  ,
  {
    pid: 122,
    lpSymbol: 'LIRA-USDT LP',
    lpAddress: '0xA4F9cf19918aFC754F552E18e32EBBFFD5149678',
    token: bscTokens.usdt,
    quoteToken: bscTokens.lira,
  }
  ,
  {
    pid: 123,
    lpSymbol: 'BNBTiger-BNB LP',
    lpAddress: '0x7009b56DD817Df3Ca370Db3b39AE444621aA2f97',
    token: bscTokens.BNBTiger,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 124,
    lpSymbol: 'SVR-BNB LP',
    lpAddress: '0xed6970128aB8636050c997403C17682948C4AcF5',
    token: bscTokens.SVR,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 125,
    lpSymbol: 'PepeBNB-BNB LP',
    lpAddress: '0xb3B032e537c98dbD8cD0ba9ba76ECDf4B57761B9',
    token: bscTokens.PepeBNB,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 126,
    lpSymbol: 'IFRIT-BNB LP',
    lpAddress: '0xf02B06B11A327aAA169c2d4D6b983Bcfac49D8a7',
    token: bscTokens.IFRIT,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 127,
    lpSymbol: 'BACD2-BNB LP',
    lpAddress: '0x8D67E0c10Dd73c464d8649A1833a4Ba63BADb7db',
    token: bscTokens.BACD2,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 128,
    lpSymbol: 'SHAUN-BNB LP',
    lpAddress: '0x4921eAD48f6943161EB35319E128886ca3886296',
    token: bscTokens.SHAUN,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 129,
    lpSymbol: 'PEPA-BNB LP',
    lpAddress: '0xC360B51f605E0D15F1F963114F8F84bBeb4C178f',
    token: bscTokens.PEPA,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 130,
    lpSymbol: 'BIBI-BNB LP',
    lpAddress: '0x050e0dD04Ecc1E3010ce37ED52980560152feA46',
    
    token: bscTokens.BIBI,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 131,
    lpSymbol: 'MEME-BNB LP',
    lpAddress: '0x0e922779ADabB1dBA7d25353a9e17f3E14431a0b',
    token: bscTokens.MEME,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 132,
    lpSymbol: 'XCEO-BNB LP',
    lpAddress: '0x82218849Ec2dD3d59aeCa6b21825B08D3Fc65583',
    token: bscTokens.XCEO,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 133,
    lpSymbol: '4RZ-BNB LP',
    lpAddress: '0xa15d85F1026aE7d96a29955eb77dF18cA7c2bad2',
    token: bscTokens.RZ4,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 134,
    lpSymbol: 'MongBNB-BNB LP',
    lpAddress: '0xb245bee375A3c7fC9447546C5CD2f83307f33904',
    token: bscTokens.MongBNB,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 135,
    lpSymbol: 'BART-BNB LP',
    lpAddress: '0x6E98c020dB9E6B7112c91b9924D155329E3a5dBE',
    token: bscTokens.BART,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 136,
    lpSymbol: 'EYED-BNB LP',
    lpAddress: '0x0Ca5da766a0D95a5B16aBFB974071C29391d1581',
    token: bscTokens.EYED,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 137,
    lpSymbol: 'PORN-BNB LP',
    lpAddress: '0xd331a967575eeFef128CFF76291F48A5B1dFc9d4',
    token: bscTokens.PORN,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 138,
    lpSymbol: 'SUP-BNB LP',
    lpAddress: '0x0b42685A93B478621E4cA8D6292cff89d65C19F2',
    token: bscTokens.SUP,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 139,
    lpSymbol: 'EDENX-BNB LP',
    lpAddress: '0xd86B843EA186670e29b4Cd82d8A6FEf6FF841292',
    token: bscTokens.EDENX,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 140,
    lpSymbol: 'PRP-BNB LP',
    lpAddress: '0xA7CB0D404179d842866e25F262865390299365A6',
    token: bscTokens.PRP,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 141,
    lpSymbol: 'HUGO-BNB LP',
    lpAddress: '0xeF8e4491d077D5C5d5cAD5AFFF3BC0E4aA0C24B5',
    token: bscTokens.HUGO,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 142,
    lpSymbol: 'GOGU-BNB LP',
    lpAddress: '0x615B243FEc2EB51F53545A30433C98D2A3E79a79',
    token: bscTokens.GOGU,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 143,
    lpSymbol: 'POP-BNB LP',
    lpAddress: '0x57Cf74A5c7dA36501db634ba2A2E312FaCa1CfAE',
    token: bscTokens.POP,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 144,
    lpSymbol: 'POP-MARCO LP',
    lpAddress: '0x8D53D34FB9CbE7E1C34e9B70537788699d683752',
    token: bscTokens.POP,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 145,
    lpSymbol: 'SUP-MARCO LP',
    lpAddress: '0xe1ac7B27398a538C20cc7e0930b4A46AAa45Aabe',
    token: bscTokens.SUP,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 146,
    lpSymbol: 'EYED-MARCO LP',
    lpAddress: '0x90cE2b7f74DbE3F3854B80faD4d433005cf32CBC',
    token: bscTokens.EYED,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 147,
    lpSymbol: 'MM72-MARCO LP',
    lpAddress: '0x01dB17c476ad6a4c119f559eAb2d1AC9e340278E',
    token: bscTokens.mm72,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 148,
    lpSymbol: 'BNB-JABA LP',
    lpAddress: '0xA29e5048D038A988308a6371e85ce574Ea5c43D6',
    token: bscTokens.jaba,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 149,
    lpSymbol: 'BNB-LSPHERE LP',
    lpAddress: '0x9A6b07058A61a05027196ECC0738974c4C224C5d',
    token: bscTokens.lsphere,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 151,
    lpSymbol: 'BNB-CUBY LP',
    lpAddress: '0x8e91C97fd7fECFD935E6916b1D94EfD6b47c088d',
    token: bscTokens.cuby,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 152,
    lpSymbol: 'GGTKN-MARCO LP',
    lpAddress: '0x7689b49917887fB87e6125F47e1ee211773c3092',
    token: bscTokens.ggtkn,
    quoteToken: bscTokens.cake,
  }
   ,
  {
    pid: 153,
    lpSymbol: 'BNB-ROCKET LP',
    lpAddress: '0xf0EC128136390a19471149b38A83168ba517Dce7',
    token: bscTokens.rocket,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 154,
    lpSymbol: 'BNB-SKID LP',
    lpAddress: '0xeC2727785f499632c75dEfB3Adb5C08D19a19732',
    token: bscTokens.skid,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 155,
    lpSymbol: 'BNB-AXPE LP',
    lpAddress: '0xF65fc0F8B6a7Ec6Fc20841FE626baB77A278B17c',
    token: bscTokens.axpe,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 156,
    lpSymbol: 'BNB-FLY LP',
    lpAddress: '0xa1EB0d2aa6Aaea1dfD6A0A39e11F8B22f3723A91',
    token: bscTokens.fly,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 157,
    lpSymbol: 'BNB-VBR LP',
    lpAddress: '0x1963d9942B3Cf54Fed6065Da7BE0df73c8ac97ba',
    token: bscTokens.vibra,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 158,
    lpSymbol: 'BNB-BOAI LP',
    lpAddress: '0xaE8A129bEe1430b4C10F1a4471f8Aaf69ED40e3E',
    token: bscTokens.boai,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 159,
    lpSymbol: 'BNB-AARON LP',
    lpAddress: '0x14b3DE51be085Be1feE1bb924b3AC32F1d7E64c1',
    token: bscTokens.aaron,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 160,
    lpSymbol: 'MARCO-AARON LP',
    lpAddress: '0xc6f6F0A9525d43D68Ab3FC27a731c01b10F320FA',
    token: bscTokens.aaron,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 161,
    lpSymbol: 'BNB-PCO LP',
    lpAddress: '0xb4DC801634c6191947a43F76e9fb426D20ef9FF1',
    token: bscTokens.pco,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 162,
    lpSymbol: 'MARCO-VBR LP',
    lpAddress: '0x79492fabF7378b9Be41c6162Ea4a7C43578b0723',
    token: bscTokens.vibra,
    quoteToken: bscTokens.cake,
  }
   ,
  {
    pid: 163,
    lpSymbol: 'MARCO-2GCC LP',
    lpAddress: '0x68daD1b10fbED92EDec1Afd9c5ffD7f6D78f7065',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 164,
    lpSymbol: 'MARCO-M01 LP',
    lpAddress: '0xF04c6Ce1E2d50911dC6858f7e75b0dB4E054905e',
    token: bscTokens.m01,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 166,
    lpSymbol: '2GCC-M01 LP',
    lpAddress: '0x72a4BA75F297dfb1c863D6D2251e76948C9FaB60',
    token: bscTokens.m01,
    quoteToken: bscTokens.gcc2,
  }
  ,
  {
    pid: 167,
    lpSymbol: '2GCC-ZLT LP',
    lpAddress: '0x06d41D06F1b3b12819D2892866390a8BF1839bab',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.gcc2,
  }
  ,
  {
    pid: 168,
    lpSymbol: 'BNB-MONG2.0 LP',
    lpAddress: '0x0505D5780dF245B7a7aAf44d301d55886f349bae',
    token: bscTokens.mong2,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 169,
    lpSymbol: 'BNB-TEENY LP',
    lpAddress: '0x6b92Ebc8eFe261fA595E96d8fBE606f90f10C9dd',
    token: bscTokens.teeny,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 170,
    lpSymbol: 'BNB-Chame LP',
    lpAddress: '0xd3c32958b9A3074CDEF6365440c0ff871248C5C3',
    token: bscTokens.chame,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 171,
    lpSymbol: 'BNB-PTC LP',
    lpAddress: '0x8091dAb42b8579322006b3C4e01743FE8319403B',
    token: bscTokens.ptc,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 172,
    lpSymbol: 'XRP-PTC LP',
    lpAddress: '0x0a8789dfEB9948CBa455cFaeC2C26a41357B6BCf',
    token: bscTokens.ptc,
    quoteToken: bscTokens.xrp,
  }
  ,
  {
    pid: 173,
    lpSymbol: 'BNB-BODE LP',
    lpAddress: '0x2602e99D3835Eadc755F904c98737B7a9c7E3BAE',
    token: bscTokens.bode,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 174,
    lpSymbol: 'BNB-WDT LP',
    lpAddress: '0xDAa8484f7189DBfBeaD170344a09818D886398f0',
    token: bscTokens.wdt,
    quoteToken: bscTokens.wbnb,
  }
     ,
  {
    pid: 175,
    lpSymbol: 'BNB-YATINU LP',
    lpAddress: '0xf581012014423C332190E4777b3dEa5cFA3b34CB',
    token: bscTokens.yatinu,
    quoteToken: bscTokens.wbnb,
  }
     ,
  {
    pid: 176,
    lpSymbol: 'VBR-MXMX LP',
    lpAddress: '0xc55DB48802FFF7a81188E943C16EF576dfC8ef1d',
    token: bscTokens.mxmx,
    quoteToken: bscTokens.vibra,
  }
  ,
  {
    pid: 177,
    lpSymbol: 'VBR-M01 LP',
    lpAddress: '0x5C5D3410a6d9103c11c9b3e8A064e3e99DD81510',
    token: bscTokens.m01,
    quoteToken: bscTokens.vibra,
  }
  ,
  {
    pid: 178,
    lpSymbol: 'VBR-2GCC LP',
    lpAddress: '0xB86e833838e27808c2aD0a49647818823863AB8F',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.vibra,
  }
   ,
  {
    pid: 179,
    lpSymbol: 'BEAR-2GCC LP',
    lpAddress: '0x4663212073549FD674bd588494eB06e906692fF4',
    token: bscTokens.gcc2,
    quoteToken: bscTokens.bear,
  }
  ,
  {
    pid: 180,
    lpSymbol: 'BEAR-M01 LP',
    lpAddress: '0x737b674106Ce29a4604116e103eb9B6F2A289c64',
    token: bscTokens.m01,
    quoteToken: bscTokens.bear,
  }
   ,
  {
    pid: 181,
    lpSymbol: 'BEAR-ZLT LP',
    lpAddress: '0xa2d78F3f9DF50adAa6F42FD9269a06a328eF94D4',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.bear,
  }
     ,
  {
    pid: 182,
    lpSymbol: 'BNB-RAKY LP',
    lpAddress: '0xFFaFe2103d627a056d3177E7158cb487F3A59659',
    token: bscTokens.raky,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 183,
    lpSymbol: 'MARCO-RAKY LP',
    lpAddress: '0xF62A5c4A5eb810493261D14A971403D78403c5Ee',
    token: bscTokens.raky,
    quoteToken: bscTokens.cake,
  }
    ,
  {
    pid: 184,
    lpSymbol: 'MXMX-RAKY LP',
    lpAddress: '0x6E7f53053B927cB6A04D91Eaa9F74F5E4605f410',
    token: bscTokens.raky,
    quoteToken: bscTokens.mxmx,
  }
   ,
  {
    pid: 185,
    lpSymbol: 'BNB-MOB LP',
    lpAddress: '0x06B78813445592254B0dCaa7d520256b49809420',
    token: bscTokens.mob,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 186,
    lpSymbol: 'BNB-YD LP',
    lpAddress: '0x93CA9862f9fea7636B7A143E54c6CD64D9585aEf',
    token: bscTokens.yd,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 187,
    lpSymbol: 'MARCO-YD LP',
    lpAddress: '0xede506eE698acD55fB522c57772C9Db5f98cCFA2',
    token: bscTokens.yd,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 188,
    lpSymbol: 'MXMX-YD LP',
    lpAddress: '0x8E256EC5c3cDb1093017E4E56423EF634cA99582',
    token: bscTokens.yd,
    quoteToken: bscTokens.mxmx,
  }
  ,
  {
    pid: 189,
    lpSymbol: '2GCC-YD LP',
    lpAddress: '0xAcbE58b04f976d24A0239c8D00731aae06952122',
    token: bscTokens.yd,
    quoteToken: bscTokens.gcc2,
  }
   ,
  {
    pid: 190,
    lpSymbol: 'BNB-COCK LP',
    lpAddress: '0xABC12b4c866eff775EAb4E277127722086B87312',
    token: bscTokens.cock,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 191,
    lpSymbol: 'BNB-ALTER LP',
    lpAddress: '0xe33f4665AD51308365268ED4fD48B6F5A38b6CD1',
    token: bscTokens.alter,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 192,
    lpSymbol: 'BNB-TRT LP',
    lpAddress: '0x389D2396F00880A609acebe3dC83a0ca86945F58',
    token: bscTokens.trt,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 193,
    lpSymbol: 'BNB-APEX LP',
    lpAddress: '0xD12332B5480B5d73496795e527980a4cD57b858a',
    token: bscTokens.apemax,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 194,
    lpSymbol: 'BNB-RDRS LP',
    lpAddress: '0x91e6158B2F82A6C359B3F0d613E991D0457C41e8',
    token: bscTokens.rdrs,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 195,
    lpSymbol: 'MARCO-TRT LP',
    lpAddress: '0xdB5aEaFE874b0c1BDbAa1dfF1e7FC00479350d2E',
    token: bscTokens.trt,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 196,
    lpSymbol: 'BNB-PEPECB LP',
    lpAddress: '0x3a09926cD17F89ecD3523928054A238cb42450af',
    token: bscTokens.pepecb,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 197,
    lpSymbol: 'BNB-AGAPE LP',
    lpAddress: '0xa827E2CfcA2C39c8e658AA18b816B974dB260C1F',
    token: bscTokens.agape,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 198,
    lpSymbol: 'BNB-CAT LP',
    lpAddress: '0x819D850f4fE952421C28b2E4130D2650E0545dB2',
    token: bscTokens.cat,
    quoteToken: bscTokens.wbnb,
  }
     ,
  {
    pid: 199,
    lpSymbol: 'BNB-ICN LP',
    lpAddress: '0xEB6c840501644561Ec0c4CF6513679545431a1F6',
    token: bscTokens.icn,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 200,
    lpSymbol: 'BNB-DOCSWAP LP',
    lpAddress: '0xF534718314f6B5ae833937B09a7a8EC03b1f7679',
    token: bscTokens.docswap,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 201,
    lpSymbol: 'BNB-SAFO LP',
    lpAddress: '0x191F29C2B4Cc69BFd73901be6D8F03BD1a26a47b',
    token: bscTokens.safo,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 202,
    lpSymbol: 'BNB-AGAPE LP',
    lpAddress: '0xF99df4e57f84a725326e27f959A2b3D0Cf898051',
    token: bscTokens.agapeai,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 203,
    lpSymbol: 'BNB-M420 LP',
    lpAddress: '0x8De677Fab90331A930Bad1c1EBBE391dDeE1D4b0',
    token: bscTokens.m420,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 204,
    lpSymbol: 'BNB-CLAN LP',
    lpAddress: '0xE71A687231864696557EB97Dc15E077d11d52760',
    token: bscTokens.clan,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 205,
    lpSymbol: 'BNB-SHIFO LP',
    lpAddress: '0xeE2f261508968e1F78197a28EadC80f9Cd5FFcd2',
    token: bscTokens.shifo,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 206,
    lpSymbol: 'BNB-MX LP',
    lpAddress: '0x2F785D9178b7a176d602b87fd32965ffeA8b4EC7',
    token: bscTokens.mix2,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 207,
    lpSymbol: 'BNB-chc LP',
    lpAddress: '0x2A7a7763B8E2a51570a983184067e69DAc7F4dFF',
    token: bscTokens.chc,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 208,
    lpSymbol: 'BNB-RARI LP',
    lpAddress: '0x54067c068cD297EB5D1a49A7Ae90BD69d3642930',
    token: bscTokens.rari,
    quoteToken: bscTokens.wbnb,
  }
     ,
  {
    pid: 209,
    lpSymbol: 'BNB-CRYSTAL STONES LP',
    lpAddress: '0x90329a5De3A4dA3FfB47f055863eEA235b1220Df',
    token: bscTokens.crystals,
    quoteToken: bscTokens.wbnb,
  }
       ,
  {
    pid: 210,
    lpSymbol: 'MARCO-RARI LP',
    lpAddress: '0x7151d3368E04846b74810286A07546C18F925402',
    token: bscTokens.rari,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 211,
    lpSymbol: '2GCC-RARI LP',
    lpAddress: '0xDC721f2960E3e02CFe992E84E5dB91c753606bDf',
    token: bscTokens.rari,
    quoteToken: bscTokens.gcc2,
  }
  ,
  {
    pid: 212,
    lpSymbol: 'YD-RARI LP',
    lpAddress: '0x9394184e315116609c0b695426AEe55FA13EE806',
    token: bscTokens.rari,
    quoteToken: bscTokens.yd,
  }
  ,
  {
    pid: 213,
    lpSymbol: 'RAKY-RARI LP',
    lpAddress: '0x4fc9e4Ef689DaA58d995583B3eF1CE4eD0DDc0C4',
    token: bscTokens.rari,
    quoteToken: bscTokens.raky,
  }
   ,
  {
    pid: 214,
    lpSymbol: 'AARON-RARI LP',
    lpAddress: '0xe9A5F443985411B3b1272E5b82eba26F143bb475',
    token: bscTokens.rari,
    quoteToken: bscTokens.aaron,
  }
   ,
  {
    pid: 215,
    lpSymbol: 'EYED-RARI LP',
    lpAddress: '0xb2AFe2D0Bf0643Df05460843b5690E500dc47837',
    token: bscTokens.rari,
    quoteToken: bscTokens.EYED,
  }
   ,
  {
    pid: 216,
    lpSymbol: 'BUSD-chc LP',
    lpAddress: '0xfBF01243e6601E2bb125cD5dd86Fd07de33733a3',
    token: bscTokens.chc,
    quoteToken: bscTokens.busd,
  }
  ,
  {
    pid: 217,
    lpSymbol: 'BNB-DRAI LP',
    lpAddress: '0x56A2679C4Ad7d4BB2c35aC7C44987Eb466915667',
    token: bscTokens.drai,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 218,
    lpSymbol: 'USDT-ALT LP',
    lpAddress: '0x53782EbbA7372abFA2317024De1047823d9A6715',
    token: bscTokens.usdt,
    quoteToken: bscTokens.alt,
  }
   ,
  {
    pid: 219,
    lpSymbol: 'M01-RARI LP',
    lpAddress: '0x6Ae03646a058EFb5f70f263bBE61EFFe12a9a522',
    token: bscTokens.rari,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 220,
    lpSymbol: 'M01-YD LP',
    lpAddress: '0x49312412A36098031510a51562B1Fee61B44800c',
    token: bscTokens.yd,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 221,
    lpSymbol: 'M01-POP LP',
    lpAddress: '0x93c9F5840A0DD27045Cae6417fCDff44FE3c2a66',
    token: bscTokens.POP,
    quoteToken: bscTokens.m01,
  }
  ,
  {
    pid: 222,
    lpSymbol: 'M01-EYED LP',
    lpAddress: '0x8AdCD965d4a4c929979AA204C787A5f27ab58097',
    token: bscTokens.EYED,
    quoteToken: bscTokens.m01,
  }
   ,
  {
    pid: 223,
    lpSymbol: 'PSPAY-USDT LP',
    lpAddress: '0xAe2f0EF36A1B4B35021499B51aB2b43fb8b209d3',
    token: bscTokens.usdt,
    quoteToken: bscTokens.pspay,
  }
  ,
  {
    pid: 224,
    lpSymbol: 'BNB-PSPAY LP',
    lpAddress: '0xF44E7658EC7A76442f3509D19a86B64273EEd516',
    token: bscTokens.pspay,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 225,
    lpSymbol: 'BNB-CLOWNS LP',
    lpAddress: '0x44B4c8CCbF43B42e7C61A6e317b5DE66f31b2E56',
    token: bscTokens.clowns,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 226,
    lpSymbol: 'BNB-HADA LP',
    lpAddress: '0xba431279Cce9bF8A23f53389b7437312ecdEF1FC',
    token: bscTokens.hada,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 227,
    lpSymbol: 'BNB-CBNB LP',
    lpAddress: '0xE13945b4FeB4Bd8d88824e99c9cC445A09FaF737',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 228,
    lpSymbol: 'MARCO-CBNB LP',
    lpAddress: '0x07F05b4920D4d71535a8513ebD9b6dB93Af8F16E',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.cake,
  }
    ,
  {
    pid: 229,
    lpSymbol: '2GCC-CBNB LP',
    lpAddress: '0x368D0E621eaE27daFC5Cfef671628F57EB9a0db3',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.gcc2,
  }
    ,
  {
    pid: 230,
    lpSymbol: 'VBR-CBNB LP',
    lpAddress: '0xE1265B313bac5f23A1282F8F47A65F40994f882E',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.vibra,
  }
  ,
  {
    pid: 231,
    lpSymbol: 'ZLT-CBNB LP',
    lpAddress: '0x7F499850650c82B845A75C2f45DFdCcB47A4F6C8',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.zoloto,
  }
   ,
  {
    pid: 232,
    lpSymbol: 'LUCK-CBNB LP',
    lpAddress: '0x872cd1745b30dDE8d48DC74881ED3941E7dbD11f',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.luck,
  }
    ,
  {
    pid: 233,
    lpSymbol: 'BNB-GECK LP',
    lpAddress: '0x887511653AAe22AE8B691Eaead7aeC064B7C62A9',
    token: bscTokens.geck,
    quoteToken: bscTokens.wbnb,
  }
     ,
  {
    pid: 234,
    lpSymbol: 'BNB-NGD LP',
    lpAddress: '0xAba36eA0a9A49B612e6ab40e359b3B1A0bca2280',
    token: bscTokens.ngd,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 235,
    lpSymbol: 'BNB-CMC LP',
    lpAddress: '0xDD429C5ADd745169122D1b9Ce78439A9C4E5eCd6',
    token: bscTokens.cmc,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 236,
    lpSymbol: 'BNB-WFX LP',
    lpAddress: '0x1E197b2B29185b776a5eeE5899585f9fCf9B0780',
    token: bscTokens.wfx,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 237,
    lpSymbol: 'BNB-VOC LP',
    lpAddress: '0x41170cf829502FcFcD81E4159a0ec2ac127Be315',
    token: bscTokens.voc,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 238,
    lpSymbol: 'BNB-CAVEA LP',
    lpAddress: '0xAdd77e7ef791dB42fF7C251cE91247E90b981860',
    token: bscTokens.cavea,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 239,
    lpSymbol: 'MARCO-CAVEA LP',
    lpAddress: '0x685257D081D8477C2F82d550D389F6407A8f299C',
    token: bscTokens.cavea,
    quoteToken: bscTokens.cake,
  }
   ,
  {
    pid: 240,
    lpSymbol: 'BNB-XRPGROW LP',
    lpAddress: '0x7C143B03A618F2b3e815d35D5EA81B75958d7788',
    token: bscTokens.xrpgrow,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 241,
    lpSymbol: 'RARI-CBNB LP',
    lpAddress: '0xD117b631525595c54E97Cd41bF6C3E49a7a8465A',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.rari,
  }
   ,
  {
    pid: 242,
    lpSymbol: 'YD-CBNB LP',
    lpAddress: '0x76215405bbD3Fa981629f112229bD9c7f77c6e29',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.yd,
  }
  ,
  {
    pid: 243,
    lpSymbol: 'CAVEA-CBNB LP',
    lpAddress: '0x54c8ebE5e68Dc2A031e2AaDA58dFf0886Fc5602c',
    token: bscTokens.cbnb,
    quoteToken: bscTokens.cavea,
  }
  ,
  {
    pid: 244,
    lpSymbol: 'BNB-rickinu LP',
    lpAddress: '0xB42ae12eA1E9b147CAd10431a3AcC7681b24779a',
    token: bscTokens.rickinu,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 245,
    lpSymbol: 'BNB-CPEPE LP',
    lpAddress: '0x34b34ea0C32eC0bA4B13962EbD774C7a1FEB03C2',
    token: bscTokens.cpepe,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 246,
    lpSymbol: 'BNB-ESSO LP',
    lpAddress: '0x3271bbE432559412472492DbA66D2bc4f48A8e5b',
    token: bscTokens.esso,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 247,
    lpSymbol: 'CBNB-ESSO LP',
    lpAddress: '0x8880a9be8b152C80fFB7E372c701EC4EA6AD5507',
    token: bscTokens.esso,
    quoteToken: bscTokens.cbnb,
  }
   ,
  {
    pid: 248,
    lpSymbol: '2GCC-ESSO LP',
    lpAddress: '0xB36dD313486379B1DeBa55b8Df985C92FBd842D2',
    token: bscTokens.esso,
    quoteToken: bscTokens.gcc2,
  }
  ,
  {
    pid: 249,
    lpSymbol: 'MARCO-ESSO LP',
    lpAddress: '0x71E071e5dD20222BC530A827a411199E3BC8649F',
    token: bscTokens.esso,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 250,
    lpSymbol: 'ZLT-ESSO LP',
    lpAddress: '0x5eD9fa9aDde28b987D76083E630B88Add42de699',
    token: bscTokens.esso,
    quoteToken: bscTokens.zoloto,
  }
  ,
  {
    pid: 251,
    lpSymbol: 'BNB-CUSDT LP',
    lpAddress: '0x8D499Dd632Dc17dCB1460Cc80AB4CC9B2b47c0f3',
    token: bscTokens.cusdt,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 252,
    lpSymbol: 'CBNB-CUSDT LP',
    lpAddress: '0xab661bBcf1196E6aF311Fd1FC30572BcEd31907B',
    token: bscTokens.cusdt,
    quoteToken: bscTokens.cbnb,
  }
   ,
  {
    pid: 253,
    lpSymbol: '2GCC-CUSDT LP',
    lpAddress: '0xB68E1d3d544e46a67f53261a2ebfD7E7447C9836',
    token: bscTokens.cusdt,
    quoteToken: bscTokens.gcc2,
  }
    ,
  {
    pid: 254,
    lpSymbol: 'BNB-CXRP LP',
    lpAddress: '0xd9379cD8E18EbE165A80B539bB0b2EF92F648E14',
    token: bscTokens.cxrp,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 255,
    lpSymbol: 'CUSDT-CXRP LP',
    lpAddress: '0x8f2a185c19093eaaCd8F1110472e155375532510',
    token: bscTokens.cxrp,
    quoteToken: bscTokens.cusdt,
  }
   ,
  {
    pid: 256,
    lpSymbol: 'CBNB-CXRP LP',
    lpAddress: '0xc4F34B446d3212910ff2aa0C25106dD497ebfeF3',
    token: bscTokens.cxrp,
    quoteToken: bscTokens.cbnb,
  }
   ,
  {
    pid: 257,
    lpSymbol: 'VBR-ZLT LP',
    lpAddress: '0x5b1405A8157285aB1f5912A05B5Fc8023a666346',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.vibra,
  }
   ,
  {
    pid: 258,
    lpSymbol: 'CUSDT-YD LP',
    lpAddress: '0xDCbE3E20afB1fBA62972EC5875e59616DaFc04d9',
    token: bscTokens.yd,
    quoteToken: bscTokens.cusdt,
  }
  ,
  {
    pid: 259,
    lpSymbol: 'BNB-BULX LP',
    lpAddress: '0xD33a0C69394C00770fb810a1155A1F38EcACBc20',
    token: bscTokens.bulx,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 260,
    lpSymbol: 'BNB-BUSD LP',
    lpAddress: '0xA9B056a74400F8Fc892fB714f6973763806A5127',
    token: bscTokens.busdx,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 261,
    lpSymbol: 'BUSD-BULX LP',
    lpAddress: '0x5Bb69B61b9c005a0dcA67A9A0AE1b6e6EE71A1B9',
    token: bscTokens.bulx,
    quoteToken: bscTokens.busdx,
  }
    ,
  {
    pid: 262,
    lpSymbol: 'BNB-PIPI LP',
    lpAddress: '0x8AeD8e89F54942b3C4165197Bf06229C7FE8F219',
    token: bscTokens.pipi,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 263,
    lpSymbol: 'BNB-BGCAT LP',
    lpAddress: '0xD4A736028D94233C380fc377d56966F57348A4e0',
    token: bscTokens.bgcat,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 264,
    lpSymbol: 'BNB-TOTO LP',
    lpAddress: '0xDDe5A48aEf42c81AdB544868979D390F2e60C5f3',
    token: bscTokens.toto,
    quoteToken: bscTokens.wbnb,
  }
    ,
  {
    pid: 265,
    lpSymbol: 'CUSDT-ZLT LP',
    lpAddress: '0xE69b45A33419a5456Ea8dB9533224d0fc98fAAe3',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.cusdt,
  }
    ,
  {
    pid: 266,
    lpSymbol: 'CXRP-ZLT LP',
    lpAddress: '0x1Db96E2C7D7b286048983089392977B6B52a507a',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.cxrp,
  }
    ,
  {
    pid: 267,
    lpSymbol: '2GCC-CXRP LP',
    lpAddress: '0xCA2ADb98258a89f3D47338300D55640C170ba987',
    token: bscTokens.cxrp,
    quoteToken: bscTokens.gcc2,
  }
    ,
  {
    pid: 268,
    lpSymbol: 'MARCO-CUSDT LP',
    lpAddress: '0x7B98603A5e64fB529ccbeeFE04FA9c7D09550b57',
    token: bscTokens.cusdt,
    quoteToken: bscTokens.cake,
  }
    ,
  {
    pid: 269,
    lpSymbol: 'MARCO-ZLT LP',
    lpAddress: '0x2261F5434dd3e352563B09C9E462956082606f5a',
    token: bscTokens.zoloto,
    quoteToken: bscTokens.cake,
  }
    ,
  {
    pid: 270,
    lpSymbol: 'MARCO-CXRP LP',
    lpAddress: '0xce023980F5F205B77E6F01e2E78f84D5460318Dc',
    token: bscTokens.cxrp,
    quoteToken: bscTokens.cake,
  }
      ,
  {
    pid: 271,
    lpSymbol: 'BNB-PEPEBURN LP',
    lpAddress: '0xBaB19D8A69Ca5b4A442205B475C10CF7b9bB317B',
    token: bscTokens.pepeburnv2,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 272,
    lpSymbol: 'BNB-$CHONKY LP',
    lpAddress: '0xe4B3B4f73B950c0779b56a64B24DfCD8c1275738',
    token: bscTokens.chonky,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 273,
    lpSymbol: 'BNB-BKP LP',
    lpAddress: '0xB500028dE9cfE3b8D7B238d3ea4fbe36e3b27CB7',
    token: bscTokens.bkp,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 274,
    lpSymbol: 'MARCO-chc LP',
    lpAddress: '0xBeF081c5e47AFf93350A85B36818268774Ef3341',
    token: bscTokens.chc,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 275,
    lpSymbol: 'BNB-DXR LP',
    lpAddress: '0xe4C685cE1d17B79B7ca1EEaCB1e5335bF6Dcd5f6',
    token: bscTokens.dxr,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 276,
    lpSymbol: 'BNB-DBU LP',
    lpAddress: '0xFb0addC13cbdfCabB6F9e7e2fC1a3eA5917f4fa6',
    token: bscTokens.dbu,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 277,
    lpSymbol: 'MARCO-PEPEBURN LP',
    lpAddress: '0x5ceC1fa67c791fE5Df396816BbC9f6029eAdA060',
    token: bscTokens.pepeburnv2,
    quoteToken: bscTokens.cake,
  }
  ,
  {
    pid: 278,
    lpSymbol: 'BNB-LONE LP',
    lpAddress: '0xcF17b134b3f83eb02DF1223E2f5E4de6859c701a',
    token: bscTokens.lone,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 279,
    lpSymbol: 'BNB-SlaFac LP',
    lpAddress: '0x1473D65F95C13c0d0bd2dD576EAF60CEf96dE945',
    token: bscTokens.slafac,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 280,
    lpSymbol: 'BNB-OTL LP',
    lpAddress: '0x8c9f3b747664B17b85114CBdA080DFBfa5b5aa36',
    token: bscTokens.otl,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 281,
    lpSymbol: 'BNB-GXM LP',
    lpAddress: '0x205e7e472B2e34F7c627cd5d2EF229e6C9f439B2',
    token: bscTokens.gxm,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 282,
    lpSymbol: 'BNB-7NODES LP',
    lpAddress: '0xA5871AC864A8521D867FE4720e5E528eC2dc458f',
    token: bscTokens.nodes7,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 283,
    lpSymbol: 'BNB-HAAGA420 LP',
    lpAddress: '0x846bc386De1f0768cc5333eB4d6F8f063f69157A',
    token: bscTokens.haaga420,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 284,
    lpSymbol: 'BNB-EFCR LP',
    lpAddress: '0x82b2B5dBC64613a26553f2c8de86B2b5Da2e3B39',
    token: bscTokens.efcr,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 285,
    lpSymbol: 'BNB-TAH LP',
    lpAddress: '0x6a7580BDCF2E6e1073170007E6b3c73e20f28aDa',
    token: bscTokens.tah,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 286,
    lpSymbol: 'BNB-BBUCK LP',
    lpAddress: '0x30aDcA9D282A1F98AA92f7FD50E2e5eCEAEE0281',
    token: bscTokens.bbuck,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 287,
    lpSymbol: 'BNB-GrokLabs LP',
    lpAddress: '0x6575d67C22245ac5Ded37141A9D846304bc9B324',
    token: bscTokens.groklabs,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 288,
    lpSymbol: 'BNB-WZM LP',
    lpAddress: '0x4e1A315Bd0DAF7D26Cb2b510Dd360a6F87134298',
    token: bscTokens.wzm,
    quoteToken: bscTokens.wbnb,
  }
   ,
  {
    pid: 289,
    lpSymbol: 'BNB-MEMEMINT LP',
    lpAddress: '0x7629290019628cF64b6037cBF0C123660B1ab7aA',
    token: bscTokens.mememint,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 290,
    lpSymbol: 'BNB-MLB LP',
    lpAddress: '0xd77210Dd5D5b0A5cBd16d8FEC96eCE5aad4964E0',
    token: bscTokens.mlb,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 291,
    lpSymbol: 'BNB-NBD LP',
    lpAddress: '0x70092cD26D6590F334D8C7D13CdC11aD350DE493',
    token: bscTokens.nbd,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 292,
    lpSymbol: 'BNB-Tor LP',
    lpAddress: '0x2dDec90FF8f7D6F8a900E341e64c4Dd7096b1c39',
    token: bscTokens.tor,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 293,
    lpSymbol: 'BNB-love69 LP',
    lpAddress: '0x38781022A9d36Fcb1C42ca81843ba34F4dCF83f7',
    token: bscTokens.love69,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 294,
    lpSymbol: 'BNB-SGROK LP',
    lpAddress: '0x02f3D38410843b78c56a86326199775edfc3e631',
    token: bscTokens.sgrok,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 295,
    lpSymbol: 'BNB-GrokLabs LP',
    lpAddress: '0xC3199E3069b381eBcF50F0766999E4F1835ee4A3',
    token: bscTokens.groklabs2,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 296,
    lpSymbol: 'BNB-RAO LP',
    lpAddress: '0x42a142D122855ED11c3d20b29a36b7A55e2ce026',
    token: bscTokens.rao,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 297,
    lpSymbol: 'BNB-4DC LP',
    lpAddress: '0x3c12EbDBA5F17CF0C93B3555fd48F780eB206e11',
    token: bscTokens.dc4,
    quoteToken: bscTokens.wbnb,
  }
  ,
  {
    pid: 298,
    lpSymbol: 'BNB-XEX LP',
    lpAddress: '0xdD1032a68E413b824134f4d2cDbEbc8340f5aFE7',
    token: bscTokens.xex,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 299,
    lpSymbol: 'BNB-NYNYC LP',
    lpAddress: '0x6075075ccE50004495AC2Cdc513a56C424093Ab3',
    token: bscTokens.nynyc,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 300,
    lpSymbol: 'BNB-FR LP',
    lpAddress: '0xdD1032a68E413b824134f4d2cDbEbc8340f5aFE7',
    token: bscTokens.xex,
    quoteToken: bscTokens.wbnb,
  },
  {
    pid: 301,
    lpSymbol: 'BNB-FARM LP',
    lpAddress: '0xE50E4bb7420fC3C079C5AF7Fa0A9cBA0551d3d2c',
    token: bscTokens.farm,
    quoteToken: bscTokens.wbnb,
   },
  {
    pid: 302,
    lpSymbol: 'BNB-BSF LP',
    lpAddress: '0x88beF385A09bB3B89B24Cd4d7a38531f3eB18b83',
    token: bscTokens.bullstar,
    quoteToken: bscTokens.wbnb,
  }
].map((p) => ({ ...p, token: p.token.serialize, quoteToken: p.quoteToken.serialize }))

export default farms
