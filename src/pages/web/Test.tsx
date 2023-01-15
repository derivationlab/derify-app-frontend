import React, { FC, useState } from 'react'
import PercentButton from '@/components/common/Form/PercentButton'

const Test: FC = () => {
  const [value, setValue] = useState(0)
  const onChange = (val: number) => {
    setValue(val)
    console.log(val)
  }
  return (
    <>
      <PercentButton currValue={value} value={9997.223455} onChange={onChange} decimal={6} />
      {value}
    </>
  )
}
export default Test
