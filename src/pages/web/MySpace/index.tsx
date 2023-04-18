import Table from 'rc-table'
import { isEmpty, orderBy } from 'lodash'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useCallback, useEffect, useReducer } from 'react'

import { bnDiv } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { MarginTokenKeys } from '@/typings'
import { useConfigInfoStore } from '@/store'
import { reducer, stateInit } from '@/reducers/records'
import { getMySpaceMarginTokenList } from '@/api'
import { findToken, MARGIN_TOKENS, PLATFORM_TOKEN } from '@/config/tokens'
import {
  useTraderVariables,
  useAllBrokerRewards,
  useAllTraderRewards,
  useAllMarginBalances
} from '@/hooks/useMySpaceInfo'

import { TableMargin } from '@/pages/web/Dashboard/c/TableCol'
import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const MySpace: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { address } = useAccount()

  const protocolConfig = useConfigInfoStore((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfoStore((state) => state.protocolConfigLoaded)

  const { data: marginBalances, refetch: marginBalancesRefetch, isLoading } = useAllMarginBalances(address)
  const { data: traderVariables, refetch: traderVariablesRefetch } = useTraderVariables(address, protocolConfig)
  const { data: allTraderRewards, refetch: allTraderRewardsRefetch } = useAllTraderRewards(address, protocolConfig)
  const { data: allBrokerRewards, refetch: allBrokerRewardsRefetch } = useAllBrokerRewards(address, protocolConfig)

  const emptyText = useMemo(() => {
    if (state.records.loaded) return t('common.Loading')
    if (isEmpty(state.records.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records])

  const mColumns = useMemo(() => {
    return [
      {
        title: t('Nav.MySpace.Margin'),
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const icon = findToken(symbol).icon
          return <TableMargin icon={icon} name={symbol} />
        }
      },
      {
        title: 'Position',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          return (
            <>
              <BalanceShow value={traderVariables[symbol as MarginTokenKeys]} unit={symbol} />
            </>
          )
        }
      },
      {
        title: 'Balance/Rate',
        dataIndex: 'symbol',
        render: (symbol: string, data: Record<string, any>) => {
          const p1 = traderVariables[symbol as MarginTokenKeys]
          const p2 = marginBalances[symbol as MarginTokenKeys]
          const per = Number(p1) === 0 ? 0 : bnDiv(p2, p1)
          return (
            <>
              <BalanceShow value={p2} unit={symbol} />
              <BalanceShow value={per} percent />
            </>
          )
        }
      }
    ]
  }, [t, traderVariables, marginBalances])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('Nav.MySpace.MarginBalanceRate'),
        dataIndex: 'marginBalance',
        width: 250,
        render: (_: string, record: Record<string, any>) => {
          return (
            <>
              <BalanceShow value={_} unit={record.symbol} />
              <BalanceShow value={record.marginRate} percent />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.PositionVolume'),
        dataIndex: 'positionVolume',
        width: 250,
        render: (_: string, record: Record<string, any>) => {
          return <BalanceShow value={_} unit={record.symbol} />
        }
      },
      {
        title: t('Nav.MySpace.PositionMiningRewards'),
        dataIndex: 'rewards1',
        width: 250,
        render: (_: Record<string, any>, record: Record<string, any>) => {
          return (
            <>
              <BalanceShow value={_[record.symbol]} rule="0.00" unit={record.symbol} />
              <BalanceShow value={_.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.BrokerRewards'),
        dataIndex: 'rewards2',
        width: 250,
        render: (_: Record<string, any>, record: Record<string, any>) => {
          return (
            <>
              <BalanceShow value={_[record.symbol]} rule="0.00" unit={record.symbol} />
              <BalanceShow value={_.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.DetailInfo'),
        dataIndex: 'open',
        width: 150,
        align: 'right',
        render: (_: string, record: Record<string, any>) => {
          return (
            <Button size="medium" disabled={!_} onClick={() => history.push(`/${record.symbol}/trade`)}>
              GO
            </Button>
          )
        }
      }
    ]
  }, [t, traderVariables, marginBalances, allTraderRewards, allBrokerRewards])

  const initDAT = useMemo(() => {
    if (!state.records.loaded && !isLoading) {
      const _ = MARGIN_TOKENS.map((token) => {
        const p0 = state.records.records.find((data) => data.symbol === token.symbol)
        const p1 = traderVariables[token.symbol as MarginTokenKeys]
        const p2 = marginBalances[token.symbol as MarginTokenKeys]
        const p3 = Number(p1) === 0 ? 0 : bnDiv(p2, p1)
        const rewards1 = allTraderRewards[token.symbol as MarginTokenKeys]
        const rewards2 = allBrokerRewards[token.symbol as MarginTokenKeys]
        return {
          apy: p0?.max_pm_apy ?? 0,
          open: p0?.open ?? 0,
          symbol: token.symbol,
          rewards1,
          rewards2,
          marginRate: p3,
          marginBalance: p2,
          positionVolume: traderVariables[token.symbol as MarginTokenKeys]
        }
      })
      return orderBy(_, ['marginBalance', 'apy'], 'desc')
    }
    return []
  }, [isLoading, state.records, traderVariables, marginBalances, allBrokerRewards, allTraderRewards])

  const fetchData = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMySpaceMarginTokenList(address, index, 10)

        dispatch({
          type: 'SET_RECORDS',
          payload: { records: data?.records ?? [], totalItems: data?.totalItems ?? 0, isLoaded: false }
        })
      }
    },
    [address]
  )

  const pageChange = (index: number) => {
    dispatch({ type: 'SET_PAGE_INDEX', payload: index })

    void fetchData(index)
  }

  useEffect(() => {
    if (address) {
      void fetchData()
      void marginBalancesRefetch()
    }
  }, [address])

  useEffect(() => {
    if (address && protocolConfigLoaded && protocolConfig) {
      void traderVariablesRefetch()
      void allTraderRewardsRefetch()
      void allBrokerRewardsRefetch()
    }
  }, [address, protocolConfig, protocolConfigLoaded])

  return (
    <div className="web-table-page">
      <header className="web-table-page-header">
        <h3>{t('Nav.MySpace.MySpace')}</h3>
      </header>
      <Table
        rowKey="symbol"
        data={initDAT}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className="web-broker-table web-space-table"
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MySpace
