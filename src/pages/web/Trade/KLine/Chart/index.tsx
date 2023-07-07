import React, { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useDerivativeListStore } from '@/store'

import Chart from './Chart'

const Index: FC = () => {
  const { t } = useTranslation()
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)

  return derivativeList.length ? (
    <Chart />
  ) : (
    <div className="web-trade-kline-placeholder">{t('Trade.kline.NoKLineData')}</div>
  )
}

export default Index
