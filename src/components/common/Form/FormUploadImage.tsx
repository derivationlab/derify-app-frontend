// @ts-nocheck
import React, { FC, useContext, useEffect, useState } from 'react'

// import Image from '@/components/common/Image'
import FormContext from './FormContext'

interface UploadImageProps {
  name: string
}

const FormUploadImage: FC<UploadImageProps> = ({ name }) => {
  const [prePath, setPrePath] = useState('')
  const { register, rules, watch } = useContext(FormContext)
  const value = watch(name) // value: Maybe FileList / string

  useEffect(() => {
    if (value) {
      if (value instanceof FileList && value.length) {
        const reader = new FileReader()
        reader.readAsDataURL(value[0])
        reader.onload = (e) => setPrePath(e.target.result)
      } else {
        setPrePath(value)
      }
    }
  }, [value])
  return (
    <div className="web-form-upload">
      <label>
        <input type="file" accept="image/*" {...register(name, rules[name])} />
        {prePath ? (
          <img src={prePath} alt="" />
        ) : (
          <i>
            click to upload <br />
            image
          </i>
        )}
      </label>
    </div>
  )
}

export default FormUploadImage
