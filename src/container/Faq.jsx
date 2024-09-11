import React, { useState, useEffect, useRef } from 'react'
import '../App.css'
import '../styles/MainContainer.css'

import 'react-datepicker/dist/react-datepicker.css'
import TopBar from '../components/TopBar.jsx'
import graph from '../../public/img/Bonding Curve.png'
import logo from '../../public/img/coollogo_com-22031459.png'
import footericon from '../../public/img/BlackPump Fire.png'
import arrow from '../../public/img/Yellow Arrow.png'
import arrowup from '../../public/img/Yellow Arrow-up.png'
function Faq() {
  const [isVisible, setIsVisible] = useState(false)
  const [isVisible1, setIsVisible1] = useState(false)
  const [isVisible2, setIsVisible2] = useState(false)
  const [isVisible3, setIsVisible3] = useState(false)
  const [isVisible4, setIsVisible4] = useState(false)
  const [isVisible5, setIsVisible5] = useState(false)
  const [isVisible6, setIsVisible6] = useState(false)
  const [isVisible7, setIsVisible7] = useState(false)
  const [isVisible8, setIsVisible8] = useState(false)
  const [isVisible9, setIsVisible9] = useState(false)
  const [isVisible10, setIsVisible10] = useState(false)
  const [isVisible11, setIsVisible11] = useState(false)

  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }
  const toggleVisibility1 = () => {
    setIsVisible1(!isVisible1)
  }
  const toggleVisibility2 = () => {
    setIsVisible2(!isVisible2)
  }
  const toggleVisibility3 = () => {
    setIsVisible3(!isVisible3)
  }
  const toggleVisibility4 = () => {
    setIsVisible4(!isVisible4)
  }
  const toggleVisibility5 = () => {
    setIsVisible5(!isVisible5)
  }
  const toggleVisibility6 = () => {
    setIsVisible6(!isVisible6)
  }
  const toggleVisibility7 = () => {
    setIsVisible7(!isVisible7)
  }
  const toggleVisibility8 = () => {
    setIsVisible8(!isVisible8)
  }
  const toggleVisibility9 = () => {
    setIsVisible9(!isVisible9)
  }
  const toggleVisibility10 = () => {
    setIsVisible10(!isVisible10)
  }
  const toggleVisibility11 = () => {
    setIsVisible11(!isVisible11)
  }
  return (
    <div>
      <div className="GlobalContainer">
        <div style={{ zIndex: 1 }}>
          <TopBar />
          <div>
            <div className="max-w-7xl m-auto pt-36 pb-24 px-4 sm:px-12 sm:py-10">
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
                  
                    fontSize: '16px',
                    textAlign: 'center'
                  }}
                >
                  These are the most frquent asked questions about
                  Blackpump.fun. Can't find What you are looking for?
                </div>
                <div
                  className="Text1"
                  style={{
                    
                    fontSize: '16px',
                    textAlign: 'center',
                    color: '#3B4E4F',
                    textDecoration: 'underline'
                  }}
                >
                  Feel free to ask in our community
                </div>
              </section>
            </div>
            <div className="max-w-7xl m-auto pt-36 pb-24 px-4 sm:px-12 sm:py-10">
              <div className="grid xl:grid-cols-2 gap-12">
                <div className="flex flex-col">
                  <div
                    className="text-center text-[#f3f3f3] text-xl mb-1.5"
                    style={{
                      fontSize: '35px',
                      fontWeight: 'bold',
                      marginBottom: '30px',
                      height: '100%'
                    }}
                  >
                    DEVELOPERS
                  </div>
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      How does Blackpump.fun benefit developers.
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible ? arrowup : arrow}
                      onClick={toggleVisibility}
                    />
                  </div>
                  {isVisible && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px',

                        }}
                      >
                        Blackpump.fun makes token deployment fast, easy and
                        cheap. You can have a token up and running within a
                        minute, immediately catching the attention of thousands
                        of platform users. Not only! With the FEATURED option we
                        provide also the best exposure and marketing.
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col">
                  <div
                    className="text-center text-[#f3f3f3] text-xl mb-1.5"
                    style={{
                      fontSize: '35px',
                      fontWeight: 'bold',
                      marginBottom: '30px'
                    }}
                  >
                    INVESTORS
                  </div>
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      What is Blackpump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible1 ? arrowup : arrow}
                      onClick={toggleVisibility1}
                    />
                  </div>
                  {isVisible1 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        BlackPump.fun is a cutting-edge platform designed to
                        simplify the process of token deployment and provide
                        investors with early access to promising crypto projects
                        that are technically safe.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-12"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      Which coding skills do i need to deploy a token?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible2 ? arrowup : arrow}
                      onClick={toggleVisibility2}
                    />
                  </div>
                  {isVisible2 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        NONE! All you have to do is fill in a couple details and
                        pay the deployement transaction fee.
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      How does Blackpump.fun benefit investors?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible3 ? arrowup : arrow}
                      onClick={toggleVisibility3}
                    />
                  </div>
                  {isVisible3 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        BlackPump.fun offers exclusive early access to new
                        tokens before they are listed on major DEXs,increasing
                        the chances for significant gains.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-12"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      How much does it cost to launch a project with
                      Blackpump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible4 ? arrowup : arrow}
                      onClick={toggleVisibility4}
                    />
                  </div>
                  {isVisible4 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        Peanuts! We currently charge something like 2 or 3$ for
                        the BASIC launch plus gas fees and about 250$ for the
                        FEATURED OPTION that will ensure your project gets the
                        best visibility and marketing coverage .
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      Is investing in Blackpump.fun benefit safe?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible5 ? arrowup : arrow}
                      onClick={toggleVisibility5}
                    />
                  </div>
                  {isVisible5 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        BlackPump.fun manages both the liquidity pool and the
                        token contract, ensuring a much safer investment
                        environment compared to the "regular" market that is
                        infested with scammers who are after your money.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-12"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      How can i start investing in BlackPump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible6 ? arrowup : arrow}
                      onClick={toggleVisibility6}
                    />
                  </div>
                  {isVisible6 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        All you have to do is connect your wallet and you are
                        ready to go. You'll find a lot of projects on our
                        homepage, which you can easily filter to find the right
                        project for you, on the chain you prefer to trade on.
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      How can i start investing in BlackPump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible7 ? arrowup : arrow}
                      onClick={toggleVisibility7}
                    />
                  </div>
                  {isVisible7 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        All you have to do is connect your wallet and you are
                        ready to go. You'll find a lot of projects on our
                        homepage, which you can easily filter to find the right
                        project for you, on the chain you prefer to trade on.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-12"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      Are there trading fees on BlackPump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible8 ? arrowup : arrow}
                      onClick={toggleVisibility8}
                    />
                  </div>
                  {isVisible8 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        YES! Just 1% on each trade You can get 50% of these fees
                        through your referral link that you find on each page of
                        the various tokens. Start earning now. Refer your
                        friends to BlackPump.fun!
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      What happens when a token reaches 69,000 USD market cap?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible9 ? arrowup : arrow}
                      onClick={toggleVisibility9}
                    />
                  </div>
                  {isVisible9 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        It's automatically listed on a DEX with 12k$ in
                        liquidity. At the same time, the LP tokens are burnt and
                        the contract renounced for enhanced safety.
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div
                className="grid xl:grid-cols-2 gap-12"
                style={{ marginTop: '20px' }}
              >
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      Are there other ways to earn money through Blackpump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible10 ? arrowup : arrow}
                      onClick={toggleVisibility10}
                    />
                  </div>
                  {isVisible10 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        YES! You dont have to invest money to make money. Start
                        earning with your project. Refer your friends and earn{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {' '}
                          50% of the fees{' '}
                        </span>
                        . Just grab your refferal link for free on each token
                        page and get started!
                      </div>
                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div
                    className="bg-[#262626] rounded-[10px] lg:px-8 px-2.5 py-5"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div
                      className="Text1"
                      style={{
                        fontSize: '14px'
                      }}
                    >
                      Are there other ways to earn money through Blackpump.fun?
                    </div>
                    <img
                      style={{ height: '40px', cursor: 'pointer' }}
                      src={isVisible11 ? arrowup : arrow}
                      onClick={toggleVisibility11}
                    />
                  </div>
                  {isVisible11 && (
                    <div
                      className="bg-[#040404] rounded-[20px] lg:px-8 px-2.5 py-5"
                      style={{
                        boxShadow: 'rgb(103, 103, 103) 0px 5px 10px 0px',
                        border: '2px solid white',
                        zIndex: '-1',
                        marginTop: '-27px',
                        height: '100%'
                      }}
                    >
                      <div
                        className="Text1"
                        style={{
                          fontSize: '14px',
                          paddingTop: '16px'
                        }}
                      >
                        YES! You dont have to invest money to make money. Start
                        earning with your project. Refer your friends and earn{' '}
                        <span style={{ fontWeight: 'bold' }}>
                          {' '}
                          50% of the fees{' '}
                        </span>
                        . Just grab your refferal link for free on each token
                        page and get started!
                      </div>
                    </div>
                  )}
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
                      justifyContent: 'space-around',
                      lineHeight:"1.5"
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

export default Faq
