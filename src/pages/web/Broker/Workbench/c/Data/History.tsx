import { isEmpty } from 'lodash'
import Table from 'rc-table'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo, useContext, useReducer } from 'react'
import { useTranslation } from 'react-i18next'

import { getBrokerRevenueRecord } from '@/api'
import Pagination from '@/components/common/Pagination'
import { EXPLORER_SCAN_URL } from '@/config'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { MobileContext } from '@/providers/Mobile'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { keepDecimals } from '@/utils/tools'

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
        <a href={`${EXPLORER_SCAN_URL}/tx/${data.tx}`} target="_blank" title={data.tx}>
          txid {calcShortHash(data.tx)}
        </a>
      )}
    </div>
  )
}

const RowAmount: FC<Record<string, any>> = ({ text = 0, coin }) => (
  <div className="web-broker-table-history-amount">
    <strong>{text}</strong>
    <u>{coin}</u>
  </div>
)

const RowBalance: FC<Record<string, any>> = ({ text = 0, coin }) => (
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
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getBrokerRevenueRecord(address, marginToken.address, index, 10)

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
      width: mobile ? '' : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_amount = keepDecimals(data?.margin_token_amount ?? 0, 2)
        const drf_amount = keepDecimals(data?.drf_amount ?? 0, PLATFORM_TOKEN.decimals)

        return (
          <>
            <RowAmount text={usd_amount} coin={marginToken} />
            <RowAmount text={drf_amount} coin="DRF" />
          </>
        )
      }
    },
    {
      title: t('Broker.History.Balance', 'Balance'),
      dataIndex: 'balance',
      width: mobile ? '' : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_balance = keepDecimals(data?.margin_token_balance ?? 0, 2)
        const drf_balance = keepDecimals(data?.drf_balance ?? 0, PLATFORM_TOKEN.decimals)
        return (
          <>
            <RowBalance text={usd_balance} coin={marginToken} />
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
        data={state.records.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
    </>
  )
}

export default History
