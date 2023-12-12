import classNames from 'classnames'
import { getBrokerTransactions } from 'derify-apis-staging'
import { isEmpty } from 'lodash-es'
import Table from 'rc-table'
import { useAccount, useNetwork } from 'wagmi'

import React, { FC, useMemo, useEffect, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { calcShortHash, numeralNumber } from '@/utils/tools'

import { RowTime, calcTimeStr } from './common'

interface DataProps {
  id: string
  tx: string
  trader: string
  status: number
  type: number
  amount: string
  percent: string
  event_time: string
}

const RowTransaction: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { chain } = useNetwork()
  return (
    <div className="web-broker-table-transaction-tx">
      <a href={`${chain?.blockExplorers?.default.url}/tx/${data.tx}`} target="_blank" title={data.tx}>
        {isMobile ? calcShortHash(data.tx, 4, 4) : calcShortHash(data.tx)}
      </a>
      {isMobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${chain?.blockExplorers?.default.url}/address/${data.user}`} target="_blank" title={data.user}>
          by trader {calcShortHash(data.user)}
        </a>
      )}
    </div>
  )
}

const RowType: FC<{ data: DataProps }> = ({ data }) => {
  const { t } = useTranslation()

  const openType = [0, 1, 2]
  const closeType = [3, 4, 5, 6, 7, 8, 9]

  const txTypes: Record<string, string> = {
    'type=0|1': t('Broker.Transaction.Type0', 'Market Price'),
    'type=2': t('Broker.Transaction.Type1', 'Limit Price'),
    'type=3': t('Broker.Transaction.Type2', 'Take Profit'),
    'type=4': t('Broker.Transaction.Type3', 'Stop Loss'),
    'type=5': t('Broker.Transaction.Type4', 'Deleverage'),
    'type=6': t('Broker.Transaction.Type5', 'Liquidate'),
    'type=7|8|9': 'Close'
  }

  const memoPosType = useMemo(() => {
    const findKey = Object.keys(txTypes).find((key) => key.includes(data.type as any))
    if (findKey) return txTypes[findKey]
    return ''
  }, [data.type])

  return (
    <div className="web-broker-table-transaction-type">
      <strong className={classNames(openType.includes(data.type) && 'open', closeType.includes(data.type) && 'close')}>
        {openType.includes(data.type) && t('Broker.Transaction.Open', 'Open')}
        {closeType.includes(data.type) && t('Broker.Transaction.Close', 'Close')}
      </strong>
      <em>{memoPosType}</em>
    </div>
  )
}

const judgeUpsAndDowns = (data: string): string => (Number(data) > 0 ? '+' : '')

const RowRealizedPnl: FC<{ data: Record<string, any> }> = ({ data }) => {
  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  //
  const up = useMemo(() => Number(data.pnl_margin_token) > 0, [data.pnl_margin_token])
  const down = useMemo(() => Number(data.pnl_margin_token) < 0, [data.pnl_margin_token])
  const pnl_margin_token = numeralNumber(data.pnl_margin_token, marginToken.decimals)

  return (
    <div className="web-broker-table-transaction-pnl">
      <strong className={classNames({ up }, { down })}>
        {Math.abs(data.pnl_margin_token) === 0 ? '-' : `${judgeUpsAndDowns(data.pnl_margin_token)}${pnl_margin_token}`}
      </strong>
      <em>{marginToken.symbol}</em>
    </div>
  )
}

const Transaction: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getBrokerTransactions<{ data: Rec }>(address, marginToken.address, index, 10)

      dispatch({
        type: 'SET_RECORDS',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    }
  }

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const memoEmptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records?.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records])

  const mobileColumns = [
    {
      title: t('Broker.Transaction.Transaction', 'Transaction'),
      dataIndex: '',
      width: isMobile ? '' : 420,
      render: (_: string, data: DataProps) => <RowTransaction data={data} />
    },
    {
      title: t('Broker.Transaction.Type', 'Type'),
      dataIndex: '',
      width: isMobile ? 90 : 268,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.Transaction.RealizedPnL', 'Realized PnL'),
      dataIndex: '',
      width: isMobile ? 110 : 268,
      render: (_: string, data: DataProps) => <RowRealizedPnl data={data} />
    }
  ]

  const webColumns = [
    ...mobileColumns,
    {
      title: t('Broker.Transaction.Time', 'Time'),
      dataIndex: 'event_time',
      render: (text: string) => <RowTime time={text} />
    }
  ]

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <>
      <Table
        className="web-broker-table"
        columns={isMobile ? mobileColumns : webColumns}
        emptyText={memoEmptyText}
        data={state.records.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </>
  )
}

export default Transaction
