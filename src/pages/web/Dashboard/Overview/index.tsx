import React, { FC } from 'react'

import MarketInfo from './MarketInfo'
import PositionChart from './PositionChart'
import TradingChart from './TradingChart'

const Overview: FC = () => {
  return (
    <div className="web-dashboard">
      <div className="web-dashboard-overview-charts-layout">
        <TradingChart />
        <PositionChart />
      </div>
      <MarketInfo />
    </div>
  )
}

export default Overview
