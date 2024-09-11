import React, { useEffect, useState } from 'react';
import textLogo from '../assets/text-logo.png';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import { title } from 'process';

const Partner = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(5); // Default to 5 items

  const items = [
    {
      title: "PancakeSwap",
      description: "PancakeSwap is a decentralized exchange (DEX) built on BNB Chain that utilizes an automated market making (AMM) system. It is a fork of SushiSwap, with an almost identical codebase, but it has the advantage of cheaper and faster transactions due to being built on BSC. Additionally, it offers features such as yield farming across other protocols, lotteries, and initial farm offerings (IFO).",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fpancake.b2cc66db.png&w=96&q=75",
      url: "https://www.rootdata.com/Projects/detail/PancakeSwap?k=NTU1"
    },
    {
      title: "Binance",
      description: "Binance Web3 Wallet is a self-custody crypto wallet within the Binance app, designed to empower users in the realm of decentralized finance (DeFi). Serving as a digital gateway to blockchain-based applications (dApps), it offers users a secure and streamlined method to manage their cryptocurrencies, execute token swaps across multiple chains, earn yields, and interact with a variety of blockchain platforms.",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fbinance.61bb9e60.png&w=96&q=75",
      url: "https://www.binance.com/en-AU/support/faq/what-is-binance-web3-wallet-and-how-does-it-work-048ee79532494c03918dc4004214ad11"
    },
    {
      title: "$FOUR",
      description: "Top memeproject on BSC. -'$FOUR Make BNB Great Again!'",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffour.cc88d936.png&w=96&q=75",
      url: ""
    },
    {
      title: "$WHY",
      description: "To meme project on BSC- 'Don't ask Why An Elephant",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fwhy.18a63148.png&w=96&q=75",
      url: ""
    },
    {
      title: "Trust Wallet",
      description: "Trust Wallet is a popular cryptocurrency hot wallet that allows users to retain control over their funds. A central feature of Trust Wallet is its in-built DApp browser, which offers a selection of vetted decentralized applications. Trust Wallet also offers staking and token swaps straight in the app.",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ftrust.e07475e8.png&w=96&q=75",
      url: "https://www.rootdata.com/Projects/detail/Trust%20Wallet?k=NDQwOQ%3D%3D"
    },
    {
      title: "Safepal",
      description: "SafePal is dedicated to providing a secure and user-friendly crypto management platform to help the masses secure and grow their crypto assets safely and conveniently. It is the first hardware wallet invested and backed by Binance, and also the first decentralized cryptocurrency wallet to implement the Binance trading experience.",
      imgUrl: "https://four.meme/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Fsafepal.33730e31.png&w=96&q=75",
      url: "https://www.rootdata.com/Projects/detail/SafePal?k=MzIw"
    },
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsToShow(2); // Desktop
      } else if (width >= 768) {
        setItemsToShow(1); // Tablet
      } else {
        setItemsToShow(1); // Mobile
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set the initial number of items

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? items.length - itemsToShow : prevIndex - 1
    );
  };

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === items.length - itemsToShow ? 0 : prevIndex + 1
    );
  };

  return (
    <section className="footer bg-[#000] sm:p-12 pl-0">
      <div className='max-w-7xl m-auto'>
        {/* <img src={textLogo} className='mb-4' /> */}
        <p className='mt-5'>
          <span className="chadfun text-[24px]">
            Partner
          </span>
          <div className='flex flex-col gap-2 mt-[10px] overflow-hidden'>
            <div className='flex flex-row gap-3 justify-between px-2'>
              <button
                onClick={prevSlide}
                className="bg-[#f5f5f5] text-white p-3 rounded-full border border-black size-8 self-center"
                disabled={currentIndex === 0}
                style={{ boxShadow: "rgb(0, 0, 0) 1px 1px 0px 0px" }}
              >
                <svg fill={`${currentIndex === 0 ? "#888" : "#222"}`} viewBox="0 0 8 12" width="7" className="rotate-180"><path d="M0.839844 10.59L5.41984 6L0.839844 1.41L2.24984 0L8.24984 6L2.24984 12L0.839844 10.59Z"></path></svg>
              </button>
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-300"
                  style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                >
                  {items.map((pool) => (
                    <a
                      className="flex-shrink-0 w-full flex flex-col items-center justify-center px-2"
                      style={{ width: `${100 / itemsToShow}%` }}
                      to='ee'
                      href={pool.url}
                      target='_blank'
                    >
                      <div className='flex w-full flex-col items-center justify-center rounded-[25px] bg-[#101010] overflow-hidden h-full'>
                        <div className='relative flex flex-row items-center justify-center w-full aspect-h-[85] overflow-hidden aspect-video'>
                          <img src={pool.imgUrl} sizes='100vw' width={50} height={50} className='object-cover object-center pt-3' />
                        </div>
                        <div className='relative w-full px-3 py-4 text-white'>
                          <div className='text-xl flex flex-row gap-2'>
                            {pool.title}
                          </div>
                          <div className='text-[#a3a3a3] text-xs flex flex-row gap-2'>
                            {pool.description}
                          </div>
                          {/* {pool.tokenSymbol}({pool.tokenName}) */}
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
              <button
                onClick={nextSlide}
                className="bg-[#f5f5f5] text-white p-3 rounded-full border border-black size-8 self-center"
                disabled={items.length < itemsToShow}
                style={{ boxShadow: "rgb(0, 0, 0) 1px 1px 0px 0px" }}
              >
                <svg fill="#222" viewBox="0 0 9 12" width="7"><path d="M0.839844 10.59L5.41984 6L0.839844 1.41L2.24984 0L8.24984 6L2.24984 12L0.839844 10.59Z"></path></svg>
              </button>
            </div>
          </div>
        </p>
      </div>
    </section>
  );
};

export default Partner;