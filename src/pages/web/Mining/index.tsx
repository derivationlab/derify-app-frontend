import { getTradersRankList } from 'derify-apis-test'
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
import { PLATFORM_TOKEN } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/records'
import { useMarginTokenStore } from '@/store'
import { Rec } from '@/typings'
import { calcShortHash, keepDecimals } from '@/utils/tools'

interface RowTextProps {
  value: string | number
  unit?: string
}

const RowName: FC<{ data: Record<string, any> }> = ({ data }) => {
  return (
    <div className="web-broker-rank-table-row-name">
      <Image src={data?.logo ?? 'icon/normal-ico.svg'} cover />
      <main>
        <strong>{isMobile ? calcShortHash(data?.user, 5, 4) : data?.user}</strong>
      </main>
    </div>
  )
}

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

  const fetchData = useCallback(
    async (index = 0) => {
      const { data } = await getTradersRankList<{ data: Rec }>(marginToken.address, index)

      // console.info(data)

      dispatch({
        type: 'SET_RECORDS',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [marginToken]
  )

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
      title: t('Earn.MiningRank.Address'),
      dataIndex: 'user',
      width: isMobile ? '' : 600,
      render: (user: string, data: Record<string, any>) => {
        return <RowName data={data} />
      }
    },
    {
      title: t('Broker.RankList.TotalRewards', 'Total Rewards'),
      dataIndex: '',
      width: isMobile ? '' : 250,
      render: (_: string, data: Record<string, any>) => {
        const { total_margin_token_reward = 0, total_drf_reward = 0 } = data ?? {}
        const margin = keepDecimals(total_margin_token_reward, 2)
        const platform = keepDecimals(total_drf_reward, PLATFORM_TOKEN.decimals)
        return (
          <>
            <BalanceShow value={margin} unit={marginToken.symbol} />
            <BalanceShow value={platform} unit={PLATFORM_TOKEN.symbol} />
          </>
        )
      }
    },
    {
      title: t('Broker.RankList.Rank', 'Rank'),
      dataIndex: 'rank',
      width: isMobile ? '' : 200,
      render: (text: string) => <RowText value={`#${text}`} />
    }
  ]

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-mining-rank">
      <h2>{t('Earn.PositionMining.PositionMiningRank')}</h2>
      <Table
        data={state.records.records}
        rowKey="user"
        columns={mColumns}
        emptyText={emptyText}
        className="web-broker-table"
        rowClassName={(record) => (address === record.user ? 'active' : '')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={onPagination} />
    </div>
  )
}

export default Rank
