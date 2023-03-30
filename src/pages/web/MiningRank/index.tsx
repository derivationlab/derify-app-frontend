import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useContext, useReducer } from 'react'

import { calcShortHash, keepDecimals } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { useMarginToken } from '@/store'
import { getTradersRankList } from '@/api'
import { reducer, stateInit } from '@/reducers/brokerRank'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import { useAccount } from 'wagmi'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

interface RowTextProps {
  value: string | number
  unit?: string
}

const RowName: FC<{ data: Record<string, any> }> = ({ data }) => {
  const { mobile } = useContext(MobileContext)

  return (
    <div className="web-broker-rank-table-row-name">
      <Image src={data?.logo ?? 'icon/normal-ico.svg'} cover />
      <main>
        <strong>{mobile ? calcShortHash(data?.user, 5, 4) : data?.user}</strong>
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

  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)

  const fetchData = useCallback(
    async (index = 0) => {
      const { data } = await getTradersRankList(findToken(marginToken).tokenAddress, index, 10)

      // console.info(data)

      dispatch({
        type: 'SET_RANK_DAT',
        payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [marginToken]
  )

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
      width: mobile ? '' : 600,
      render: (user: string, data: Record<string, any>) => {
        return <RowName data={data} />
      }
    },
    {
      title: t('Broker.RankList.TotalRewards', 'Total Rewards'),
      dataIndex: '',
      width: mobile ? '' : 250,
      render: (_: string, data: Record<string, any>) => {
        const { total_margin_token_reward = 0, total_drf_reward = 0 } = data ?? {}
        const margin = keepDecimals(total_margin_token_reward, findToken(marginToken).decimals)
        const platform = keepDecimals(total_drf_reward, PLATFORM_TOKEN.decimals)
        return (
          <>
            <BalanceShow value={margin} unit={marginToken} />
            <BalanceShow value={platform} unit={PLATFORM_TOKEN.symbol} />
          </>
        )
      }
    },
    {
      title: t('Broker.RankList.Rank', 'Rank'),
      dataIndex: 'rank',
      width: mobile ? '' : 200,
      render: (text: string) => <RowText value={`#${text}`} />
    }
  ]

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-broker-rank">
      <h2>Position Mining Rank</h2>
      <Table
        data={state.rankData.records}
        rowKey="user"
        columns={mColumns}
        emptyText={emptyText}
        className="web-broker-table"
        rowClassName={(record) => (address === record.user ? 'active' : '')}
      />
      <Pagination page={state.pageIndex} total={state.rankData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default Rank
