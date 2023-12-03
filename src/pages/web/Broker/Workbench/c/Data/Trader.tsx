import { getBrokerSubordinate } from 'derify-apis-v20'
import { isEmpty } from 'lodash-es'
import Table from 'rc-table'
import { useAccount, useNetwork } from 'wagmi'

import React, { FC, useMemo, useEffect, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { Rec } from '@/typings'
import { calcShortHash } from '@/utils/tools'

import { RowTime } from './common'

interface DataProps {
  trader: string
  update_time: string
}

interface RowProps {
  text?: string
  data?: DataProps
}

const RowTrader: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { chain } = useNetwork()
  return (
    <div className="web-broker-table-trader-tx">
      <Image src="icon/normal-ico.svg" cover />
      <a href={`${chain?.blockExplorers?.default.url}/address/${data.trader}`} title={data.trader} target="_blank">
        {isMobile ? calcShortHash(data.trader, 4, 4) : calcShortHash(data.trader)}
      </a>
    </div>
  )
}

const RowLastTransaction: FC<RowProps> = ({ text }) => {
  const { chain } = useNetwork()
  return (
    <div className="web-broker-table-trader-tx">
      {text ? (
        <a href={`${chain?.blockExplorers?.default.url}/tx/${text}`} target="_blank" title={text}>
          {calcShortHash(text ?? '')}
        </a>
      ) : (
        '-'
      )}
    </div>
  )
}

const Trader: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getBrokerSubordinate<{ data: Rec }>(address, marginToken.address, index)

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

  // registration_days todo
  const mobileColumns = [
    {
      title: t('Broker.Trader.Trader', 'Trader'),
      dataIndex: 'trader',
      width: isMobile ? '' : 420,
      render: (_: string, data: Record<string, any>) => <RowTrader data={data} />
    },
    {
      title: t(`Broker.Trader.LastTransactionTime${isMobile ? 'M' : ''}`, 'Last Transaction Time'),
      dataIndex: 'last_transaction_time',
      width: isMobile ? 95 : 268,
      render: (text: string) => <RowTime time={text} />
    },
    {
      title: t(`Broker.Trader.${isMobile ? '' : 'Registration'}Time`, 'Time'),
      dataIndex: 'registration_time',
      width: isMobile ? 95 : 268,
      render: (text: string) => <RowTime time={text} />
    }
  ]
  const webColumns = [
    mobileColumns[0],
    {
      title: t('Broker.Trader.LastTransaction', 'Last Transaction'),
      dataIndex: 'last_transaction',
      width: 420,
      render: (text: string) => <RowLastTransaction text={text} />
    },
    mobileColumns[1],
    mobileColumns[2]
  ]

  return (
    <>
      <Table
        className="web-broker-table"
        emptyText={memoEmptyText}
        columns={isMobile ? mobileColumns : webColumns}
        data={state.records.records}
        rowKey="trader"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </>
  )
}

export default Trader
