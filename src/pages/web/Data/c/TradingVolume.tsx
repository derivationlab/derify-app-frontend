import classNames from 'classnames'
import { getDerivativeList, getHistoryTradingDAT } from 'derify-apis-v22'
import { isArray, uniqBy } from 'lodash-es'

import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { BarChart } from '@/components/common/Chart'
import { DropDownList, DropDownListItem } from '@/components/common/DropDownList'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { TRADING_VISIBLE_COUNT } from '@/config'
import { timeLineOptions, matchTimeLineOptions } from '@/data'
import { useCurrentTrading } from '@/hooks/useCurrentTrading'
import { useDerivativeListStore, useMarginTokenStore, useProtocolConfigStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { dayjsStartOf, keepDecimals } from '@/utils/tools'

const time = dayjsStartOf()
const all = {
  name: 'All Derivatives',
  token: 'all'
}
let output: Rec = {
  day_time: time,
  trading_amount: 0
}

interface PairOptionsInit {
  data: Rec[]
  loaded: boolean
}

let seqCount = 0

const TradingVolume: FC = () => {
  const bottomRef = useRef<any>()
  const observerRef = useRef<IntersectionObserver | null>()
  const { t } = useTranslation()

  const [tradingData, setTradingData] = useState<Record<string, any>[]>([])
  const [pairOptions, setPairOptions] = useState<PairOptionsInit>({ data: [], loaded: false })
  const [timeSelectVal, setTimeSelectVal] = useState<string>('3M')
  const [derivativeSel, setDerivativeSel] = useState<typeof all>(all)
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const derivativeList = useDerivativeListStore((state) => state.derivativeList)
  const protocolConfig = useProtocolConfigStore((state) => state.protocolConfig)
  const { data: tradingVolume } = useCurrentTrading(derivativeSel.token, marginToken.address)

  const decimals = useMemo(() => {
    return Number(tradingVolume?.[0]?.trading_amount ?? 0) === 0 ? 2 : marginToken.decimals
  }, [tradingVolume, marginToken])

  const combineDAT = useMemo(() => {
    if (tradingVolume) output = { day_time: time, ...tradingVolume[0] }
    return [...tradingData, output]
  }, [tradingData, tradingVolume])

  const currentTimeLine = useMemo(() => timeLineOptions.find((time) => time === timeSelectVal), [timeSelectVal])

  const historyDAT = useCallback(async () => {
    const { data: trading } = await getHistoryTradingDAT<{ data: Rec[] }>(
      derivativeSel.token,
      matchTimeLineOptions[timeSelectVal],
      marginToken.address
    )

    if (isArray(trading)) {
      // Huge data will have hidden dangers todo
      const convert = trading.map((o) => ({ ...o, trading_amount: Number(o.trading_amount) })).reverse()
      setTradingData(convert)
    }
  }, [timeSelectVal, derivativeSel])

  const morePairs = useCallback(async () => {
    const { data } = await getDerivativeList<{ data: Rec }>(marginToken.address, seqCount, TRADING_VISIBLE_COUNT)
    if (protocolConfig && data?.records) {
      const filter = data.records.filter((r: Rec) => r.open)
      const combine = [...pairOptions.data, ...filter]
      const deduplication = uniqBy(combine, 'token')
      setPairOptions((val: any) => ({ ...val, data: deduplication, loaded: false }))
      if (data.records.length === 0 || data.records.length < TRADING_VISIBLE_COUNT) seqCount = seqCount - 1
    }
  }, [protocolConfig, pairOptions.data])

  useEffect(() => {
    void historyDAT()
  }, [historyDAT, timeSelectVal, derivativeSel])

  useEffect(() => {
    if (pairOptions.data.length) {
      const intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.target.id === 'bottom') {
              seqCount += 1
              void morePairs()
            }
          })
        },
        { threshold: 0.2 }
      )
      if (bottomRef.current) {
        intersectionObserver.observe(bottomRef.current)
        observerRef.current = intersectionObserver
      }
    }
    return () => {
      observerRef.current && observerRef.current.disconnect()
    }
  }, [pairOptions.data.length])

  useEffect(() => {
    if (derivativeList.length) {
      setPairOptions({ data: [all, ...derivativeList], loaded: false })
    }
  }, [derivativeList])

  return (
    <div className="web-data-chart">
      <header className="web-data-chart-header">
        <h3>
          {t('Dashboard.TradingVolume', 'Trading Volume')} :
          <BalanceShow
            value={keepDecimals(tradingVolume?.[0]?.trading_amount ?? 0, 2)}
            unit={marginToken.symbol}
            decimal={decimals}
          />
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
          <DropDownList
            entry={
              <div className="web-select-show-button">
                <span>{derivativeSel?.name}</span>
              </div>
            }
            height={isMobile ? 244 : 284}
            loading={pairOptions.loaded}
            showSearch={false}
          >
            {pairOptions.data.map((o: any, index: number) => {
              const len = pairOptions.data.length
              const id = index === len - 1 ? 'bottom' : undefined
              const ref = index === len - 1 ? bottomRef : null
              return (
                <DropDownListItem
                  key={o.name}
                  id={id}
                  ref={ref}
                  content={o.name}
                  onSelect={() => {
                    setDerivativeSel(o)
                  }}
                  className={classNames({
                    active: derivativeSel.name === o.name
                  })}
                />
              )
            })}
          </DropDownList>
        </aside>
      </header>
      <main className="web-data-chart-main">
        {/*<AreaChart*/}
        {/*  chartId="TradingVolume"*/}
        {/*  data={tradingData}*/}
        {/*  xKey="day_time"*/}
        {/*  timeFormatStr={timeSelectVal !== '1D' ? 'MM/DD' : 'HH:mm'}*/}
        {/*  yKey="trading_amount"*/}
        {/*  yLabel="Trading Volume"*/}
        {/*/>*/}
        <BarChart
          data={combineDAT}
          xKey="day_time"
          chartId="PositionVolume"
          yFormat={[
            {
              label: 'Volume',
              value: 'trading_amount',
              color: '#E7446B'
            }
          ]}
          enableLegend={false}
          timeFormatStr={'YYYY-MM-DD'}
        />
      </main>
    </div>
  )
}

export default TradingVolume
