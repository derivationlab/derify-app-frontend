import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { MARGIN_TOKENS } from '@/config/tokens'
import { useMarginToken } from '@/zustand'
import { MarginTokenKeys } from '@/typings'
import { useContractConfig } from '@/store/config/hooks'

import { Select } from '@/components/common/Form'

const Margin: FC = () => {
  const { t } = useTranslation()

  const { marginToken } = useContractConfig()

  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  const marginSelect = MARGIN_TOKENS.map((t) => t.symbol)

  return (
    <div className="web-trade-bench-margin">
      <label htmlFor="Margin">{t('Trade.Bench.Margin')}</label>
      <Select
        className="web-trade-bench-margin-select"
        value={marginToken}
        options={marginSelect}
        onChange={(v) => {
          updateMarginToken(v as MarginTokenKeys)
        }}
      />
    </div>
  )
}

export default Margin
