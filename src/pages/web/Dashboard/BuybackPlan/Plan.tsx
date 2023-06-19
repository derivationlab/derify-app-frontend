import classNames from 'classnames'
import { isEmpty } from 'lodash'
import Table from 'rc-table'
import { useBlockNumber } from 'wagmi'

import React, { FC, useMemo, useContext, useEffect, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import { getBuyBackPlans } from '@/api'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { VALUATION_TOKEN_SYMBOL } from '@/config/tokens'
import { usePlatformTokenPrice } from '@/hooks/usePlatformTokenPrice'
import { MobileContext } from '@/providers/Mobile'
import { reducer, stateInit } from '@/reducers/records'
import { Rec } from '@/typings'
import { isGT, isGTET, isLT, nonBigNumberInterception } from '@/utils/tools'

import { TableMargin, TableCountDown } from '../c/TableCol'

const Plan: FC<{ buyBackInfo: Rec }> = ({ buyBackInfo }) => {
  const [state, dispatch] = useReducer(reducer, stateInit)
  const { t } = useTranslation()
  const { data: blockNumber = 0 } = useBlockNumber()
  const { mobile } = useContext(MobileContext)

  const { data: tokenPrice } = usePlatformTokenPrice()

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
        render: (symbol: string, data: Record<string, any>) => {
          let cls = ''
          const price = nonBigNumberInterception(data?.last_drf_price ?? 0, 4)
          if (isGTET(price, tokenPrice)) cls = 'rise'
          if (isLT(price, tokenPrice) && isGT(price, 0)) cls = 'fall'
          const p = buyBackInfo?.[data.margin_token] ?? 0
          return (
            <>
              {buyBackInfo ? (
                <BalanceShow value={p} unit={symbol} decimal={Number(p) === 0 ? 2 : data.amount_decimals} />
              ) : (
                <Spinner text="loading" />
              )}
              <div className={cls}>
                <BalanceShow value={price} unit={VALUATION_TOKEN_SYMBOL} decimal={Number(price) > 0 ? 4 : 2} />
              </div>
            </>
          )
        }
      },
      {
        title: 'Blocks/Time',
        dataIndex: 'RemainingBlock',
        align: 'right',
        render: (value: number, data: Record<string, any>) => {
          const p1 = Number(data?.buyback_period) + Number(data?.last_buy_back_block)
          const p2 = p1 - blockNumber
          const block = p2 <= 0 ? 0 : p2
          return (
            <>
              <BalanceShow value={block} rule="0,0" unit="Block" />
              <TableCountDown cycle={data?.buyback_period} blockNumber={data?.last_buy_back_block} />
            </>
          )
        }
      }
    ]
  }, [t, blockNumber, tokenPrice, buyBackInfo])

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
        render: (symbol: string, data: Record<string, any>) => {
          if (!buyBackInfo) return <Spinner text="loading" />
          const p = buyBackInfo?.[data.margin_token] ?? 0
          return <BalanceShow value={p} unit={symbol} decimal={Number(p) === 0 ? 2 : data.amount_decimals} />
        }
      },
      {
        title: t('NewDashboard.BuybackPlan.DRFPriceLastCycle', 'DRF Price(Last Cycle)'),
        dataIndex: 'last_drf_price',
        render: (value: number) => {
          let cls = ''
          const price = nonBigNumberInterception(value, 4)
          if (isGTET(price, tokenPrice)) cls = 'rise'
          if (isLT(price, tokenPrice) && isGT(price, 0)) cls = 'fall'
          return (
            <div className={cls}>
              <BalanceShow value={price} unit={VALUATION_TOKEN_SYMBOL} decimal={Number(price) > 0 ? 4 : 2} />
            </div>
          )
        }
      },
      {
        title: t('NewDashboard.BuybackPlan.RemainingBlock'),
        dataIndex: 'last_buy_back_block',
        render: (value: number, data: Record<any, any>) => {
          const p1 = Number(data?.buyback_period) + Number(data?.last_buy_back_block)
          const p2 = p1 - blockNumber
          const block = p2 <= 0 ? 0 : p2
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
  }, [t, blockNumber, tokenPrice, buyBackInfo])

  const emptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records.records)) return t('NewDashboard.BuybackPlan.NoResultsFound')
    return ''
  }, [t, state.records])

  const _getBuyBackPlans = async (index = 0) => {
    const { data } = await getBuyBackPlans(index, 10)
    dispatch({
      type: 'SET_RECORDS',
      payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void _getBuyBackPlans(index)
  }

  useEffect(() => {
    void _getBuyBackPlans()
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
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </div>
  )
}

export default Plan
