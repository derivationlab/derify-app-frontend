import classNames from 'classnames'
import { isEmpty } from 'lodash'
import Table from 'rc-table'

import React, { useMemo, useEffect, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { getTokenBurnHistory } from '@/api'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { EXPLORER_SCAN_URL } from '@/config'
import { RowTime } from '@/pages/web/Broker/Workbench/c/Data/common'
import { reducer, stateInit } from '@/reducers/records'
import { Rec } from '@/typings'
import { calcShortHash } from '@/utils/tools'

const Table2 = () => {
  const { t } = useTranslation()
  const [state, dispatch] = useReducer(reducer, stateInit)

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.BurnHistory.Transaction', 'Buyback Cycle'),
        dataIndex: 'tx',
        render: (_: string) => (
          <a href={`${EXPLORER_SCAN_URL}/tx/${_}`} target="_blank">
            {isMobile ? calcShortHash(_, 4, 4) : calcShortHash(_)}
          </a>
        )
      },
      {
        title: `${t('NewDashboard.BurnHistory.MarginTokenAmount')}/${t('NewDashboard.BurnHistory.BurnAmount')}`,
        dataIndex: 'margin_amount',
        render: (_: string, data: Rec) => {
          return (
            <>
              <BalanceShow value={_} unit={data.margin_symbol} decimal={Number(_) > 0 ? 4 : 2} />
              <BalanceShow value={data.burn_amount} unit={data.burn_symbol} decimal={Number(_) > 0 ? 4 : 2} />
            </>
          )
        }
      },
      {
        title: t('NewDashboard.BurnHistory.Time', 'Time'),
        dataIndex: 'block_timestamp',
        align: 'right',
        render: (text: string) => <RowTime time={text} />
      }
    ]
  }, [t])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.BurnHistory.MarginTokenAmount'),
        dataIndex: 'margin_amount',
        render: (_: string, data: Rec) => {
          return <BalanceShow value={_} unit={data.margin_symbol} decimal={Number(_) > 0 ? 4 : 2} />
        }
      },
      {
        title: t('NewDashboard.BurnHistory.BurnAmount'),
        dataIndex: 'burn_amount',
        render: (_: string, data: Rec) => {
          return <BalanceShow value={_} unit={data.burn_symbol} decimal={Number(_) > 0 ? 4 : 2} />
        }
      },
      mColumns[2]
    ]
  }, [t])

  const emptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records.records)) return t('NewDashboard.BuybackPlan.NoResultsFound')
    return ''
  }, [t, state.records])

  const _getTokenBurnHistory = async (index = 0) => {
    const { data } = await getTokenBurnHistory(index)
    dispatch({
      type: 'SET_RECORDS',
      payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })
    void _getTokenBurnHistory(index)
  }

  useEffect(() => {
    void _getTokenBurnHistory()
  }, [])

  return (
    <>
      <Table
        rowKey="symbol"
        data={state.records.records}
        // @ts-ignore
        columns={isMobile ? mColumns : wColumns}
        className={classNames('web-broker-table1', { 'web-space-table': isMobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </>
  )
}

export default Table2
