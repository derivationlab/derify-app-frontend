import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { MARGIN_TOKENS } from '@/config/tokens'
import { MarginTokenKeys } from '@/typings'
import { useMarginToken, useTokenBalances } from '@/zustand'
import { nonBigNumberInterception } from '@/utils/tools'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

const Margin: FC = () => {
  const { t } = useTranslation()

  const balances = useTokenBalances((state) => state.balances)
  const marginToken = useMarginToken((state) => state.marginToken)
  const updateMarginToken = useMarginToken((state) => state.updateMarginToken)

  // console.info(balances)

  const marginSelect = MARGIN_TOKENS.map((t) => {
    return {
      value: t.symbol,
      label: t.symbol,
      icon: 'icon/bnb.svg',
      price: balances[t.symbol] ?? 0,
      decimals: 2
    }
  })

  // todo 完善ui
  return (
    <div className="web-trade-bench-margin">
      <label htmlFor="Margin">{t('Trade.Bench.Margin')}</label>
      <Select
        value={marginToken}
        onChange={(v) => {
          updateMarginToken(v as MarginTokenKeys)
        }}
        objOptions={marginSelect}
        renderer={(props) => (
          <div className="web-select-options-item">
            <span>
              {props.icon && <Image src={props.icon} />}
              {props.label}
            </span>
            {nonBigNumberInterception(props.price)}
          </div>
        )}
        className="web-trade-bench-margin-select"
      />
    </div>
  )
}

export default Margin
