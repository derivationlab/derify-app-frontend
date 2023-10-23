import classNames from 'classnames'
import { getTokenBurnHistory } from 'derify-apis'
import { isEmpty } from 'lodash-es'
import Table from 'rc-table'
import { useNetwork } from 'wagmi'

import React, { useMemo, useEffect, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { RowTime } from '@/pages/web/Broker/Workbench/c/Data/common'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenListStore } from '@/store'
import { Rec } from '@/typings'
import { calcDateDuration, calcShortHash } from '@/utils/tools'

const Table2 = () => {
  const { t } = useTranslation()
  const { chain } = useNetwork()
  const [state, dispatch] = useReducer(reducer, stateInit)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenListStore)

  const mColumns = useMemo(() => {
    return [
      {
        title: t('NewDashboard.BurnHistory.Transaction', 'Buyback Cycle'),
        dataIndex: 'tx',
        render: (_: string) => (
          <a href={`${chain?.blockExplorers?.default.url}/tx/${_}`} target="_blank">
            {isMobile ? calcShortHash(_, 4, 4) : calcShortHash(_)}
            <Image src="icon/share.svg" />
          </a>
        )
      },
      {
        title: `${t('NewDashboard.BurnHistory.MarginTokenAmount')}/${t('NewDashboard.BurnHistory.BurnAmount')}`,
        dataIndex: 'margin_amount',
        width: isMobile && 140,
        render: (_: string, data: Rec) => {
          const findMargin1 = marginTokenList.find((m) => m.symbol === data.burn_symbol)
          const decimals1 = Number(_) > 0 ? findMargin1?.amount_decimals : 2
          const findMargin2 = marginTokenList.find((m) => m.symbol === data.margin_symbol)
          const decimals2 = Number(_) > 0 ? findMargin2?.amount_decimals : 2
          return (
            <>
              <BalanceShow value={_} unit={data.margin_symbol} decimal={decimals1} />
              <BalanceShow value={data.burn_amount} unit={data.burn_symbol} decimal={decimals2} />
            </>
          )
        }
      },
      {
        title: t('NewDashboard.BurnHistory.Time', 'Time'),
        dataIndex: 'block_timestamp',
        align: 'right',
        render: (_: string) => {
          const [days, hours] = calcDateDuration(Number(_) * 1000, true)
          return <RowTime time={Number(_) * 1000} text={`${days} days ${hours} hrs ago`} />
        }
      }
    ]
  }, [t]) as Rec[]

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('NewDashboard.BurnHistory.MarginTokenAmount'),
        dataIndex: 'margin_amount',
        render: (_: string, data: Rec) => {
          const findMargin = marginTokenList.find((m) => m.symbol === data.margin_symbol)
          const decimals = Number(_) > 0 ? findMargin?.amount_decimals : 2
          return <BalanceShow value={_} unit={data.margin_symbol} decimal={decimals} />
        }
      },
      {
        title: t('NewDashboard.BurnHistory.BurnAmount'),
        dataIndex: 'burn_amount',
        render: (_: string, data: Rec) => {
          const findMargin = marginTokenList.find((m) => m.symbol === data.burn_symbol)
          const decimals = Number(_) > 0 ? findMargin?.amount_decimals : 2
          return <BalanceShow value={_} unit={data.burn_symbol} decimal={decimals} />
        }
      },
      mColumns[2]
    ]
  }, [t, marginTokenList]) as Rec[]

  const emptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records.records)) return t('NewDashboard.BuybackPlan.NoResultsFound')
    return ''
  }, [t, state.records])

  const _getTokenBurnHistory = async (index = 0) => {
    const { data } = await getTokenBurnHistory<{ data: Rec }>(index)
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
        rowKey="tx"
        data={state.records.records}
        columns={isMobile ? mColumns : wColumns}
        className={classNames({ 'web-space-table': isMobile })}
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </>
  )
}

export default Table2
