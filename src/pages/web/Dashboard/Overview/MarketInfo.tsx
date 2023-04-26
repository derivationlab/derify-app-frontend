import Table from 'rc-table'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isEmpty, orderBy } from 'lodash'
import React, { FC, useMemo, useState, useContext, useReducer, useCallback, useEffect } from 'react'

import { useConfigInfoStore } from '@/store'
import { MobileContext } from '@/providers/Mobile'
import { MarginTokenKeys } from '@/typings'
import { reducer, stateInit } from '@/reducers/records'
import { bnMul, keepDecimals } from '@/utils/tools'
import { STATIC_RESOURCES_URL } from '@/config'
import { getMarginTokenList } from '@/api'
import { useBuyBackPool, usePositionInfo } from '@/hooks/useDashboard'
import { useMulCurrentTradingAmount, usePairIndicators } from '@/hooks/useQueryApi'

// import { Input } from '@/components/common/Form'
import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { TableMargin } from '../c/TableCol'

const MarketInfo: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const factoryConfig = useConfigInfoStore((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfoStore((state) => state.factoryConfigLoaded)

  const { data: indicators } = usePairIndicators()
  const { data: exchangeInfo } = useBuyBackPool()
  const { data: tradingAmount } = useMulCurrentTradingAmount()
  const { data: positionInfo, refetch: positionInfoRefetch } = usePositionInfo(factoryConfig)

  // const [keyword, setKeyword] = useState('')
  const [keyword] = useState('')

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.Overview.Margin'),
        dataIndex: 'name',
        render: (_: string, data: Record<string, any>) => (
          <TableMargin icon={`${STATIC_RESOURCES_URL}market/${data.symbol.toLowerCase()}.svg`} name={data.symbol} />
        )
      },
      {
        title: 'Trading/Position',
        dataIndex: 'symbol',
        render: (symbol: string) => (
          <>
            <BalanceShow value={tradingAmount[symbol]} unit={symbol} />
            <BalanceShow value={positionInfo[symbol as MarginTokenKeys]} unit={symbol} />
          </>
        )
      },
      {
        title: 'Max APR',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const apy = Math.max.apply(null, Object.values(indicators[symbol as MarginTokenKeys]))
          const per = keepDecimals(bnMul(apy, 100), 2)
          return <DecimalShow value={per} percent black />
        }
      }
    ]
  }, [t, indicators, exchangeInfo, positionInfo])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.Overview.MaxPositionMiningAPY'),
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const apy = Math.max.apply(null, Object.values(indicators[symbol as MarginTokenKeys]))
          return <BalanceShow value={apy} percent />
        }
      },
      {
        title: t('NewDashboard.Overview.TradingVolume'),
        dataIndex: 'symbol',
        render: (symbol: string) => {
          return <BalanceShow value={tradingAmount[symbol]} unit={symbol} />
        }
      },
      {
        title: t('NewDashboard.Overview.PositionVolume'),
        dataIndex: 'symbol',
        render: (symbol: string) => <BalanceShow value={positionInfo[symbol as MarginTokenKeys]} unit={symbol} />
      },
      {
        title: t('NewDashboard.Overview.BuybackPool'),
        dataIndex: 'symbol',
        render: (symbol: string) => <BalanceShow value={exchangeInfo[symbol as MarginTokenKeys]} unit={symbol} />
      },
      {
        title: t('NewDashboard.Overview.DetailInfo'),
        dataIndex: 'Margin',
        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, indicators, exchangeInfo, positionInfo])

  const emptyText = useMemo(() => {
    if (state.records.loaded) return t('common.Loading')
    if (isEmpty(state.records.records)) return t('NewDashboard.Overview.NoResultsFound')
    return ''
  }, [t, state.records])

  // const onSearch = () => {
  //   if (keyword) {
  //     console.log('Search keyword: ' + keyword)
  //   }
  // }

  // todo search
  // const debounceSearch = useCallback(
  //   debounce((keyword: string) => {
  //     void fetchData(0)
  //   }, 1000),
  //   []
  // )

  const fetchData = useCallback(
    async (index = 0) => {
      // keyword
      const { data } = await getMarginTokenList(index, 10)

      // console.info(data)

      const sort = orderBy(data?.records ?? [], ['max_pm_apy', 'open'], 'desc')

      dispatch({
        type: 'SET_RECORDS',
        payload: { records: sort, totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [keyword]
  )

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  useEffect(() => {
    void fetchData()
  }, [])

  // useEffect(() => {
  //   if (keyword) {
  //     dispatch({
  //       type: 'SET_MARKET_DAT',
  //       payload: { records: [], totalItems: 0, isLoaded: true }
  //     })
  //
  //     void debounceSearch(keyword)
  //   }
  // }, [keyword])

  useEffect(() => {
    if (factoryConfigLoaded && factoryConfig) {
      void positionInfoRefetch()
    }
  }, [factoryConfig, factoryConfigLoaded])

  return (
    <div className="web-dashboard-overview-market">
      <header className="web-dashboard-section-header">
        <h3>{t('NewDashboard.Overview.MarketInfo')}</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder={t('NewDashboard.Overview.SerchTip')}>*/}
          {/*  <button className='web-dashboard-section-header-search-button' onClick={onSearch} />*/}
          {/*</Input>*/}
        </div>
      </header>
      <Table
        rowKey="symbol"
        data={state.records.records}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MarketInfo
