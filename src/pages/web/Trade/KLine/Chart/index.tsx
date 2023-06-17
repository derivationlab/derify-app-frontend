import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useQuoteTokenStore } from '@/store'
import { QuoteTokenState } from '@/store/types'

import Chart from './Chart'

const Index: FC = () => {
  const { t } = useTranslation()
  const quoteToken = useQuoteTokenStore((state: QuoteTokenState) => state.quoteToken)

  return quoteToken.token ? (
    <Chart />
  ) : (
    <div className="web-trade-kline-placeholder">{t('Trade.kline.NoKLineData')}</div>
  )
}

export default Index
