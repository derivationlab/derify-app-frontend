import React, { ChangeEvent, FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

interface Props {
  title: string
  unit?: string
  max: string
  onChange: (v: string) => void
}

const AmountInput: FC<Props> = ({ title, unit, max, onChange }) => {
  const { t } = useTranslation()
  const [value, setValue] = useState<string>('')

  const onChangeEv = (e: ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value
    setValue(v)
  }

  const setMaxValueEv = () => {
    setValue(max)
  }

  useEffect(() => {
    onChange(value)
  }, [value])

  return (
    <div className="web-c-amount-input">
      <p>{title}</p>
      <div className="wrap">
        <input type="number" value={value} onChange={onChangeEv} />
        <div className="extra">
          <span className="unit">{unit}</span>
          <Button size="mini" onClick={setMaxValueEv}>
            {t('Trade.Deposit.Max', 'Max')}
          </Button>
        </div>
      </div>
    </div>
  )
}

AmountInput.defaultProps = {
  unit: BASE_TOKEN_SYMBOL
}

export default AmountInput
