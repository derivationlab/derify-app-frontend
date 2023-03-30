import React, { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isGT } from '@/utils/tools'
import { MarginTokenKeys } from '@/typings'
import { findMarginToken } from '@/config/tokens'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

interface Props {
  value: string
  maxSwap: string
  maxSize: string
  quoteToken: string
  marginToken: string
  onSymbol: (value: MarginTokenKeys) => void
  onChange: (value: string | number) => void
}

const QuantityInput: FC<Props> = ({ value, onSymbol, onChange, maxSwap, maxSize, quoteToken, marginToken }) => {
  const { t } = useTranslation()

  const [closingType, setClosingType] = useState<string>(marginToken)

  const maxVolume = useMemo(() => (findMarginToken(closingType) ? maxSwap : maxSize), [closingType, maxSwap, maxSize])

  const closingTypeChange = (symbol: any) => {
    if (findMarginToken(symbol)) {
      onChange(maxSwap)
    } else {
      onChange(maxSize)
    }

    onSymbol(symbol)
    setClosingType(symbol)
  }

  const validateEnteredValueCb = useCallback(
    (amount: string) => {
      if (isGT(amount, maxVolume)) {
        onChange(maxVolume)
      } else {
        onChange(amount)
      }
    },
    [maxVolume]
  )

  return (
    <div className="web-trade-dialog-position-close-quantity">
      <label>{t('Trade.ClosePosition.AmountToClose', 'Amount to Close')}</label>
      <section>
        <Input value={value} onChange={validateEnteredValueCb} type="number" />
        {/*<Select value={closingType} onChange={closingTypeChange} options={[marginToken]} />*/}
        <div className="web-select-show-button">{marginToken}</div>
      </section>
      <PercentButton currValue={value} value={maxVolume} onChange={(amount) => onChange(amount)} />
    </div>
  )
}

export default QuantityInput
