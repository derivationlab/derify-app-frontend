import React, { FC } from 'react'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'

interface ButtonProps {
  className?: string
  type?: string
  size?: string
  to?: string
  loading?: boolean
  outline?: boolean
  disabled?: boolean
  noDisabledStyle?: boolean
  full?: boolean
  onClick?: (e: any) => void
}

const Button: FC<ButtonProps> = ({
  to,
  type,
  children,
  size,
  disabled,
  noDisabledStyle,
  outline,
  loading,
  className,
  onClick,
  full
}) => {
  const history = useHistory()

  const handleClick = (e: any): void => {
    if (!disabled && !loading) {
      if (to) {
        history.push(to)
      } else {
        onClick?.(e)
      }
    }
  }
  return (
    <button
      className={classNames(className, 'web-button', `web-button-size-${size}`, `web-button-type-${type}`, {
        disabled: disabled && !noDisabledStyle,
        outline,
        loading,
        full
      })}
      disabled={disabled}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

Button.defaultProps = {
  loading: false,
  size: 'default',
  type: 'default',
  disabled: false
}

export default Button
