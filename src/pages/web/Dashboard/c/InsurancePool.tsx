import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import days from 'dayjs'
import { useInterval } from 'react-use'

import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { SelectTimesOptions, SelectTimesValues } from '@/data'
import { getCurrentInsuranceData, getHistoryInsuranceData } from '@/api'

import { AreaChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const time = days().utc().startOf('days').format()

const InsurancePool: FC = () => {
  const { t } = useTranslation()

  const [timeSelectVal, setTimeSelectVal] = useState<string>('1M')
  const [insuranceData, setInsuranceData] = useState<Record<string, any>[]>([])
  const [insuranceVolume, setInsuranceVolume] = useState<Record<string, any>>({})

  const getInsuranceDataCb = useCallback(async () => {
    const { data: history } = await getHistoryInsuranceData(SelectTimesValues[timeSelectVal])

    if (isArray(history)) {
      // Huge data will have hidden dangers todo
      const convert = history.map((o) => ({ ...o, insurance_pool: Number(o.insurance_pool) })).reverse()
      setInsuranceData(convert)
    }
  }, [timeSelectVal])

  const getInsuranceVolumeFunc = async () => {
    const { data: current } = await getCurrentInsuranceData()

    setInsuranceVolume({ ...current, day_time: time })
  }

  const memoCombineData = useMemo(() => [...insuranceData, insuranceVolume], [insuranceData, insuranceVolume])

  useInterval(() => {
    void getInsuranceVolumeFunc()
  }, 10000)

  useEffect(() => {
    setInsuranceData([])

    void getInsuranceDataCb()
  }, [getInsuranceDataCb, timeSelectVal])

  useEffect(() => {
    void getInsuranceVolumeFunc()
  }, [])

  return (
    <div className="web-dashborad-chart">
      <header className="web-dashborad-chart-header">
        <h3>
          {t('Dashboard.InsurancePool', 'Insurance Pool')} :
          <BalanceShow value={insuranceVolume?.insurance_pool ?? 0} unit={BASE_TOKEN_SYMBOL} format={false} />
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
          data={memoCombineData}
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
