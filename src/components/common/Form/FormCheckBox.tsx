// @ts-nocheck
import React, { FC, useContext, useMemo, useState } from 'react'
import { pull } from 'lodash'
import classNames from 'classnames'
// import { useFieldArray } from "react-hook-form"
import { toType } from '@/utils/tools'

import FormContext from './FormContext'

interface OptionProps {
  label: string
  value: string | number
}

interface CheckBoxProps {
  name: string
  options: string[] | OptionProps[]
}

const FormCheckBox: FC<CheckBoxProps> = ({ name, options }) => {
  const { register, rules, setValue } = useContext(FormContext)
  const [currValue, setCurrValue] = useState<any[]>([])
  const calcOptions: OptionProps[] = useMemo(() => {
    if (options[0] && toType(options[0]) === 'string') {
      return options.map((item) => ({ value: item, label: item }))
    }
    return [...options]
  }, [options])

  const onValueChange = (val: any) => {
    if (currValue.includes(val)) {
      const tempArr = [...currValue]
      pull(tempArr, val)
      setCurrValue(tempArr)
    } else {
      setCurrValue([...currValue, val])
    }
    setValue(name, currValue)
  }

  // @ts-ignore
  return (
    <div className="web-form-checkbox">
      <input type="hidden" {...register(name, rules[name])} />
      {calcOptions.map((item: OptionProps, index: number) => (
        <span
          key={index}
          className={classNames({ active: currValue.includes(item.value) })}
          onClick={() => onValueChange(item.value)}
        >
          {item.label}
        </span>
      ))}
    </div>
  )
}

export default FormCheckBox
