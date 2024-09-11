/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
/* eslint-disable no-mixed-operators */
/* eslint-disable no-undef */
/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import '../App.css'
import '../styles/MainContainer.css'
import Footer from '../components/Footer'
import { ReactComponent as BackIcon } from '../icons/back.svg'
import TopBar from '../components/TopBar'

const EditProfile = () => {
  const history = useHistory()
  const [userName, setUserName] = useState('@moonboy67')
  const [userAvatar, setUserAvatar] = useState('/img/moonboy67.png')

  return (
    <div>
      <div className="GlobalContainer">
        {
          <div style={{ zIndex: 1 }}>
            <TopBar />
            <div className="headerMargin" />
            <section className="ProfileBox">
              <>
                <br />
                <div className="claim-card">
                  <div style={{ textAlign: 'left' }}>
                    <button
                      className="back-button"
                      onClick={() => history.goBack()}
                    >
                      <BackIcon className="back-icon" />
                      &nbsp;Back
                    </button>
                  </div>
                  <div className="profile-user-details-wrapper">
                    <div>
                      <p className="profile-text">
                        <b>Edit Profile</b>
                      </p>
                    </div>
                    <div>
                    </div>
                    <div>
                      <p className="profile-text">Profile photo</p>
                    </div>
                    <div>
                      <div className="profile-user-avatar">
                        <img
                          src={userAvatar}
                          alt=""
                          className="profile-user-avatar-image"
                        />
                      </div>
                    </div>
                    <div>
                      <p className="profile-text">Username</p>
                    </div>
                    <div>
                      <input
                        type="text"
                        value={userName}
                        className="profile-text-input"
                        onChange={e => setUserName(e.target.value)}
                      />
                    </div>
                  </div>
                  <br />
                  <br />
                  <br />
                  <div style={{ textAlign: 'center' }}>
                    <button className="save-button">Save</button>
                  </div>
                </div>
                <br />
              </>
            </section>
          </div>
        }
      </div>
      <Footer />
    </div>
  )
}

export default EditProfile
