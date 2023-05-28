import classNames from 'classnames'
import { isEmpty } from 'lodash'
import Table from 'rc-table'
import { useBlockNumber } from 'wagmi'

import React, { FC, useMemo, useState, useContext, useEffect, useReducer, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { getBuyBackPlans } from '@/api'
// import { Input } from '@/components/common/Form'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { useBuyBackPool } from '@/hooks/useDashboard'
import { MobileContext } from '@/providers/Mobile'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginPriceStore, useMarginTokenListStore } from '@/store'
import { MarginTokenKeys } from '@/typings'
import { isGT, isGTET } from '@/utils/tools'

import { TableMargin, TableCountDown } from '../c/TableCol'

// import Button from '@/components/common/Button'

const Plan: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber()
  const { mobile } = useContext(MobileContext)

  const marginPrice = useMarginPriceStore((state) => state.marginPrice)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)

  const { data: buyBackInfo } = useBuyBackPool(marginTokenList)

  // const [keyword, setKeyword] = useState('')
  const [keyword] = useState('')

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.BuybackPlan.Margin', 'Margin'),
        dataIndex: 'name',
        render: (_: string, data: Record<string, any>) => <TableMargin icon={data.logo} name={data.symbol} />
      },
      {
        title: 'Pool/DRF Price',
        dataIndex: 'symbol',
        align: 'right',
        render: (symbol: MarginTokenKeys, data: Record<string, any>) => (
          <>
            <BalanceShow value={buyBackInfo?.[symbol]} unit={symbol} />
            <div className={classNames(isGTET(data?.last_drf_price, marginPrice) ? 'fall' : 'rise')}>
              <BalanceShow value={data?.last_drf_price} unit={VALUATION_TOKEN_SYMBOL} decimal={4} />
            </div>
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
              <TableCountDown cycle={data?.buyback_period} blockNumber={data?.last_buy_back_block} />
            </>
          )
        }
      }
    ]
  }, [t, blockNumber, marginPrice, buyBackInfo])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.BuybackPlan.BuybackCycle', 'Buyback Cycle'),
        dataIndex: 'buyback_period',
        render: (value: number) => <BalanceShow value={value} rule="0,0" unit="Block" />
      },
      {
        title: t('NewDashboard.BuybackPlan.BuybackPool', 'Buyback Pool'),
        dataIndex: 'symbol',
        render: (symbol: MarginTokenKeys) => <BalanceShow value={buyBackInfo?.[symbol]} unit={symbol} />
      },
      {
        title: t('NewDashboard.BuybackPlan.DRFPriceLastCycle', 'DRF Price(Last Cycle)'),
        dataIndex: 'last_drf_price',
        render: (value: number) => {
          return (
            <div className={classNames(isGTET(value, marginPrice) ? 'fall' : 'rise')}>
              <BalanceShow value={value} unit={VALUATION_TOKEN_SYMBOL} decimal={4} />
            </div>
          )
        }
      },
      {
        title: t('NewDashboard.BuybackPlan.RemainingBlock', 'Remaining block'),
        dataIndex: 'last_buy_back_block',
        render: (value: number, data: Record<any, any>) => {
          const block = Number(data?.buyback_period) + Number(data?.last_buy_back_block) - blockNumber
          return <BalanceShow value={block} rule="0,0" unit="Block" />
        }
      },
      {
        title: t('NewDashboard.BuybackPlan.EstimatedTime', 'Estimated Time'),
        dataIndex: 'symbol',
        render: (symbol: symbol, data: Record<string, any>) => {
          return <TableCountDown cycle={data?.buyback_period} blockNumber={data?.last_buy_back_block} />
        }
      }
    ]
  }, [t, blockNumber, marginPrice, buyBackInfo])

  const emptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records.records)) return t('NewDashboard.BuybackPlan.NoResultsFound')
    return ''
  }, [t, state.records])

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
      const { data } = await getBuyBackPlans(index, 10)

      // console.info(data)

      dispatch({
        type: 'SET_RECORDS',
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
        <h3>{t('NewDashboard.BuybackPlan.BuybackPlan', 'Buyback Plan')}</h3>
        <div className="web-dashboard-section-header-search">
          {/*todo search*/}
          {/*<Input value={keyword} onChange={setKeyword} placeholder={t('NewDashboard.BuybackPlan.SerchTip')}>*/}
          {/*  <button className="web-dashboard-section-header-search-button" onClick={onSearch} />*/}
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

export default Plan
