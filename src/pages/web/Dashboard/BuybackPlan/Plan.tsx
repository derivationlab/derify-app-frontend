import Table from 'rc-table'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import React, { FC, useMemo, useState, useContext, useEffect, useReducer, useCallback } from 'react'

import { MobileContext } from '@/providers/Mobile'
import { useBuyBackPool } from '@/hooks/useBuyBackPool'
import { BENCHMARK_TOKEN } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/marketInfo'
import { STATIC_RESOURCES_URL } from '@/config'
import { getBuyBackMarginTokenList } from '@/api'

// import { Input } from '@/components/common/Form'
import Pagination from '@/components/common/Pagination'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

import { TableMargin, TableCountDown } from '../c/TableCol'
import { MarginTokenKeys } from '@/typings'
// import { useConfigInfo } from '@/store'
import { useBlockNumber } from 'wagmi'
import { useTranslation } from 'react-i18next'
// import { calcDateDuration } from '@/utils/tools'
import Button from '@/components/common/Button'

const Plan: FC = () => {
  const { t } = useTranslation()

  const [state, dispatch] = useReducer(reducer, stateInit)

  const { data: blockNumber = 0 } = useBlockNumber()

  const { mobile } = useContext(MobileContext)

  const { data: buyBackInfo } = useBuyBackPool()

  // const [keyword, setKeyword] = useState('')
  const [keyword] = useState('')

  // const mTokenPrices = useConfigInfo((state) => state.mTokenPrices)

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
        title: 'Pool/DRF Price',
        dataIndex: 'symbol',
        align: 'right',
        render: (symbol: MarginTokenKeys, data: Record<string, any>) => (
          <>
            <BalanceShow value={buyBackInfo[symbol]} unit={symbol} />
            <BalanceShow value={data?.last_drf_price} unit={BENCHMARK_TOKEN.symbol} />
          </>
        )
      },
      {
        title: 'Blocks/Time',
        dataIndex: 'RemainingBlock',
        align: 'right',
        render: (value: number, data: Record<string, any>) => {
          const block = data.open ? Number(data?.buyback_period) + Number(data?.last_buy_back_block) - blockNumber : 0
          return (
            <>
              <BalanceShow value={block} rule="0,0" unit="Block" />
              <TableCountDown timestamp={3679394727481} />
            </>
          )
        }
      }
    ]
  }, [t, blockNumber])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: 'Buyback Cycle',
        dataIndex: 'buyback_period',
        render: (value: number) => <BalanceShow value={value} rule="0,0" unit="Block" />
      },
      {
        title: 'Buyback Pool',
        dataIndex: 'symbol',
        render: (symbol: MarginTokenKeys) => <BalanceShow value={buyBackInfo[symbol]} unit={symbol} />
      },
      {
        title: 'DRF Price(Last Cycle)',
        dataIndex: 'last_drf_price',
        render: (value: number) => <BalanceShow value={value} unit={BENCHMARK_TOKEN.symbol} />
      },
      {
        title: 'Remaining block',
        dataIndex: 'last_buy_back_block',
        render: (value: number, data: Record<any, any>) => {
          const block = data.open ? Number(data?.buyback_period) + Number(data?.last_buy_back_block) - blockNumber : 0
          return <BalanceShow value={block} rule="0,0" unit="Block" />
        }
      },
      {
        title: 'Estimated Time', // todo
        dataIndex: 'symbol',
        render: (symbol: symbol, data: Record<string, any>) => {
          const timestamp = data.open
            ? (Number(data?.buyback_period) + Number(data?.last_buy_back_block)) * 3 * 1000
            : 0
          return <TableCountDown timestamp={timestamp} />
        }
      }
    ]
  }, [t, blockNumber])

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
  //   debounce(() => {
  //     void fetchData(0)
  //   }, 1000),
  //   []
  // )

  const fetchData = useCallback(
    async (index = 0) => {
      // keyword
      const { data } = await getBuyBackMarginTokenList(index, 10)

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

  // useEffect(() => {
  //   if (keyword) {
  //     dispatch({
  //       type: 'SET_MARKET_DAT',
  //       payload: { records: [], totalItems: 0, isLoaded: true }
  //     })
  //
  //     void debounceSearch()
  //   }
  // }, [keyword])

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-dashboard-plan-list">
      <header className="web-dashboard-section-header">
        <h3>Buyback Plan</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder="search name or contract address...">*/}
          {/*  <button className="web-dashboard-section-header-search-button" onClick={onSearch} />*/}
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

export default Plan
