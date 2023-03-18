import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo } from 'react'

import { MARGIN_TOKENS } from '@/config/tokens'
import { useTokenBalances } from '@/zustand'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { nonBigNumberInterception } from '@/utils/tools'

import { Select } from '@/components/common/Form'
import Image from '@/components/common/Image'

const Margin: FC = () => {
  const history = useHistory()

  const { t } = useTranslation()

  const balances = useTokenBalances((state) => state.balances)

  const { marginToken } = useMTokenFromRoute()

  const marginOptions = useMemo(() => {
    return MARGIN_TOKENS.map((t) => {
      return {
        value: t.symbol,
        label: t.symbol,
        icon: 'icon/bnb.svg',
        price: balances[t.symbol] ?? 0,
        decimals: 2
      }
    })
  }, [balances])

  // todo 完善ui
  return (
    <div className="web-trade-bench-margin">
      <label htmlFor="Margin">{t('Trade.Bench.Margin')}</label>
      <Select
        value={marginToken}
        onChange={(v) => {
          history.push(`/${v}/trade`)
        }}
        objOptions={marginOptions}
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
