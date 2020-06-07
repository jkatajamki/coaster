import React, { FunctionComponent, ReactNode } from 'react'

export interface FormWrapperProps {
  children: ReactNode
}

const FormWrapper: FunctionComponent = ({ children }) => (
  <>
    {children}
  </>
)

export default FormWrapper
