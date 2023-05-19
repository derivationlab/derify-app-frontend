import classNames from 'classnames'

import React, { FC, useRef, useState, useMemo } from 'react'
import { useClickAway } from 'react-use'

// import { toType } from '@/utils/tools'
import Input from '@/components/common/Form/Input'

export interface OptionProps {
  value: string | number
  label: string
  icon?: string
}

export interface SelectProps {
  label?: string
  value: string | number
  options?: string[]
  onChange: (value: string | number) => void
  objOptions?: OptionProps[]
  className?: string
  large?: boolean
  filter?: boolean
  filterPlaceholder?: string
  renderer?: (props: any) => React.ReactNode
  labelRenderer?: (props: any) => React.ReactNode
}

const Select: FC<SelectProps> = ({
  label,
  value,
  options = [],
  onChange,
  objOptions = [],
  className,
  large,
  filter,
  filterPlaceholder,
  renderer,
  labelRenderer
}) => {
  const ref = useRef(null)
  const [showOptions, setShowOptions] = useState(false)
  const [keywords, setKeywords] = useState('')
  useClickAway(ref, () => setShowOptions(false))

  const calcCurrValue = useMemo(() => {
    if (options.length) return { label: value }
    if (objOptions.length) return objOptions.find((item) => item.value === value) ?? {}
  }, [objOptions, options, value])

  const onValueChange = (val: string | number) => {
    onChange(val)
    //
    setShowOptions(false)
  }

  const objOptionsFilter = useMemo(() => {
    return objOptions.filter(
      (item: OptionProps) =>
        item.label.toLocaleLowerCase().includes(keywords.toLocaleLowerCase()) ||
        String(item.value).toLocaleLowerCase().includes(keywords.toLocaleLowerCase())
    )
  }, [objOptions, keywords])

  return (
    <div className={classNames('web-select', { show: showOptions, large }, className)} ref={ref}>
      {label && !large && <label>{label}</label>}
      <div className="web-select-show">
        <div className="web-select-show-button" onClick={() => setShowOptions(!showOptions)}>
          {label && large && <label>{label}</label>}
          {labelRenderer ? labelRenderer(calcCurrValue) : <span>{calcCurrValue?.label}</span>}
        </div>
        <div className="web-select-options">
          {filter && (
            <Input
              className="web-select-options-filter"
              value={keywords}
              onChange={setKeywords}
              placeholder={filterPlaceholder}
            />
          )}
          <ul>
            {options.length
              ? options.map((item, index) => (
                  <li
                    key={index}
                    className={classNames({ active: item === value })}
                    onClick={() => onValueChange(item)}
                  >
                    {item}
                  </li>
                ))
              : null}
            {!options.length && objOptions.length
              ? objOptionsFilter.map((item, index) => (
                  <li
                    key={index}
                    className={classNames({ active: item.value === value })}
                    onClick={() => onValueChange(item.value)}
                  >
                    {renderer ? renderer(item) : item.label}
                  </li>
                ))
              : null}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Select
