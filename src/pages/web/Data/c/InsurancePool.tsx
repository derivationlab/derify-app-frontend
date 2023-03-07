import days from 'dayjs'
import { isArray } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'

import { findToken } from '@/config/tokens'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { useCurrentInsuranceDAT } from '@/hooks/useQueryApi'
import { getHistoryInsuranceData } from '@/api'
import { SelectTimesOptions, SelectTimesValues } from '@/data'

import { AreaChart } from '@/components/common/Chart'
import Select from '@/components/common/Form/Select'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const time = days().utc().startOf('days').format()

const InsurancePool: FC = () => {
  const { t } = useTranslation()

  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [insuranceData, setInsuranceData] = useState<Record<string, any>[]>([])

  const marginToken = useMTokenFromRoute()

  const { data: insuranceVolume } = useCurrentInsuranceDAT(findToken(marginToken).tokenAddress)

  const combineDAT = useMemo(() => {
    let output
    if (insuranceVolume) {
      // console.info({ day_time: time, ...insuranceVolume })
      output = { day_time: time, ...insuranceVolume }
    }
    return [...insuranceData, output]
  }, [insuranceData, insuranceVolume])

  const historyDAT = useCallback(async () => {
    const { data: history } = await getHistoryInsuranceData(
      SelectTimesValues[timeSelectVal],
      findToken(marginToken).tokenAddress
    )

    if (isArray(history)) {
      // Huge data will have hidden dangers todo
      const convert = history.map((o) => ({ ...o, insurance_pool: Number(o.insurance_pool) })).reverse()
      setInsuranceData(convert)
    }
  }, [timeSelectVal, marginToken])

  useEffect(() => {
    void historyDAT()
  }, [historyDAT, timeSelectVal])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.InsurancePool', 'Insurance Pool')} :
          <BalanceShow value={insuranceVolume?.insurance_pool ?? 0} unit={marginToken} />
        </h3>
        <aside>
          <Select
            value={timeSelectVal}
            options={SelectTimesOptions}
            onChange={(value) => setTimeSelectVal(String(value))}
          />
        </aside>
      </header>
      <main className="web-data-chart-main">
        <AreaChart
          chartId="InsurancePool"
          data={combineDAT}
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
