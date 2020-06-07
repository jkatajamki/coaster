import React, { FunctionComponent, ChangeEvent } from 'react'

export interface FormTextInputProps {
  inputId: string
  label: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
}

const FormTextInput: FunctionComponent<FormTextInputProps> = ({
  inputId,
  label,
  value,
  onChange
}) => {
  return (
    <>
      <label htmlFor={inputId}>{label}</label>
      <input
        id={inputId}
        type="text"
        value={value}
        onChange={onChange}
      />
    </>
  )
}

export default FormTextInput
