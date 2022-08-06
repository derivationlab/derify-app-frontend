// doc https://www.react-hook-form.com/

import React, { FC } from 'react'
import FormContext from './FormContext'

interface FormProps {
  // register: (name: string, RegisterOptions?: Record<string, any>) => Record<string, any>
  // resetField: (name: string, options?: Record<string, boolean | any>) => void
  rules: Record<string, any>
  mode: Record<string, any>
}

export const Form: FC<FormProps> = ({ mode, rules, children }) => {
  const {
    register,
    resetField,
    watch,
    setValue,
    formState: { errors }
  } = mode
  return (
    <FormContext.Provider value={{ register, resetField, rules, errors, watch, setValue }}>
      <form>{children}</form>
    </FormContext.Provider>
  )
}

export default Form
