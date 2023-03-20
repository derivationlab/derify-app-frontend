import React, { ChangeEvent, FC, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/common/Button'
import { isGT } from '@/utils/tools'

interface Props {
  max: string
  unit?: string
  title: string
  initial?: string
  onChange: (v: string) => void
}

const AmountInput: FC<Props> = ({ max, unit, title, initial = '', onChange }) => {
  const { t } = useTranslation()

  const [value, setValue] = useState<string>('')

  const setMax = () => {
    if (Number(max) > 0) {
      onChange(max)
      setValue(max)
    }
  }

  const validate = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (isGT(v, max)) {
        onChange(max)
        setValue(max)
      } else {
        onChange(v)
        setValue(v)
      }
    },
    [max]
  )

  useEffect(() => {
    if (initial) {
      onChange(initial)
      setValue(initial)
    }
  }, [initial])

  return (
    <div className="web-c-amount-input">
      <p>{title}</p>
      <div className="wrap">
        <input type="number" value={value} onChange={validate} />
        <div className="extra">
          <span className="unit">{unit}</span>
          <Button size="mini" onClick={setMax}>
            {t('Trade.Deposit.Max', 'Max')}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AmountInput
