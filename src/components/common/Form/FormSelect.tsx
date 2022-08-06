// @ts-nocheck
import React, { FC, useContext, useEffect, useState } from 'react'

import FormContext from './FormContext'
import Select from './Select'

interface FormSelect {
  name: string
  options?: string[]
  objOptions?: OptionProps[]
}
const FormSelect: FC<FormSelect> = (props) => {
  const { register, rules, setValue, watch } = useContext(FormContext)
  const [currValue, setCurrValue] = useState<string>('')
  const { name } = props
  const value = watch(name)

  useEffect(() => {
    setCurrValue(value)
  }, [value])

  const changeFunc = (val) => {
    setCurrValue(val)
    setValue(name, val)
  }
  // @ts-ignore
  return (
    <>
      <input type="hidden" {...register(name, rules[name])} />
      <Select value={currValue} onChange={changeFunc} {...props} />
    </>
  )
}

export default FormSelect
