import BN from 'bignumber.js'
import React, { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'

interface Props {
  value: number
  onSymbol: (value: string) => void
  onChange: (value: number) => void
  maxBUSD: number
  maxBase: number
  baseCoin: string
}

const QuantityInput: FC<Props> = ({ value, onSymbol, onChange, maxBUSD, maxBase, baseCoin }) => {
  const { t } = useTranslation()
  const [type, setType] = useState<string>(BASE_TOKEN_SYMBOL)

  const maxVolume = useMemo(() => (type === BASE_TOKEN_SYMBOL ? maxBUSD : maxBase), [type, maxBUSD, maxBase])

  const typeChangeEv = (symbol: any) => {
    if (symbol === BASE_TOKEN_SYMBOL) onChange(maxBUSD)
    else onChange(maxBase)

    setType(symbol)
    onSymbol(symbol)
  }

  const validateEnteredValueCb = useCallback(
    (amount: number) => {
      if (new BN(amount).isGreaterThan(maxVolume)) {
        onChange(maxVolume)
      } else onChange(amount)
    },
    [maxVolume]
  )

  return (
    <div className="web-trade-dialog-position-close-quantity">
      <label>{t('Trade.ClosePosition.AmountToClose', 'Amount to Close')}</label>
      <section>
        <Input value={value} onChange={validateEnteredValueCb} type="number" />
        <Select value={type} onChange={typeChangeEv} options={[BASE_TOKEN_SYMBOL, baseCoin]} />
      </section>
      <PercentButton currValue={value} value={maxVolume} onChange={(amount) => onChange(Number(amount))} />
    </div>
  )
}

export default QuantityInput
