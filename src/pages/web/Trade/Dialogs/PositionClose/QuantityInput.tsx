import React, { FC, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/common/Form/Input'
import PercentButton from '@/components/common/Form/PercentButton'
import { isGT } from '@/utils/tools'

interface Props {
  value: string
  maxSwap: string
  marginToken: string
  onChange: (value: string | number) => void
}

const QuantityInput: FC<Props> = ({ value, onChange, maxSwap, marginToken }) => {
  const { t } = useTranslation()

  const validateEnteredValueCb = useCallback(
    (amount: string) => {
      if (isGT(amount, maxSwap)) {
        onChange(maxSwap)
      } else {
        onChange(amount)
      }
    },
    [maxSwap]
  )

  return (
    <div className="web-trade-dialog-position-close-quantity">
      <label>{t('Trade.ClosePosition.AmountToClose', 'Amount to Close')}</label>
      <section>
        <Input value={value} onChange={validateEnteredValueCb} type="number" />
        {/*<Select value={closingType} onChange={closingTypeChange} options={[marginToken]} />*/}
        <div className="web-select-show-button">{marginToken}</div>
      </section>
      <PercentButton currValue={value} value={maxSwap} onChange={(amount) => onChange(amount)} />
    </div>
  )
}

export default QuantityInput
