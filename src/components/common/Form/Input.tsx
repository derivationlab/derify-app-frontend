import classNames from 'classnames'
import { isNaN } from 'lodash'

import React, { FC, ChangeEvent, ReactNode } from 'react'

interface InputProps {
  type?: string
  value: number | string
  onChange: (value: any) => void
  disabled?: boolean
  readOnly?: boolean
  className?: string
  placeholder?: string
  suffix?: string
  maxLength?: number
  children?: ReactNode
}

const Input: FC<InputProps> = ({
  value,
  onChange,
  type,
  disabled,
  className,
  placeholder,
  readOnly,
  maxLength,
  suffix,
  children
}) => {
  const changeFunc = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onChange(e.target.value)
  }
  return (
    <div className={classNames('web-form-input', className, { disabled })}>
      {type === 'textarea' ? (
        <textarea value={value} maxLength={maxLength} onChange={changeFunc} placeholder={placeholder} />
      ) : (
        <input
          readOnly={readOnly}
          type={type}
          value={value}
          max={1000000000000000}
          maxLength={maxLength}
          onChange={changeFunc}
          placeholder={placeholder}
        />
      )}
      {suffix && <span className="web-form-input-suffix">{suffix}</span>}
      {children && children}
    </div>
  )
}

Input.defaultProps = {
  type: 'text'
}

export default Input
