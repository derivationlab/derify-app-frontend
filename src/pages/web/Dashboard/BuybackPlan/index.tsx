import React, { FC } from 'react'

import { useMarginPriceFeed } from '@/hooks/useAllMarginPrice'
import { useBuyBackPool } from '@/hooks/useDashboard'
import { useMarginTokenListStore } from '@/store'

import Data from './Data'
import Plan from './Plan'

const BuybackPlan: FC = () => {
  const allMarginTokenList = useMarginTokenListStore((state) => state.allMarginTokenList)

  const { priceFeed } = useMarginPriceFeed(allMarginTokenList)
  const { data: buyBackInfo } = useBuyBackPool(allMarginTokenList)

  return (
    <div className="web-dashboard">
      <Data buyBackInfo={buyBackInfo ?? {}} priceFeed={priceFeed ?? {}} />
      <Plan buyBackInfo={buyBackInfo ?? {}} />
    </div>
  )
}

export default BuybackPlan
