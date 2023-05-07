import dayjs from 'dayjs'
import Table from 'rc-table'
import { useAccount } from 'wagmi'
import { upperFirst, isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'
import React, { FC, useCallback, useEffect, useMemo, useContext, useReducer } from 'react'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenStore } from '@/store'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { getCompetitionList, getCompetitionRank } from '@/api'
import { calcShortHash, keepDecimals } from '@/utils/tools'
import { reducer, stateInit } from '@/reducers/competitionRank'
import Image from '@/components/common/Image'
import Select from '@/components/common/Form/Select'
// import Pagination from '@/components/common/Pagination'
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

  const marginToken = useMarginTokenStore((state) => state.marginToken)

  const emptyText = useMemo(() => {
    if (state.records.loaded) return t('common.Loading')
    if (isEmpty(state.records.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records])

  const mColumns = [
    {
      title: t('Earn.CompetitionRank.Address'),
      dataIndex: 'user',
      width: mobile ? '' : 600,
      render: (_: string, data: Record<string, any>) => {
        return <RowName data={data} />
      }
    },
    {
      title: t('Earn.CompetitionRank.Rewards'),
      dataIndex: 'amount',
      width: mobile ? '' : 250,
      render: (_: string, data: Record<string, any>) => {
        const amount = keepDecimals(data.amount, findToken(marginToken).decimals)
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
      render: (_: string) => <RowText value={_} />
    }
  ]

  const _getCompetitionRank = useCallback(async () => {
    const [id, status] = state.filterCondition.split('#')

    const { data } = await getCompetitionRank(status, id)

    if (data) {
      const _ = data.map((d: Record<string, any>, index: number) => ({
        ...d,
        rank: `#${++index}`
      }))
      dispatch({ type: 'SET_RECORDS', payload: { records: _, loaded: false } })
    }
  }, [marginToken, state.filterCondition])

  const _getCompetitionList = useCallback(async () => {
    const { data } = await getCompetitionList(findToken(marginToken).tokenAddress)

    if (data) {
      const _ = data.map((d: Record<string, any>) => ({
        label: `${upperFirst(d.status)} | ${dayjs(d.start_time).utc().format('MM/DD/YYYY HH:mm:ss')} UTC`,
        value: `${d.id}#${d.status}`
      }))

      dispatch({ type: 'SET_FILTER_CONDITION', payload: _[0].value })
      dispatch({ type: 'SET_FILTER_CONDITIONS', payload: _ })
    }
  }, [marginToken])

  useEffect(() => {
    void _getCompetitionList()
  }, [])

  useEffect(() => {
    if (state.filterCondition) {
      void _getCompetitionRank()
    }
  }, [marginToken, state.filterCondition])

  return (
    <div className="web-competition-rank">
      <h2>{t('Earn.Trading.TradingCompetitionRank')}</h2>
      <aside>
        <Select
          value={state.filterCondition}
          onChange={(v) => dispatch({ type: 'SET_FILTER_CONDITION', payload: v })}
          objOptions={state.filterConditions as any}
        />
      </aside>
      <Table
        data={state.records.records}
        rowKey="user"
        columns={mColumns}
        emptyText={emptyText}
        rowClassName={(record) => (address === record.user ? 'active' : '')}
      />
    </div>
  )
}

export default CompetitionRank
