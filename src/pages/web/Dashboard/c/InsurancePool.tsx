import React, { FC, useCallback, useEffect, useState } from 'react'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'

import { SelectTimesOptions, SelectTimesValues } from '@/data'
import { getCurrentInsuranceData, getHistoryInsuranceData } from '@/api'

import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { AreaChart } from '@/components/common/Chart'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'

const InsurancePool: FC = () => {
  const { t } = useTranslation()
  const [timeSelectVal, setTimeSelectVal] = useState<string>('1M')
  const [insuranceData, setInsuranceData] = useState<Record<string, any>[]>([])
  const [insuranceVolume, setInsuranceVolume] = useState<string>('0')

  const getInsuranceDataCb = useCallback(async () => {
    const { data: current } = await getCurrentInsuranceData()
    const { data: history } = await getHistoryInsuranceData(SelectTimesValues[timeSelectVal])

    setInsuranceVolume(current?.insurance_pool ?? 0)

    if (isArray(history)) {
      // Huge data will have hidden dangers todo
      const convert = history.map((o) => ({ ...o, insurance_pool: Number(o.insurance_pool) })).reverse()
      setInsuranceData(convert)
    }
  }, [timeSelectVal])

  useEffect(() => {
    void getInsuranceDataCb()
  }, [getInsuranceDataCb, timeSelectVal])

  return (
    <div className="web-dashborad-chart">
      <header className="web-dashborad-chart-header">
        <h3>
          {t('Dashboard.InsurancePool', 'Insurance Pool')} :
          <BalanceShow value={insuranceVolume} unit={BASE_TOKEN_SYMBOL} format={false} />
        </h3>
        <aside>
          <Select
            value={timeSelectVal}
            options={SelectTimesOptions}
            onChange={(value) => setTimeSelectVal(String(value))}
          />
        </aside>
      </header>
      <main className="web-dashborad-chart-main">
        <AreaChart
          chartId="InsurancePool"
          data={insuranceData}
          xKey="day_time"
          timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}
          yKey="insurance_pool"
          yLabel="Volume"
        />
      </main>
    </div>
  )
}

export default InsurancePool
