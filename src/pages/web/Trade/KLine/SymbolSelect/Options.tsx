import React, { FC, useState, useMemo, ChangeEvent, useContext } from 'react'

import { usePairsInfo } from '@/zustand'
import { MobileContext } from '@/providers/Mobile'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { QUOTE_TOKENS, VALUATION_TOKEN_SYMBOL } from '@/config/tokens'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'
import { keepDecimals } from '@/utils/tools'

interface Props {
  onChange: (item: Record<string, any>, index: number) => void
}

const Options: FC<Props> = ({ onChange }) => {
  const { mobile } = useContext(MobileContext)

  const indicators = usePairsInfo((state) => state.indicators)
  const spotPrices = usePairsInfo((state) => state.spotPrices)

  const { marginToken } = useMTokenFromRoute()

  const [keyword, setKeyword] = useState<string>('')

  const options = useMemo(() => {
    return QUOTE_TOKENS.filter((item) => item.symbol.toLocaleLowerCase().includes(keyword))
  }, [keyword])

  const searchFC = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value.trim().toLocaleLowerCase())
  }

  return (
    <div className="web-trade-symbol-select-options">
      <div className="web-trade-symbol-select-search">
        <input type="text" placeholder="Search derivatives" onChange={searchFC} />
        <i />
      </div>
      <ul>
        {options.map((item, index) => (
          <li key={index} onClick={() => onChange(item, index)}>
            {mobile ? (
              <>
                <aside>
                  <h5>
                    {item.symbol}
                    {VALUATION_TOKEN_SYMBOL}
                  </h5>
                  <BalanceShow value={indicators[item.symbol]?.apy} percent unit="APR" />
                </aside>
                <aside>
                  <BalanceShow value={spotPrices[marginToken][item.symbol] ?? 0} unit="" />
                  <ChangePercent value={indicators[item.symbol]?.price_change_rate} />
                </aside>
              </>
            ) : (
              <>
                <h5>
                  {item.symbol}
                  {VALUATION_TOKEN_SYMBOL}
                </h5>
                <BalanceShow value={keepDecimals(spotPrices[marginToken][item.symbol], 2)} unit="" />
                <ChangePercent value={indicators[item.symbol]?.price_change_rate} />
                <BalanceShow value={indicators[item.symbol]?.apy} percent unit="APR" />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Options
