import React, { FC } from 'react'

import SymbolSelect from './SymbolSelect'
import HeaderData from './HeaderData'
import Chart from './Chart'

const KLine: FC = () => {
  const hideChart = true
  return (
    <div className="web-trade-kline">
      <header className="web-trade-kline-header">
        <SymbolSelect />
        <HeaderData />
      </header>
      {!hideChart ? <Chart /> : null}
    </div>
  )
}

export default KLine
