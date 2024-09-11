import React from 'react'

const CustomRadioButton = ({ value, selectedValue, handleSelect }) => {
  const isSelected = value === selectedValue

  const handleClick = () => {
    handleSelect(value)
  }

  return (
    <button
      type="button"
      className={
        isSelected
          ? 'custom-radio-button-selected'
          : 'custom-radio-button-unselected'
      }
      onClick={handleClick}
    >
      {value}
    </button>
  )
}

export default CustomRadioButton
