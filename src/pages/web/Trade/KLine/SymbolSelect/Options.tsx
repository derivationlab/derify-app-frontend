import { getAddress } from '@ethersproject/address'

import React, { FC, useState, useMemo, ChangeEvent, useContext } from 'react'
import { useTranslation } from 'react-i18next'

import ChangePercent from '@/components/common/ChangePercent'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { MobileContext } from '@/providers/Mobile'
import { useDerivativeListStore, useMarginIndicatorsStore, useTokenSpotPricesStore } from '@/store'
import { keepDecimals } from '@/utils/tools'

interface Props {
  onChange: (item: Record<string, any>, index: number) => void
}

/**
 * todo:
 * 1. Bottom loading
 * 2. Trading pair search
 */
const Options: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const tokenSpotPrices = useTokenSpotPricesStore((state) => state.tokenSpotPrices)
  const marginIndicators = useMarginIndicatorsStore((state) => state.marginIndicators)

  const [keyword, setKeyword] = useState<string>('')

  const options = useMemo(() => {
    if (derivativeList.length)
      return derivativeList.filter((derivative) => derivative.name.toLocaleLowerCase().includes(keyword))
    return []
  }, [keyword, derivativeList])

  const _onChange = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value.trim().toLocaleLowerCase())
  }

  return (
    <div className="web-trade-symbol-select-options">
      <div className="web-trade-symbol-select-search">
        <input type="text" placeholder={t('Trade.kline.SearchTip')} onChange={_onChange} />
        <i />
      </div>
      <div className="web-trade-symbol-select-container">
        <ul>
          {options.map((item, index) => {
            const keys = Object.keys(marginIndicators ?? [])
            const findKey = keys.find((key) => getAddress(key) === getAddress(item.token))
            const values = marginIndicators?.[findKey ?? ''] ?? Object.create(null)
            const decimals = Number(tokenSpotPrices?.[item.name] ?? 0) === 0 ? 2 : item.price_decimals
            return (
              <li key={index} onClick={() => onChange(item, index)}>
                {mobile ? (
                  <>
                    <aside>
                      <h5>{item.name}</h5>
                      <BalanceShow value={values?.apy ?? 0} percent unit="APR" />
                    </aside>
                    <aside>
                      <BalanceShow value={tokenSpotPrices?.[item.name] ?? 0} decimal={decimals} />
                      <ChangePercent value={values?.price_change_rate ?? 0} />
                    </aside>
                  </>
                ) : (
                  <>
                    <h5>{item.name}</h5>
                    <BalanceShow value={tokenSpotPrices?.[item.name] ?? 0} decimal={decimals} />
                    <ChangePercent value={values?.price_change_rate ?? 0} />
                    <BalanceShow value={values?.apy ?? 0} percent unit="APR" />
                  </>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default Options
