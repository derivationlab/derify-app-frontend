import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useContext, useReducer } from 'react'

import { MobileContext } from '@/providers/Mobile'
import { useMarginToken } from '@/store'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { getTradingCompetitionRanks } from '@/api'
import { calcShortHash, keepDecimals } from '@/utils/tools'
import { grantStateOptions, reducer, stateInit } from '@/reducers/brokerRank'

import Image from '@/components/common/Image'
import Select from '@/components/common/Form/Select'
import Pagination from '@/components/common/Pagination'
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

const CompetitionRank: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const { mobile } = useContext(MobileContext)

  const marginToken = useMarginToken((state) => state.marginToken)

  const emptyText = useMemo(() => {
    if (state.rankData.isLoaded) return 'Loading'
    if (isEmpty(state.rankData.records)) return 'No Record'
    return ''
  }, [state.rankData])

  const mColumns = [
    {
      title: t('Earn.CompetitionRank.Address'),
      dataIndex: 'user',
      width: mobile ? '' : 600,
      render: (user: string, data: Record<string, any>) => {
        return <RowName data={data} />
      }
    },
    {
      title: t('Earn.CompetitionRank.Rewards'),
      dataIndex: 'amount',
      width: mobile ? '' : 250,
      render: (_: string, data: Record<string, any>) => {
        const amount = keepDecimals(_, findToken(marginToken).decimals)
        const platform = keepDecimals(data.awards, PLATFORM_TOKEN.decimals)
        return (
          <>
            <BalanceShow value={amount} unit={marginToken} />
            <BalanceShow value={platform} unit={PLATFORM_TOKEN.symbol} />
          </>
        )
      }
    },
    {
      title: t('Earn.CompetitionRank.Rank'),
      dataIndex: 'rank',
      width: mobile ? '' : 200,
      render: (text: string) => <RowText value={`#${text}`} />
    }
  ]

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  const fetchData = useCallback(
    async (index = 0) => {
      const { data } = await getTradingCompetitionRanks(findToken(marginToken).tokenAddress, index, 10)

      console.info(data)

      dispatch({
        type: 'SET_RANK_DAT',
        payload: { records: data, totalItems: data.length, isLoaded: false }
        // payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
      })
    },
    [marginToken]
  )

  useEffect(() => {
    void fetchData()
  }, [])

  return (
    <div className="web-competition-rank">
      <h2>Trading Competition Rank</h2>
      <aside>
        <Select
          value={state.grantStatus}
          onChange={(v) => dispatch({ type: 'SET_GRANT_STATUS', payload: v })}
          objOptions={grantStateOptions as any}
        />
      </aside>
      <Table data={state.rankData.records} rowKey="id" columns={mColumns} emptyText={emptyText} />
      <Pagination page={state.pageIndex} total={state.rankData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default CompetitionRank
