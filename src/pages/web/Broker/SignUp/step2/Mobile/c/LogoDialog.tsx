import React, { FC, useState, ReactNode, ChangeEvent, useEffect } from 'react'

import Button from '@/components/common/Button'
import Dialog from '@/components/common/Dialog'

interface Props {
  show: boolean
  title: string
  value: string
  onClose: () => void
  onConfirm: (val: string, file: File | undefined) => void
  tip?: ReactNode | string
}

const LogoDialog: FC<Props> = ({ show, title, value, onClose, onConfirm, tip }) => {
  const [currValue, setCurrValue] = useState(value)
  const [fileObject, setFileObject] = useState<File>()

  const confirmFunc = () => {
    onClose()
    onConfirm(currValue, fileObject)
  }
  const closeFunc = () => {
    setCurrValue(value)
    onClose()
  }

  const uploadFunc = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files instanceof FileList && files.length) {
      setFileObject(files[0])
      const reader = new FileReader()
      reader.readAsDataURL(files[0])
      reader.onload = (e) => {
        // @ts-ignore
        setCurrValue(e.target.result)
      }
    }
  }

  useEffect(() => {
    if (value) setCurrValue(value)
  }, [value])

  return (
    <Dialog visible={show} title={title} onClose={closeFunc}>
      <div className="m-reg-dialog">
        <div className="m-reg-dialog-logo">
          <label>
            {currValue ? (
              <img src={currValue} alt="upload" />
            ) : (
              <i>
                click to upload <br />
                image
              </i>
            )}
            <input type="file" accept="image/*" onChange={uploadFunc} />
          </label>
        </div>
        {tip && <div className="m-reg-dialog-tip">{tip}</div>}
      </div>
      <Button onClick={confirmFunc}>Confirm</Button>
    </Dialog>
  )
}

export default LogoDialog
