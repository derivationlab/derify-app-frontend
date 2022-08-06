// @ts-nocheck
import React, { FC, useContext } from 'react'

import FormContext from './FormContext'

interface InputProps {
  name: string
  placeholder?: string
  maxLength?: number
  type?: string
  text?: string
  readOnly?: boolean
  clearable?: boolean
}

const FormInput: FC<InputProps> = ({ type = 'text', name, placeholder, maxLength, clearable, readOnly }) => {
  const { register, resetField, rules, watch } = useContext(FormContext)
  const rest = () => resetField(name)
  const value = watch(name)
  // @ts-ignore
  return (
    <div className="web-form-input">
      {type === 'textarea' ? (
        <textarea {...register(name, rules[name])} maxLength={maxLength} placeholder={placeholder} />
      ) : (
        <input
          type={type}
          {...register(name, rules[name])}
          maxLength={maxLength}
          placeholder={placeholder}
          readOnly={readOnly}
        />
      )}
      {clearable && value && <del className="web-form-input-clearable" onClick={rest} />}
    </div>
  )
}

FormInput.defaultProps = {
  readOnly: false
}

export default FormInput
