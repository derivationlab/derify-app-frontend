import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import Input from '@/components/common/Form/Input'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

interface InputProps {
  value: number | string
  onChange: (value: number) => void
  disabled?: boolean
}

const PriceInput: FC<InputProps> = ({ value, disabled, onChange }) => {
  const { t } = useTranslation()
  return (
    <div className="web-trade-bench-price-input">
      {disabled ? (
        <div className="web-trade-bench-price-input-disabled">{t('Trade.Bench.MarketPrice', 'Market Price')}</div>
      ) : (
        <Input
          type="number"
          value={value}
          onChange={(val) => onChange(Number(val))}
          suffix={VALUATION_TOKEN_SYMBOL}
          placeholder=""
        />
      )}
    </div>
  )
}

export default PriceInput
