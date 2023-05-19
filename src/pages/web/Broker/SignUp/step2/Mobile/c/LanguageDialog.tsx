import React, { FC, useState, useEffect } from 'react'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'
import Select from '@/components/common/Form/Select'
import { SelectLangOptions } from '@/data'

interface Props {
  show: boolean
  title: string
  value: string
  onClose: () => void
  onConfirm: (val: string) => void
}

const LanguageDialog: FC<Props> = ({ show, title, value, onClose, onConfirm }) => {
  const [currValue, setCurrValue] = useState(value)

  const confirmFunc = () => {
    onClose()
    onConfirm(currValue)
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
        <Select
          value={currValue}
          onChange={(val: string | number) => setCurrValue(String(val))}
          options={SelectLangOptions}
        />
      </div>
      <Button onClick={confirmFunc}>Confirm</Button>
    </Dialog>
  )
}

export default LanguageDialog
