import dayjs from 'dayjs'
import { upperFirst, isEmpty, isArray } from 'lodash'
import Table from 'rc-table'
import { useAccount } from 'wagmi'

import React, { FC, useCallback, useEffect, useMemo, useReducer } from 'react'
import { isMobile } from 'react-device-detect'
import { useTranslation } from 'react-i18next'

import { getCompetitionList, getCompetitionRank } from '@/api'
import Select from '@/components/common/Form/Select'
import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import Skeleton from '@/components/common/Skeleton'
import Spinner from '@/components/common/Spinner'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { reducer, stateInit } from '@/reducers/competitionRank'
import { useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'
import { dataRecordInit, Rec } from '@/typings'
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

const CompetitionRank: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const { t } = useTranslation()
  const { address } = useAccount()

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)

  const emptyText = useMemo(() => {
    if (state.outputData.loaded) return <Spinner small />
    if (isEmpty(state.outputData.records)) return t('common.NoRecord')
    return ''
  }, [t, state.outputData])

  const mColumns = [
    {
      title: t('Earn.CompetitionRank.Address'),
      dataIndex: 'user',
      width: isMobile ? '' : 600,
      render: (_: string, data: Record<string, any>) => {
        return <RowName data={data} />
      }
    },
    {
      title: t('Earn.CompetitionRank.Rewards'),
      dataIndex: 'amount',
      width: isMobile ? '' : 250,
      render: (_: string, data: Record<string, any>) => {
        const mDec = marginToken.decimals
        const amount = keepDecimals(data.amount, mDec)
        const platform = keepDecimals(data.awards, PLATFORM_TOKEN.decimals)
        return (
          <>
            <BalanceShow value={amount} unit={marginToken.symbol} decimal={mDec} />
            <BalanceShow value={platform} unit={PLATFORM_TOKEN.symbol} />
          </>
        )
      }
    },
    {
      title: t('Earn.CompetitionRank.Rank'),
      dataIndex: 'rank',
      width: isMobile ? '' : 200,
      render: (_: string) => <RowText value={_} />
    }
  ]

  const _getCompetitionRank = useCallback(
    async (pageIndex = 0) => {
      const [id, status] = state.filterCondition.split('#')
      try {
        const { data } = await getCompetitionRank(status, id, pageIndex)
        if (data) {
          const totalItems = data.totalItems
          const _records = data.records
          const records = _records.map((d: Rec, index: number) => ({
            ...d,
            rank: `#${10 * pageIndex + 1 + index}`
          }))
          dispatch({ type: 'SET_OUTPUT_DATA', payload: { records, totalItems } })
        } else {
          dispatch({ type: 'SET_OUTPUT_DATA', payload: dataRecordInit })
        }
      } catch (e) {
        dispatch({ type: 'SET_OUTPUT_DATA', payload: dataRecordInit })
      } finally {
        dispatch({ type: 'SET_OUTPUT_DATA', payload: { loaded: false } })
      }
    },
    [state.filterCondition]
  )

  const _getCompetitionList = useCallback(async () => {
    const { data } = await getCompetitionList(marginToken.address)

    if (data) {
      const _ = data.map((d: Record<string, any>) => ({
        label: `${upperFirst(d.status)} | ${dayjs(d.start_time).format('MM/DD/YYYY HH:mm:ss')}`,
        value: `${d.id}#${d.status}`
      }))
      dispatch({ type: 'SET_FILTER_CONDITION', payload: _[0]?.value ?? '' })
      dispatch({ type: 'SET_FILTER_CONDITIONS', payload: _ })
    }
  }, [marginToken])

  const onPagination = (index: number) => {
    dispatch({ type: 'SET_OUTPUT_DATA', payload: { pageIndex: index } })
    void _getCompetitionRank(index)
  }

  useEffect(() => {
    void _getCompetitionList()
  }, [])

  useEffect(() => {
    if (state.filterCondition) {
      dispatch({ type: 'SET_OUTPUT_DATA', payload: { loaded: true } })
      void _getCompetitionRank()
    }
  }, [marginToken, state.filterCondition])

  return (
    <div className="web-competition-rank">
      <h2>{t('Earn.Trading.TradingCompetitionRank')}</h2>
      <aside>
        <Skeleton rowsProps={{ rows: 1 }} animation loading={!state.filterConditions}>
          {isArray(state.filterConditions) && state.filterConditions.length === 0 && (
            <section className="web-competition-rank-null">{t('common.NoRecord')}</section>
          )}
          {isArray(state.filterConditions) && state.filterConditions.length > 0 && (
            <Select
              value={state.filterCondition}
              onChange={(v) => dispatch({ type: 'SET_FILTER_CONDITION', payload: v })}
              objOptions={state.filterConditions as any}
            />
          )}
        </Skeleton>
      </aside>
      <Table
        data={state.outputData.records}
        rowKey="user"
        columns={mColumns}
        emptyText={emptyText}
        rowClassName={(record) => (address === record.user ? 'active' : '')}
      />
      <Pagination page={state.outputData.pageIndex} total={state.outputData.totalItems} onChange={onPagination} />
    </div>
  )
}

export default CompetitionRank
