import React, { useState, useEffect, useRef } from 'react'
import '../App.css'
import '../styles/MainContainer.css'
import Footer from '../components/Footer.jsx'
import 'react-datepicker/dist/react-datepicker.css'
import TopBar from '../components/TopBar.jsx'
import graph from '../../public/img/Bonding Curve.png'
import logo from '../../public/img/coollogo_com-192273672.png'
import footericon from '../../public/img/BlackPump Fire.png'
import benefitslogo from '../../public/img/logos.png'
import hot from "../../public/img/HOT CLEAN.png"
function AboutUs() {
  return (
    <div>
      <div className="GlobalContainer">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div>
            <div className="max-w-7xl m-auto pt-36 pb-15 px-4 sm:px-12 sm:py-10 lg:py-4">
              <section className="lg:mx-auto pt-8 lg:py-[30px] w-full lg:w-[741px] min-w-0">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <img style={{ height: '113px' }} src={logo} />
                </div>
                <div
                  className="Text1"
                  style={{
                    width: '90%',
                    fontSize: '14px',
                    textAlign: 'center'
                  }}
                >
                  BlackPump.fun is a cutting-edge platform designed to simplify
                  the process of token deployment and provide investors with
                  early access to promising crypto projects that are technically
                  safe
                </div>
              </section>
            </div>
            <div className="max-w-7xl m-auto pt-36 pb-24 px-4 sm:px-12 sm:py-10 lg:py-4">
              <div className="grid xl:grid-cols-2 gap-4">
                <div className="flex flex-col">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{ fontSize: '35px', fontWeight: 'bold' }}
                    >
                      DEVELOPERS
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      BlackPump.fun eliminates the need for initial liquidity
                      provision, making it <br></br>easier than ever to deploy
                      and launch tokens. Once your token reaches a market cap of
                      $69,000, it is automatically listed on the choosen DEX,
                      while at the same timing locking $12,000 in the liquidity
                      pool and renouncing the contract for enhanced safety to
                      your community.
                    </div>
                  </div>
                  <div
                    className="bg-[#FFC000] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      marginTop: '-49px',
                      zIndex: '-1'
                    }}
                  >
                    <div
                      className="text-center  text-xl mb-1.5"
                      style={{
                        fontSize: '35px',
                        fontWeight: 'bold',
                        paddingTop: '50px'
                      }}
                    >
                      BENEFITS
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px',
                        color: 'black'
                      }}
                    >
                      BlackPump.fun makes token deployment fast, easy and cheap.
                      You can have a token up and running within a minute,
                      immediately catching the attention of thousands of users.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{ fontSize: '35px', fontWeight: 'bold' }}
                    >
                      INVESTORS
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      BlackPump.fun offers exclusive early access to new tokens
                      before they are listed on major DEXs, increasing the
                      chances for significant gains. Our platform manages both
                      the liquidity pool and the token contract, ensuring a much
                      safer investment environment compared to the "normal"
                      market full of scammers who take advantage of normal
                      launch pad to steal money.
                    </div>
                  </div>
                  <div
                    className="bg-[#FFC000] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      marginTop: '-49px',
                      zIndex: '-1'
                    }}
                  >
                    <div
                      className="text-center  text-xl mb-1.5"
                      style={{
                        fontSize: '35px',
                        fontWeight: 'bold',
                        paddingTop: '50px'
                      }}
                    >
                      BENEFITS
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px',
                        color: 'black'
                      }}
                    >
                      BlackPump.fun makes token deployment fast, easy and cheap.
                      You can have a token up and running within a minute,
                      immediately catching the attention of thousands of users.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="grid xl:grid-cols-4 gap-4"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col gap-3">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{ fontSize: '22px', fontWeight: 'bold' }}
                    >
                      INSANT TOKEN DEMPLOYMENT
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      Deploying a contract less than a minute, needs ZERO coding
                      skills and is extremely cheap. On top of that we provide
                      the liquidity for all launches on the platform, so your
                      startup cost is near 0.
                    </div>
                  </div>
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Insant Visibility & Marketing
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      Your project will show up on the homepage of our platform,
                      where thousands of active users are waiting for their next
                      project to invest in. With the FEATURED option you'll get
                      the best marketing.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Automcatic Dex Listing
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      When your token reaches a market cap of $69,000, its
                      automatically listed on your choosen DEX. At the same
                      time, the liquidity pool is locked and the LP tokens are
                      burnt for enhanced safety
                    </div>

                    <div
                      className="text-center  text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        marginTop: '70px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <img style={{ height: '113px' }} src={graph} />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Exclusive Early Access
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      Blackpump.fun gives you the unique opportunity to invest
                      in tokens before they are listed on major decentralized
                      exchanges (DEXs).
                    </div>
                  </div>
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Early community involvement
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      Being an early investor often means having a voice in the
                      projects developement,which can lead to a deeper
                      understanding of the token's potential and a more active
                      role in its success.
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Potential For High Gains
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      Early Investments often come with higher risks, but with
                      the reward potential is also much greater.
                    </div>
                  </div>
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%'
                    }}
                  >
                    <div
                      className="text-center text-[#f3f3f3] text-xl mb-1.5"
                      style={{
                        fontSize: '22px',
                        fontWeight: 'bold',
                        textTransform: 'uppercase'
                      }}
                    >
                      Easy Investment Experience
                    </div>
                    <div
                      className="Text1"
                      style={{
                        width: '100%',
                        fontSize: '14px'
                      }}
                    >
                      With a user-friendly interface, you can easily browse,
                      evaluate, and invest in tokens.
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-4"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col gap-3" style={{position:"relative"}}>
                  <div
                    className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <img style={{ height: '100px' }} src={benefitslogo} />
                      <button
                        style={{
                          backgroundColor: '#FFC000',
                          padding: '10px',
                          borderRadius: '10px',
                          fontWeight: 'bold',
                          marginTop: '20px'
                        }}
                      >
                        Buy $MARCO
                      </button>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        width: '70%'
                      }}
                    >
                      <div
                        className="text-center text-[#f3f3f3] text-xl mb-1.5"
                        style={{ fontSize: '22px', fontWeight: 'bold' }}
                      >
                        MORE BENEFITS FOR $MARCO HOLDERS
                      </div>
                      <div
                        className="Text1"
                        style={{
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >
                        Blackpump.fun belongs to the Melega Ecosystem. $MARCO is
                        the flagship token of the project and of the daPP
                        MelegaSwap. $MARCO holders will benefit with a 50%
                        discount on FEATURED Launch option. Explore{' '}
                        <span style={{ fontWeight: '700' }}>
                          MelegaSwap | Melega Space
                        </span>
                      </div>
                    </div>
                  </div>
                  <img style={{height:"50px",width:"50px",position:"absolute",right:"-9px",top:"-18px"}} src={hot}/>
                </div>
                <div className="grid xl:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-3">
                    <div
                      className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        height: '100%'
                      }}
                    >
                      <div
                        className="text-center text-[#f3f3f3] text-xl mb-1.5"
                        style={{ fontSize: '22px', fontWeight: 'bold' }}
                      >
                        ENHANCED SAFETY
                      </div>
                      <div
                        className="Text1"
                        style={{
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >
                        Blackpump.fun manages both the liquidity pool and the
                        token contract, ensuring a much safer investment
                        environment compared to the "regular" market that is
                        infested with scammers that are after your money.
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3">
                    <div
                      className="bg-[#040404] rounded-[40px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        height: '100%'
                      }}
                    >
                      <div
                        className="text-center text-[#f3f3f3] text-xl mb-1.5"
                        style={{ fontSize: '22px', fontWeight: 'bold' }}
                      >
                        PORTFOLIO TRACKING
                      </div>
                      <div
                        className="Text1"
                        style={{
                          width: '100%',
                          fontSize: '14px'
                        }}
                      >
                        Blackpump.fun's elaborate profile page shows your full
                        trade history for you to analyze, as well as a
                        portofolio tracking tool that shows you exactly which
                        tokens you are currently holding and what they are
                        worth.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                className="grid xl:grid-cols-1 gap-4"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col gap-3">
                  <div
                    className="flex flex-col-reverse lg:flex-row bg-[#FFC000] rounded-[40px] lg:px-8 px-2.5 py-5"
                    style={{
                      boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                      border: '2px solid white',
                      height: '100%',
                      alignItems: 'center',
                      justifyContent: 'space-around'
                    }}
                  >
                    <div
                      style={{
                        textAlign: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      <div
                        className="text-xl mb-1.5"
                        style={{
                          width: '80%',
                          textAlign: 'center',
                          fontSize: '35px',
                          fontWeight: 'black',
                          textTransform: 'uppercase'
                        }}
                      >
                        Refer blackpump to your friends and start earning
                      </div>
                      <div
                        className="Text1"
                        style={{
                          width: '100%',
                          fontSize: '16px',
                          color: 'black'
                        }}
                      >
                        Introduce your friends to a better way to trade. Refer
                        them to Blackoump.fun, and you will get{' '}
                        <span style={{ fontWeight: '700' }}>
                          50% of the fees
                        </span>
                      </div>
                    </div>
                    <div>
                      <img style={{ height: '180px' }} src={footericon} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
