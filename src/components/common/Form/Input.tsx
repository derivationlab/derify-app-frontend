import React, { FC, ChangeEvent } from 'react'
import classNames from 'classnames'
import { isNaN } from 'lodash'
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
  suffix
}) => {
  const changeFunc = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const v = e.target.value
    if (type === 'number') {
      !isNaN(v) && onChange(v)
    } else {
      onChange(v)
    }
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
    </div>
  )
}

Input.defaultProps = {
  type: 'text'
}

export default Input
