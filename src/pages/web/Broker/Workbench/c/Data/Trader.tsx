import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useEffect, useReducer } from 'react'

import { findToken } from '@/config/tokens'
import { EXPLORER_SCAN_URL } from '@/config'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore } from '@/store'
import { reducer, stateInit } from '@/reducers/records'
import { getListOfAllUsersOfBroker } from '@/api'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'

import { RowTime, calcShortHash } from './common'

interface DataProps {
  trader: string
  update_time: string
}

interface RowProps {
  text?: string
  data?: DataProps
}

const RowTrader: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { mobile } = useContext(MobileContext)
  return (
    <div className="web-broker-table-trader-tx">
      <Image src="icon/normal-ico.svg" cover />
      <a href={`${EXPLORER_SCAN_URL}/address/${data.trader}`} title={data.trader} target="_blank">
        {mobile ? calcShortHash(data.trader, 4, 4) : calcShortHash(data.trader)}
      </a>
    </div>
  )
}

const RowLastTransaction: FC<RowProps> = ({ text }) => (
  <div className="web-broker-table-trader-tx">
    {text ? (
      <a href={`${EXPLORER_SCAN_URL}/tx/${text}`} target="_blank" title={text}>
        {calcShortHash(text ?? '')}
      </a>
    ) : (
      '-'
    )}
  </div>
)

const Trader: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const fetchData = async (index = 0) => {
    if (address) {
      const { data } = await getListOfAllUsersOfBroker(address, findToken(marginToken).tokenAddress, index, 10)

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

  // registration_days todo
  const mobileColumns = [
    {
      title: t('Broker.Trader.Trader', 'Trader'),
      dataIndex: 'trader',
      width: mobile ? '' : 420,
      render: (_: string, data: Record<string, any>) => <RowTrader data={data} />
    },
    {
      title: t(`Broker.Trader.LastTransactionTime${mobile ? 'M' : ''}`, 'Last Transaction Time'),
      dataIndex: 'last_transaction_time',
      width: mobile ? 95 : 268,
      render: (text: string) => <RowTime time={text} />
    },
    {
      title: t(`Broker.Trader.${mobile ? '' : 'Registration'}Time`, 'Time'),
      dataIndex: 'registration_time',
      width: mobile ? 95 : 268,
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
        columns={mobile ? mobileColumns : webColumns}
        data={state.records.records}
        rowKey="update_time"
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
    </>
  )
}

export default Trader
