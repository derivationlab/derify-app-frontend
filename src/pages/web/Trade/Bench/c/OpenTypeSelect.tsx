import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { Select } from '@/components/common/Form'
import { PositionOrderTypes } from '@/typings'

interface Props {
  value: string | number
  onChange: (value: number) => void
}

const OpenTypeSelect: FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation()

  const openTypeOptions = [
    {
      label: t('Trade.Bench.MarketPrice', 'Market Price'),
      value: PositionOrderTypes.Market
    },
    {
      label: t('Trade.Bench.LimitPrice', 'Limit Price'),
      value: PositionOrderTypes.Limit
    }
  ]

  return (
    <Select
      className="web-trade-bench-open-type"
      value={value}
      onChange={(val) => onChange(Number(val))}
      objOptions={openTypeOptions}
    />
  )
}

export default OpenTypeSelect
