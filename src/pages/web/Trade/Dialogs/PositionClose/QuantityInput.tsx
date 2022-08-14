import React, { FC, useMemo, useState, useEffect, useCallback } from 'react'
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

  const typeOptions = useMemo(() => {
    return [BASE_TOKEN_SYMBOL, baseCoin]
  }, [baseCoin])

  const typeChangeEv = (symbol: any) => {
    if (symbol === BASE_TOKEN_SYMBOL) onChange(maxBUSD)
    else if (symbol === baseCoin) onChange(maxBase)
    else onChange(0)

    setType(symbol)
    onSymbol(symbol)
  }

  // set maxVolume for input
  useEffect(() => {
    if (value > maxVolume) onChange(maxVolume)
  }, [maxVolume, value])

  return (
    <div className="web-trade-dialog-position-close-quantity">
      <label>{t('Trade.ClosePosition.AmountToClose', 'Amount to Close')}</label>
      <section>
        <Input value={value} onChange={(amount) => onChange(Number(amount))} type="number" />
        <Select value={type} onChange={typeChangeEv} options={typeOptions} />
      </section>
      <PercentButton decimal={type === BASE_TOKEN_SYMBOL ? 2 : 4} currValue={value} value={maxVolume} onChange={(amount) => onChange(Number(amount))} />
    </div>
  )
}

export default QuantityInput
