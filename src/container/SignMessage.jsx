/* eslint-disable react-hooks/exhaustive-deps */
import * as React from 'react'
import { useSignMessage, useAccount } from 'wagmi'
import { recoverMessageAddress } from 'viem'
import { apiUrl } from '../utils/constants.ts'

export function SignMessage({
  ChadAddress,
  sender,
  content,
  timestamp
}) {
  const { data: signMessageData, isLoading, signMessage, variables, reset } = useSignMessage()
  const { address } = useAccount()
  React.useEffect(() => {
    ; (async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        })
        if (recoveredAddress) {
          const sendData = {
            ChadAddress: ChadAddress,
            sender: sender,
            content: variables?.message,
            timestamp: timestamp
          }
          const response = await fetch(apiUrl + '/api/add', {
            method: 'POST',
            mode: 'cors',
            cache: 'no-cache',
            headers: {
              'Content-Type': 'application/json'
            },
            redirect: 'error',
            body: JSON.stringify(sendData)
          })
          reset();
          document.getElementById("message").value = "";
          if (response.status !== 200) {
            const { error } = await response.json()
            throw new Error(error)
          }
        }
      }
    })()
  }, [signMessageData, variables?.message])

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.target)
        const message = formData.get('message')
        signMessage({ message })
      }}
    >
      <div className="TextAreaContainer">
        <textarea
          style={{ width: '-webkit-fill-available' }}
          rows={6}
          id="message"
          name="message"
          placeholder="Type your message here"
          className='rounded-[25px] p-6 text-white'
        />
      </div>
      <button disabled={isLoading || address === undefined} className="SendButton rounded-full text-[#222] py-2">
        {address === undefined ? 'Connect Wallet First' : isLoading ? 'Check Wallet' : 'Send Message'}
      </button>
    </form>
  )
}
