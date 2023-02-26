import React, { FC } from 'react'

import TradingChart from './TradingChart'
import PositionChart from './PositionChart'
import MarketInfo from './MarketInfo'

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
