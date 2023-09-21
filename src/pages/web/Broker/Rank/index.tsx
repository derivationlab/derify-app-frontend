import { getBrokerRankList } from 'derify-apis-staging'
import { isEmpty } from 'lodash-es'
import Table from 'rc-table'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { Rec } from '@/typings'

interface RowTextProps {
  value: string | number
  unit?: string
}

const RowName: FC<{ data: Record<string, any> }> = ({ data }) => (
  <div className="web-broker-rank-table-row-name">
    <Image src={data?.logo ?? 'icon/normal-ico.svg'} cover />
    <main>
      <strong>{data?.name}</strong>
      <em>@{data?.id}</em>
    </main>
  </div>
)

const RowText: FC<RowTextProps> = ({ value, unit }) => (
  <div className="web-broker-rank-table-row-text">
    {value}
    {unit && <small>{unit}</small>}
  </div>
)

const Rank: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const fetchData = useCallback(async (index = 0) => {
    const { data } = await getBrokerRankList<{ data: Rec }>(marginToken.address, index)
    dispatch({
      type: 'SET_RECORDS',
      payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const emptyText = useMemo(() => {
    if (state.records.loaded) return <Spinner small />
    if (isEmpty(state.records.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records])

  const mColumns = [
    {
      title: t('Broker.RankList.Name', 'Name'),
      dataIndex: 'name',
      width: isMobile ? 275 : 250,
      render: (_: string, data: Record<string, any>) => <RowName data={data} />
    },
    {
      title: t('Broker.RankList.Rank', 'Rank'),
      dataIndex: 'rank',
      width: isMobile ? '' : 200,
      render: (text: string) => <RowText value={`#${text}`} />
    }
  ]

  const wColumns = [
    mColumns[0],
    {
      title: t('Broker.RankList.TotalRewards', 'Total Rewards'),
      dataIndex: '',
      width: 250,
      render: (_: string, data: Record<string, any>) => {
        const { accumulated_margin_token_reward = 0, accumulated_drf_reward = 0 } = data ?? {}
        return (
          <>
            <BalanceShow value={accumulated_margin_token_reward} unit={marginToken.symbol} />
            <BalanceShow value={accumulated_drf_reward} unit="DRF" />
          </>
        )
      }
    },
    {
      title: t('Broker.RankList.DailyRewards', 'Daily Rewards'),
      dataIndex: '',
      width: 250,
      render: (_: string, data: Record<string, any>) => {
        const { today_margin_token_reward = 0, today_drf_reward = 0 } = data ?? {}
        return (
          <>
            <BalanceShow value={today_margin_token_reward} unit={marginToken.symbol} />
            <BalanceShow value={today_drf_reward} unit="DRF" />
          </>
        )
      }
    },
    {
      title: 'Total Traders',
      dataIndex: 'traders_num',
      width: 220,
      render: (text: string) => <RowText value={text} />
    },
    mColumns[1]
  ]

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-broker-rank">
      <h2>{t('Broker.RankList.BrokerRank', 'Broker Rank')}</h2>
      <Table
        className="web-broker-table"
        emptyText={emptyText}
        columns={isMobile ? mColumns : wColumns}
        data={state.records.records}
        rowKey="id"
        rowClassName={(record) => (address === record.broker ? 'active' : '')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </div>
  )
}

export default Rank
