import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'

const Slider = ({ items }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [itemsToShow, setItemsToShow] = useState(5); // Default to 5 items

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            if (width >= 1024) {
                setItemsToShow(5); // Desktop
            } else if (width >= 768) {
                setItemsToShow(3); // Tablet
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
        <div className='flex flex-col gap-2 mt-[-30px] overflow-hidden'>
            <div className='flex flex-row gap-3 justify-end px-2'>
                <button
                    onClick={prevSlide}
                    className="bg-[#f5f5f5] text-white p-3 rounded-full border border-black"
                    disabled={currentIndex === 0}
                    style={{ boxShadow: "rgb(0, 0, 0) 1px 1px 0px 0px" }}
                >
                    <svg fill={`${currentIndex === 0 ? "#888" : "#222"}`} viewBox="0 0 9 12" width="9" className="rotate-180"><path d="M0.839844 10.59L5.41984 6L0.839844 1.41L2.24984 0L8.24984 6L2.24984 12L0.839844 10.59Z"></path></svg>
                </button>
                <button
                    onClick={nextSlide}
                    className="bg-[#f5f5f5] text-white p-3 rounded-full border border-black"
                    disabled={items.length < itemsToShow}
                    style={{ boxShadow: "rgb(0, 0, 0) 1px 1px 0px 0px" }}
                >
                    <svg fill="#222" viewBox="0 0 9 12" width="9"><path d="M0.839844 10.59L5.41984 6L0.839844 1.41L2.24984 0L8.24984 6L2.24984 12L0.839844 10.59Z"></path></svg>
                </button>

            </div>
            <div className="">
                <div
                    className="flex transition-transform duration-300"
                    style={{ transform: `translateX(-${currentIndex * (100 / itemsToShow)}%)` }}
                >
                    {items.map((pool, index) => (
                        <Link
                            key={index}
                            className="flex-shrink-0 w-full flex flex-col items-center justify-center px-2"
                            style={{ width: `${100 / itemsToShow}%` }}
                            to={`/buy/?address=${pool.address}`}
                        >
                            <div className='flex w-full flex-col items-center justify-center rounded-[25px] bg-[#101010] overflow-hidden'>
                                <div className='relative flex flex-row items-center justify-center aspect-w-[208] w-full aspect-h-[85] overflow-hidden aspect-video'>
                                    <img src={pool.bannerUrl} sizes='100vw' width={208} height={85} className='object-cover object-center' />
                                </div>
                                <div className='relative w-full px-3 py-4 text-white'>
                                    <div className='text-[#29f780] text-xs flex flex-row gap-2'>
                                        created by:
                                        {pool.devAddress.slice(0, 2) + '..' + pool.devAddress.slice(-3)}
                                    </div>
                                    {pool.tokenSymbol}({pool.tokenName})
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Slider;
