import Table from 'rc-table'
import classNames from 'classnames'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import React, { FC, useMemo, useState, useContext, useReducer, useCallback, useEffect } from 'react'

import { bnMul, keepDecimals } from '@/utils/tools'
import { useConfigInfo } from '@/store'
import { MobileContext } from '@/providers/Mobile'
import { MarginTokenKeys } from '@/typings'
import { reducer, stateInit } from '@/reducers/marketInfo'
import { STATIC_RESOURCES_URL } from '@/config'
import { getDashboardMarginTokenList } from '@/api'
import { useMulCurrentTradingAmount, usePairIndicators, usePositionInfo } from '@/hooks/useMarketInfo'

// import { Input } from '@/components/common/Form'
import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import DecimalShow from '@/components/common/DecimalShow'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { TableMargin } from '../c/TableCol'
import { useBuyBackPool } from '@/hooks/useBuyBackPool'

const MarketInfo: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const factoryConfig = useConfigInfo((state) => state.factoryConfig)
  const factoryConfigLoaded = useConfigInfo((state) => state.factoryConfigLoaded)

  const { data: indicators } = usePairIndicators()
  const { data: exchangeInfo } = useBuyBackPool()
  const { data: tradingAmount } = useMulCurrentTradingAmount()
  const { data: positionInfo, refetch: positionInfoRefetch } = usePositionInfo(factoryConfig)

  // const [keyword, setKeyword] = useState('')
  const [keyword] = useState('')

  const mColumns = useMemo(() => {
    return [
      {
        title: 'Margin',
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
        title: 'Max APY',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const apy = Math.max.apply(null, Object.values(indicators[symbol as MarginTokenKeys]))
          const per = keepDecimals(bnMul(apy, 100), 2)
          return <DecimalShow value={per} percent black />
        }
      }
    ]
  }, [t, indicators, exchangeInfo])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: 'Max Position Mining APY',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const apy = Math.max.apply(null, Object.values(indicators[symbol as MarginTokenKeys]))
          const per = keepDecimals(bnMul(apy, 100), 2)
          return <DecimalShow value={per} percent black />
        }
      },
      {
        title: 'Trading Volume',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          return <BalanceShow value={tradingAmount[symbol]} unit={symbol} />
        }
      },
      {
        title: 'Position Volume',
        dataIndex: 'symbol',
        render: (symbol: string) => <BalanceShow value={positionInfo[symbol as MarginTokenKeys]} unit={symbol} />
      },
      {
        title: 'Buyback Pool',
        dataIndex: 'symbol',
        render: (symbol: string) => <BalanceShow value={exchangeInfo[symbol as MarginTokenKeys]} unit={symbol} />
      },
      {
        title: 'Detail Info',
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
    if (state.marketData.isLoaded) return 'Loading'
    if (isEmpty(state.marketData.records)) return 'No Record'
    return ''
  }, [state.marketData])

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
      const { data } = await getDashboardMarginTokenList(index, 10)

      // console.info(data)

      dispatch({
        type: 'SET_MARKET_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
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
        <h3>Market Info</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder='search name or contract address..'>*/}
          {/*  <button className='web-dashboard-section-header-search-button' onClick={onSearch} />*/}
          {/*</Input>*/}
        </div>
      </header>
      <Table
        rowKey="symbol"
        data={state.marketData.records}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className={classNames('web-broker-table', { 'web-space-table': mobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.marketData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MarketInfo
