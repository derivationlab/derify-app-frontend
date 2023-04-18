import Table from 'rc-table'
import classNames from 'classnames'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useEffect, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { keepDecimals } from '@/utils/tools'
import { EXPLORER_SCAN_URL } from '@/config'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore } from '@/store'
import { getBrokerRewardTx } from '@/api'
import { reducer, stateInit } from '@/reducers/records'

import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash, calcTimeStr } from './common'

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
  const { mobile } = useContext(MobileContext)
  return (
    <div className="web-broker-table-transaction-tx">
      <a href={`${EXPLORER_SCAN_URL}/tx/${data.tx}`} target="_blank" title={data.tx}>
        {mobile ? calcShortHash(data.tx, 4, 4) : calcShortHash(data.tx)}
      </a>
      {mobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${EXPLORER_SCAN_URL}/address/${data.user}`} target="_blank" title={data.user}>
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
  const marginToken = useMarginTokenStore((state) => state.marginToken)

  // const { mobile } = useContext(MobileContext)
  const up = useMemo(() => Number(data.pnl_margin_token) > 0, [data.pnl_margin_token])
  const down = useMemo(() => Number(data.pnl_margin_token) < 0, [data.pnl_margin_token])
  const pnl_margin_token = keepDecimals(data.pnl_margin_token, 2)

  return (
    <div className="web-broker-table-transaction-pnl">
      <strong className={classNames({ up }, { down })}>
        {Math.abs(data.pnl_margin_token) === 0 ? '-' : `${judgeUpsAndDowns(data.pnl_margin_token)}${pnl_margin_token}`}
      </strong>
      <em>{marginToken}</em>
    </div>
  )
}

const Transaction: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getBrokerRewardTx(address, findToken(marginToken).tokenAddress, index, 10)

      dispatch({
        type: 'SET_RECORDS',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    }
  }

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const memoEmptyText = useMemo(() => {
    if (state.records.loaded) return t('common.Loading')
    if (isEmpty(state.records?.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records])

  const mobileColumns = [
    {
      title: t('Broker.Transaction.Transaction', 'Transaction'),
      dataIndex: '',
      width: mobile ? '' : 420,
      render: (_: string, data: DataProps) => <RowTransaction data={data} />
    },
    {
      title: t('Broker.Transaction.Type', 'Type'),
      dataIndex: '',
      width: mobile ? 90 : 268,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.Transaction.RealizedPnL', 'Realized PnL'),
      dataIndex: '',
      width: mobile ? 110 : 268,
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
        columns={mobile ? mobileColumns : webColumns}
        emptyText={memoEmptyText}
        data={state.records.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
    </>
  )
}

export default Transaction
