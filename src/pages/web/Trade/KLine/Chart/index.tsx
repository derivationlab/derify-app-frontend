import React, { FC } from 'react'

import { useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import Chart from './Chart'

const Index: FC = () => {
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)

  return quoteToken.token ? <Chart /> : <div className="web-trade-kline-placeholder">No K-Line Trading Data</div>
}

export default Index
