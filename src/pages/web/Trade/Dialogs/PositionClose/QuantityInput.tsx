import React, { FC, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { isGT } from '@/utils/tools'
import { BASE_TOKEN_SYMBOL, findMarginToken } from '@/config/tokens'

import { Select, Input } from '@/components/common/Form'
import PercentButton from '@/components/common/Form/PercentButton'
import { MarginTokenKeys } from '@/typings'
import { useMarginToken } from '@/zustand'

interface Props {
  value: number
  onSymbol: (value: MarginTokenKeys) => void
  onChange: (value: number) => void
  maxBUSD: number
  maxBase: number
  baseCoin: string
}

const QuantityInput: FC<Props> = ({ value, onSymbol, onChange, maxBUSD, maxBase, baseCoin }) => {
  const { t } = useTranslation()

  const marginToken = useMarginToken((state) => state.marginToken)

  const [type, setType] = useState<string>(marginToken)

  const maxVolume = useMemo(() => (type === BASE_TOKEN_SYMBOL ? maxBUSD : maxBase), [type, maxBUSD, maxBase])

  const typeChangeEv = (symbol: any) => {
    if (findMarginToken(symbol)) onChange(maxBUSD)
    else onChange(maxBase)

    setType(symbol)
    onSymbol(symbol)
  }

  const validateEnteredValueCb = useCallback(
    (amount: number) => {
      if (isGT(amount, maxVolume)) {
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
        <Select value={type} onChange={typeChangeEv} options={[marginToken, baseCoin]} />
      </section>
      <PercentButton currValue={value} value={maxVolume} onChange={(amount) => onChange(Number(amount))} />
    </div>
  )
}

export default QuantityInput
