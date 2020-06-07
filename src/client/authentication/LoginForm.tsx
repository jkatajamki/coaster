import React, { useState, ChangeEvent, FunctionComponent } from 'react'
import FormWrapper from '../form/FormWrapper'
import FormTextInput from '../form/FormTextInput'

export interface LoginFormProps {}

const LoginForm: FunctionComponent<LoginFormProps> = ({}) => {

  const [userEmail, setUserEmail] = useState('')

  const [userPassword, setUserPassword] = useState('')

  const onChangeUserEmail = (event: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = event

    setUserEmail(value)
  }

  const onChangeUserPassword = (event: ChangeEvent<HTMLInputElement>) => {
    const { target: { value } } = event

    setUserPassword(value)
  }

  return (
    <FormWrapper>
      <FormTextInput
        inputId="auth-email"
        label="Email"
        value={userEmail}
        onChange={onChangeUserEmail}
      />
      <FormTextInput
        inputId="auth-password"
        label="Password"
        value={userPassword}
        onChange={onChangeUserPassword}
      />
    </FormWrapper>
  )
}

export default LoginForm
