import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useEffect, useState, useMemo, useContext, useReducer } from 'react'

import { BSC_SCAN_URL } from '@/config'
import { MobileContext } from '@/context/Mobile'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/brokerTable'
import { getBrokerAccountFlow } from '@/api'
import { nonBigNumberInterception } from '@/utils/tools'

import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash, calcTimeStr } from './common'

interface DataProps {
  id: string
  tx: string
  broker: string
  trader: string
  amount: string
  balance: string
  update_type: string | number
  event_time: string
  update_time: string
}

interface RowProps {
  text?: string
  data?: DataProps
}

const RowType: FC<{ data: DataProps }> = ({ data }) => {
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)

  const TypeEnum = [
    t('Broker.History.Type0', 'Income'),
    t('Broker.History.Type1', 'Withdraw'),
    t('Broker.History.Type2', 'GasFee'),
    t('Broker.History.Type3', 'Redeem'),
    t('Broker.History.Type4', 'Deposit'),
    t('Broker.History.Type5', 'Interest')
  ]

  // @ts-ignore
  const type = TypeEnum[data.update_type]
  return (
    <div className="web-broker-table-history-type">
      <strong>{type}</strong>
      {mobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${BSC_SCAN_URL}/tx/${data.tx}`} target="_blank" title={data.tx}>
          txid {calcShortHash(data.tx)}
        </a>
      )}
    </div>
  )
}

const RowAmount: FC<Record<string, any>> = ({ text = 0, coin = BASE_TOKEN_SYMBOL }) => (
  <div className="web-broker-table-history-amount">
    <strong>{text}</strong>
    <u>{coin}</u>
  </div>
)

const RowBalance: FC<Record<string, any>> = ({ text = 0, coin = BASE_TOKEN_SYMBOL }) => (
  <div className="web-broker-table-history-balance">
    <strong>{text}</strong>
    <u>{coin}</u>
  </div>
)

// loading ui todo
const History: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { data: account } = useAccount()

  const fetchData = async (index = 0) => {
    if (account?.address) {
      const { data } = await getBrokerAccountFlow('0x34D2F68529CCE3080A2eF473BC35Fa95FFaB4589', index, 10)

      dispatch({
        type: 'SET_TABLE_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    }
  }

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })
    
    void fetchData(index)
  }

  const memoEmptyText = useMemo(() => {
    if (state.tableDAT.isLoaded) return 'Loading'
    if (isEmpty(state.tableDAT?.records)) return 'No Record'
    return ''
  }, [state.tableDAT])

  useEffect(() => {
    void fetchData()
  }, [])

  const mobileColums = [
    {
      title: t('Broker.History.Type', 'Type'),
      dataIndex: 'update_type',
      width: mobile ? '' : 428,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.History.Amount', 'Amount'),
      dataIndex: 'amount',
      width: mobile ? 95 : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_amount = nonBigNumberInterception(data?.usd_amount, 8)
        const drf_amount = nonBigNumberInterception(data?.drf_amount, 8)

        return (
          <>
            <RowAmount text={usd_amount} />
            <RowAmount text={drf_amount} coin="DRF" />
          </>
        )
      }
    },
    {
      title: t('Broker.History.Balance', 'Balance'),
      dataIndex: 'balance',
      width: mobile ? 95 : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_balance = nonBigNumberInterception(data?.usd_balance ?? 0, 8)
        const drf_balance = nonBigNumberInterception(data?.drf_balance ?? 0, 8)
        return (
          <>
            <RowBalance text={usd_balance} />
            <RowBalance text={drf_balance} coin="DRF" />
          </>
        )
      }
    }
  ]

  const webColumns = [
    ...mobileColums,
    {
      title: t('Broker.History.Time', 'Time'),
      dataIndex: 'event_time',
      render: (text: string) => <RowTime time={text} />
    }
  ]

  return (
    <>
      <Table
        className="web-broker-table"
        columns={mobile ? mobileColums : webColumns}
        emptyText={memoEmptyText}
        data={state.tableDAT.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.tableDAT.totalItems} onChange={pageChange} />
    </>
  )
}

export default History
