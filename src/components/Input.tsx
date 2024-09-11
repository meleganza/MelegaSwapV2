import React from 'react'
import '../styles/Input.css'

interface InputProps {
  value: string
  type: string
  changeValue: (value: string) => void
  label: string
  placeholder: string
}

/**
 *
 * @param props value: string to be displayed in the input
 * @param props type: type of input
 * @param props changeValue: function to be called when the input is changed
 * @param props label: label of the input
 * @param props placeholder: placeholder of the input
 *
 * @returns a input component configured with the given props
 */

const Input: React.FC<InputProps> = props => {
  return (
    <div className="bg-transparent border border-[#e9e9e9] rounded-full w-full py-2 px-4 text-white">
      <input
        type={props.type}
        placeholder={props.placeholder}
        value={props.value}
        onChange={e => props.changeValue(e.target.value)}
        required
      />
    </div>
  )
}

export default Input
