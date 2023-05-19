// @ts-nocheck
import classNames from 'classnames'

import React, { FC, ReactNode, useContext } from 'react'

import Image from '@/components/common/Image'

import FormContext from './FormContext'

interface ErrorTipProps {
  error?: Record<string, any>
}

export const ErrorTip: FC<ErrorTipProps> = ({ error }) => {
  if (error && error?.message) {
    return <p className="web-form-item-error">{error?.message}</p>
  }
  return null
}

interface FormItemProps {
  prop?: string
  label?: string
  hidden?: boolean
  icon?: string
  tip?: ReactNode | string
  showTip?: boolean
  hideError?: boolean
}

export const FormItem: FC<FormItemProps> = ({
  prop,
  hidden,
  label,
  children,
  icon,
  tip,
  showTip = true,
  hideError
}) => {
  const { errors } = useContext(FormContext)
  const error = errors[prop]

  if (hidden) {
    return (
      <>
        {children}
        {!hideError && <ErrorTip error={error} />}
      </>
    )
  }
  return (
    <div className={classNames('web-form-item', { error })}>
      {label && (
        <label>
          {icon && <Image src={icon} />}
          {label}
        </label>
      )}
      <div className="web-form-item-inner">
        {children}
        {!hideError && <ErrorTip error={error} />}
      </div>
      {showTip && <div className="web-form-item-tip">{tip}</div>}
    </div>
  )
}

export default FormItem
