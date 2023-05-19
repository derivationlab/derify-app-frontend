import React, { FC, useState, ReactNode, useEffect } from 'react'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Input from '@/components/common/Form/Input'

interface Props {
  show: boolean
  readOnly?: boolean
  title: string
  type: string
  value: string
  rules?: Record<string, any>
  onClose: () => void
  onConfirm: (val: string) => void
  tip?: ReactNode | string
  maxLength?: number
}

const InputDialog: FC<Props> = ({ show, title, type, value, onClose, onConfirm, tip, rules, readOnly }) => {
  const [currValue, setCurrValue] = useState(value)

  const confirmFunc = () => {
    if (rules && rules?.required && !currValue) {
      window.toast.error(rules?.required)
      return
    } else if (rules && rules?.pattern && !rules?.pattern.value.test(currValue)) {
      window.toast.error(rules?.pattern?.message)
      return
    } else {
      onClose()
      onConfirm(currValue)
    }
  }
  const closeFunc = () => {
    setCurrValue(value)
    onClose()
  }

  useEffect(() => {
    if (value) setCurrValue(value)
  }, [value])

  return (
    <Dialog width="540px" visible={show} title={title} onClose={closeFunc}>
      <div className="m-reg-dialog">
        <Input type={type} readOnly={readOnly} value={currValue} onChange={(val: string) => setCurrValue(val)} />
        {tip && <div className="m-reg-dialog-tip">{tip}</div>}
      </div>
      <Button onClick={confirmFunc}>Confirm</Button>
    </Dialog>
  )
}

export default InputDialog
