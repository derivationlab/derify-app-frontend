import React, { FC, useState, useMemo, ChangeEvent, useContext } from 'react'
import { keepDecimals } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { useDerivativeListStore, useMarginIndicatorsStore, useTokenSpotPricesStore } from '@/store'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'

interface Props {
  onChange: (item: Record<string, any>, index: number) => void
}

/**
 * todo:
 * 1. Bottom loading
 * 2. Trading pair search
 */
const Options: FC<Props> = ({ onChange }) => {
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
        <input type="text" placeholder="Search derivatives" onChange={_onChange} />
        <i />
      </div>
      <ul>
        {options.map((item, index) => (
          <li key={index} onClick={() => onChange(item, index)}>
            {mobile ? (
              <>
                <aside>
                  <h5>{item.name}</h5>
                  <BalanceShow value={marginIndicators?.[item.token]?.apy} percent unit="APR" />
                </aside>
                <aside>
                  <BalanceShow value={tokenSpotPrices?.[item.name] ?? 0} unit="" />
                  <ChangePercent value={marginIndicators?.[item.token]?.price_change_rate} />
                </aside>
              </>
            ) : (
              <>
                <h5>{item.name}</h5>
                <BalanceShow value={keepDecimals(tokenSpotPrices?.[item.name], 2)} unit="" />
                <ChangePercent value={marginIndicators?.[item.token]?.price_change_rate} />
                <BalanceShow value={marginIndicators?.[item.token]?.apy} percent unit="APR" />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Options
