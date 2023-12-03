import classNames from 'classnames'
import { getHistoryInsuranceDAT } from 'derify-apis-v20'
import { isArray } from 'lodash-es'

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { AreaChart } from '@/components/common/Chart'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { timeLineOptions, matchTimeLineOptions } from '@/data'
import { useCurrentInsurance } from '@/hooks/useCurrentInsurance'
import { useMarginTokenStore } from '@/store'
import { Rec } from '@/typings'
import { dayjsStartOf } from '@/utils/tools'

const time = dayjsStartOf()

let output: Record<string, any> = {
  day_time: time,
  insurance_pool: 0
}

const InsurancePool: FC = () => {
  const { t } = useTranslation()
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [insuranceData, setInsuranceData] = useState<Record<string, any>[]>([])
  const marginToken = useMarginTokenStore((state) => state.marginToken)
  const { data: insuranceVolume } = useCurrentInsurance(marginToken.address)

  const decimals = useMemo(() => {
    return Number(insuranceVolume?.insurance_pool ?? 0) === 0 ? 2 : marginToken.decimals
  }, [insuranceVolume, marginToken])

  const combineDAT = useMemo(() => {
    if (insuranceVolume) {
      // console.info({ day_time: time, ...insuranceVolume })
      output = { day_time: time, ...insuranceVolume }
    }
    return [...insuranceData, output]
  }, [insuranceData, insuranceVolume])

  const currentTimeLine = useMemo(() => timeLineOptions.find((time) => time === timeSelectVal), [timeSelectVal])

  const historyDAT = useCallback(async () => {
    const { data: history } = await getHistoryInsuranceDAT<{ data: Rec[] }>(
      matchTimeLineOptions[timeSelectVal],
      marginToken.address
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
          <BalanceShow value={insuranceVolume?.insurance_pool ?? 0} unit={marginToken.symbol} decimal={decimals} />
        </h3>
        <aside>
          <DropDownList
            entry={
              <div className="web-select-show-button">
                <span>{currentTimeLine}</span>
              </div>
            }
            showSearch={false}
          >
            {timeLineOptions.map((o) => {
              return (
                <DropDownListItem
                  key={o}
                  content={o}
                  onSelect={() => setTimeSelectVal(o)}
                  className={classNames({
                    active: timeSelectVal === o
                  })}
                />
              )
            })}
          </DropDownList>
        </aside>
      </header>
      <main className="web-data-chart-main">
        <AreaChart
          data={combineDAT}
          xKey="day_time"
          yKey="insurance_pool"
          yLabel="Volume"
          chartId="InsurancePool"
          timeFormatStr={'YYYY-MM-DD'}
        />
      </main>
    </div>
  )
}

export default InsurancePool
