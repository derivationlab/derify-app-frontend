import React, { FC, useState, useMemo, ChangeEvent, useContext } from 'react'

import { MobileContext } from '@/context/Mobile'

import BalanceShow from '@/components/common/Wallet/BalanceShow'
import ChangePercent from '@/components/common/ChangePercent'

interface Props {
  data: Record<string, any>[]
  onChange: (item: Record<string, any>, index: number) => void
}

const Options: FC<Props> = ({ data, onChange }) => {
  const { mobile } = useContext(MobileContext)

  const [keyword, setKeyword] = useState<string>('')
  const searchFC = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value.trim().toLocaleLowerCase())
  }
  const options = useMemo(() => {
    return data.filter((item) => {
      return item.name && item.name.toLocaleLowerCase().includes(keyword)
    })
  }, [data, keyword])

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
                  <h5>{item.name}</h5>
                  <BalanceShow value={item?.apy ?? 0} percent unit="APY" />
                </aside>
                <aside>
                  <BalanceShow value={item?.spotPrice ?? 0} unit="" />
                  <ChangePercent value={item?.price_change_rate ?? 0} />
                </aside>
              </>
            ) : (
              <>
                <h5>{item.name}</h5>
                <BalanceShow value={item?.spotPrice ?? 0} unit="" />
                <ChangePercent value={item?.price_change_rate ?? 0} />
                <BalanceShow value={item?.apy ?? 0} percent unit="APY" />
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Options
