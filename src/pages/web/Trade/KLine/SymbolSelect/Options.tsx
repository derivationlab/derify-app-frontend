import React, { FC, useState, useMemo, ChangeEvent, useContext } from 'react'

import { MobileContext } from '@/context/Mobile'
import { useMarginToken, usePairsInfo } from '@/zustand'
import { BASE_TOKEN_SYMBOL, QUOTE_TOKENS } from '@/config/tokens'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'

interface Props {
  onChange: (item: Record<string, any>, index: number) => void
}

const Options: FC<Props> = ({ onChange }) => {
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)
  const spotPrices = usePairsInfo((state) => state.spotPrices)

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
                    {item.symbol}-{BASE_TOKEN_SYMBOL}
                  </h5>
                  <BalanceShow value={0} percent unit="APR" />
                </aside>
                <aside>
                  <BalanceShow value={spotPrices[marginToken][item.symbol] ?? 0} unit="" />
                  <ChangePercent value={0} />
                </aside>
              </>
            ) : (
              <>
                <h5>
                  {item.symbol}-{BASE_TOKEN_SYMBOL}
                </h5>
                <BalanceShow value={spotPrices[marginToken][item.symbol] ?? 0} unit="" />
                <ChangePercent value={0} />
                <BalanceShow value={0} percent unit="APR" />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Options
