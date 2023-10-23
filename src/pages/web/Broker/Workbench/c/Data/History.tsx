import { getBrokerRevenueRecord } from 'derify-apis'
import { isEmpty } from 'lodash-es'
import Table from 'rc-table'
import { useAccount, useNetwork } from 'wagmi'

import React, { FC, useEffect, useMemo, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { keepDecimals, calcShortHash } from '@/utils/tools'

import { RowTime, calcTimeStr } from './common'

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
  const { chain } = useNetwork()

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
      {isMobile ? (
        <time>{calcTimeStr(data.event_time)}</time>
      ) : (
        <a href={`${chain?.blockExplorers?.default.url}/tx/${data.tx}`} target="_blank" title={data.tx}>
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

const History: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()

  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getBrokerRevenueRecord<{ data: Rec }>(address, marginToken.address, index, 10)

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

  useEffect(() => {
    void fetchData()
  }, [])

  const mobileColums = [
    {
      title: t('Broker.History.Type', 'Type'),
      dataIndex: 'update_type',
      width: isMobile ? '' : 428,
      render: (_: string, data: DataProps) => <RowType data={data} />
    },
    {
      title: t('Broker.History.Amount', 'Amount'),
      dataIndex: 'amount',
      width: isMobile ? '' : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_amount = keepDecimals(data?.margin_token_amount ?? 0, marginToken.decimals)
        const drf_amount = keepDecimals(data?.drf_amount ?? 0, PLATFORM_TOKEN.decimals)

        return (
          <>
            <RowAmount text={usd_amount} coin={marginToken.symbol} />
            <RowAmount text={drf_amount} coin={PLATFORM_TOKEN.symbol} />
          </>
        )
      }
    },
    {
      title: t('Broker.History.Balance', 'Balance'),
      dataIndex: 'balance',
      width: isMobile ? '' : 268,
      render: (_: string, data: Record<string, any>) => {
        const usd_balance = keepDecimals(data?.margin_token_balance ?? 0, marginToken.decimals)
        const drf_balance = keepDecimals(data?.drf_balance ?? 0, PLATFORM_TOKEN.decimals)
        return (
          <>
            <RowBalance text={usd_balance} coin={marginToken.symbol} />
            <RowBalance text={drf_balance} coin={PLATFORM_TOKEN.symbol} />
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
        columns={isMobile ? mobileColums : webColumns}
        emptyText={memoEmptyText}
        data={state.records.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </>
  )
}

export default History
