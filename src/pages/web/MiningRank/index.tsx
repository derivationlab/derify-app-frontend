import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useContext, useReducer } from 'react'

import { keepDecimals } from '@/utils/tools'
import { MobileContext } from '@/context/Mobile'
import tokens, { findToken } from '@/config/tokens'
import { getBrokersRankList, getTraderMarginBalance } from '@/api'
import { reducer, stateInit } from '@/reducers/brokerRank'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import { useMTokenFromRoute } from '@/hooks/useTrading'
import { useAccount } from 'wagmi'

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
  const { data: account } = useAccount()

  const { mobile } = useContext(MobileContext)

  const marginToken = useMTokenFromRoute()
  /**
   * user: 用户账户地址
   * margin_token: margin token地址
   * margin_balance: margin token余额
   * grant_id: 对应交易比赛grant id
   * type:
   * 0-比赛开始保证金余额
   * 1-比赛结束保证金余额
   */
  const fetchData = useCallback(async (index = 0) => {
    const { data } = await getTraderMarginBalance(account?.address ?? '', index, 10)

    console.info(data)

    dispatch({
      type: 'SET_RANK_DAT',
      payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
    })
  }, [])

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const emptyText = useMemo(() => {
    if (state.rankData.isLoaded) return 'Loading'
    if (isEmpty(state.rankData.records)) return 'No Record'
    return ''
  }, [state.rankData])

  const mColumns = [
    {
      title: t('Earn.MiningRank.Address'),
      dataIndex: 'user',
      width: mobile ? 275 : 250,
      render: (_: string, data: Record<string, any>) => <RowName data={data} />
    },
    {
      title: t('Broker.RankList.Rank', 'Rank'),
      dataIndex: 'grant_id',
      width: mobile ? '' : 200,
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
        const drf = keepDecimals(accumulated_drf_reward, tokens.drf.decimals)
        const margin = keepDecimals(accumulated_margin_token_reward, findToken(marginToken).decimals)
        return (
          <>
            <RowText value={margin} unit={marginToken} />
            <RowText value={drf} unit="DRF" />
          </>
        )
      }
    },
    mColumns[1]
  ]

  useEffect(() => {
    if (account?.address) void fetchData()
  }, [account?.address])

  return (
    <div className="web-broker-rank">
      <h2>Position Mining Rank</h2>
      <Table
        className="web-broker-table"
        emptyText={emptyText}
        columns={mobile ? mColumns : wColumns}
        data={state.rankData.records}
        rowKey="id"
      />
      <Pagination page={state.pageIndex} total={state.rankData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default Rank
