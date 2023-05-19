import React, { FC } from 'react'
import Chart from './Chart'
import HeaderData from './HeaderData'
import SymbolSelect from './SymbolSelect'

const KLine: FC = () => {
  const hideChart = false

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
