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
import { getMarginTokenList } from '@/api'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { useTraderVariables, useAllBrokerRewards, useAllTraderRewards, useAllMarginBalances } from '@/hooks/useProfile'

import { TableMargin } from '@/pages/web/Dashboard/c/TableCol'
import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import BalanceShow from '@/components/common/Wallet/BalanceShow'

const MySpace: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { address } = useAccount()

  const { mobile } = useContext(MobileContext)

  const protocolConfig = useConfigInfoStore((state) => state.protocolConfig)

  const { data: marginBalances, isLoading: marginBalancesLoaded } = useAllMarginBalances(address)
  const { data: traderVariables } = useTraderVariables(address, protocolConfig)
  const { data: allTraderRewards } = useAllTraderRewards(address, protocolConfig)
  const { data: allBrokerRewards } = useAllBrokerRewards(address, protocolConfig)

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
        dataIndex: 'marginBalance',
        render: (_: string, record: Record<string, any>) => {
          const param = traderVariables[record.symbol as MarginTokenKeys]
          const percentage = Number(param) === 0 ? 0 : bnDiv(_, param)
          return (
            <>
              <BalanceShow value={_} unit={record.symbol} />
              <BalanceShow value={percentage} percent />
            </>
          )
        }
      }
    ]
  }, [t, traderVariables])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('Nav.MySpace.MarginBalanceRate'),
        dataIndex: 'marginBalance',
        width: 250,
        render: (_: string, record: Record<string, any>) => {
          const param = traderVariables[record.symbol as MarginTokenKeys]
          const percentage = Number(param) === 0 ? 0 : bnDiv(_, param)
          return (
            <>
              <BalanceShow value={_} unit={record.symbol} />
              <BalanceShow value={percentage} percent />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.PositionVolume'),
        dataIndex: 'positionVolume',
        width: 250,
        render: (_: string, record: Record<string, any>) => {
          return <BalanceShow value={traderVariables[record.symbol as MarginTokenKeys]} unit={record.symbol} />
        }
      },
      {
        title: t('Nav.MySpace.PositionMiningRewards'),
        dataIndex: 'rewards1',
        width: 250,
        render: (_: Record<string, any>, record: Record<string, any>) => {
          const rewards = allTraderRewards[record.symbol as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={rewards[record.symbol]} rule="0.00" unit={record.symbol} />
              <BalanceShow value={rewards.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.BrokerRewards'),
        dataIndex: 'rewards2',
        width: 250,
        render: (_: Record<string, any>, record: Record<string, any>) => {
          const rewards2 = allBrokerRewards[record.symbol as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={rewards2[record.symbol]} rule="0.00" unit={record.symbol} />
              <BalanceShow value={rewards2.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
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
  }, [t, traderVariables, allTraderRewards, allBrokerRewards])

  const initData = useMemo(() => {
    if (!state.records.loaded && !marginBalancesLoaded && marginBalances) {
      const _ = state.records.records.map((token) => {
        const marginBalance = marginBalances[token.symbol as MarginTokenKeys]
        return {
          apy: token.max_pm_apy,
          open: token.open,
          symbol: token.symbol,
          marginBalance
        }
      })
      return orderBy(_, ['marginBalance', 'apy'], 'desc')
    }
    return []
  }, [state.records, marginBalances, marginBalancesLoaded])

  const emptyText = useMemo(() => {
    if (state.records.loaded || marginBalancesLoaded) return t('common.Loading')
    if (isEmpty(state.records.records)) return t('common.NoRecord')
    return ''
  }, [t, state.records, marginBalancesLoaded])

  const _getMarginTokenList = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMarginTokenList(index)
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

    void _getMarginTokenList(index)
  }

  useEffect(() => {
    if (address) void _getMarginTokenList()
  }, [address])

  return (
    <div className="web-table-page">
      <header className="web-table-page-header">
        <h3>{t('Nav.MySpace.MySpace')}</h3>
      </header>
      <Table
        rowKey="symbol"
        data={initData}
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
