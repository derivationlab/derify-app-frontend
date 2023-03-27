import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useCallback, useEffect, useReducer } from 'react'

import { bnDiv } from '@/utils/tools'
import { MobileContext } from '@/providers/Mobile'
import { useConfigInfo } from '@/store'
import { MarginTokenKeys } from '@/typings'
import { reducer, stateInit } from '@/reducers/mySpace'
import { getMySpaceMarginTokenList } from '@/api'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
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
import DecimalShow from '@/components/common/DecimalShow'

const MySpace: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { address } = useAccount()

  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)

  const { data: marginBalances, refetch: marginBalancesRefetch } = useAllMarginBalances(address)
  const { data: traderVariables, refetch: traderVariablesRefetch } = useTraderVariables(address, protocolConfig)
  const { data: allTraderRewards, refetch: allTraderRewardsRefetch } = useAllTraderRewards(address, protocolConfig)
  const { data: allBrokerRewards, refetch: allBrokerRewardsRefetch } = useAllBrokerRewards(address, protocolConfig)

  const emptyText = useMemo(() => {
    if (state.marginData.isLoaded) return 'Loading'
    if (isEmpty(state.marginData.records)) return 'No Record'
    return ''
  }, [state.marginData])

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
              <BalanceShow value={p2} unit={data.name} />
              <DecimalShow value={per} percent black />
            </>
          )
        }
      }
    ]
  }, [t])

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: t('Nav.MySpace.MarginBalanceRate'),
        dataIndex: 'symbol',
        width: 250,
        render: (symbol: string) => {
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
      },
      {
        title: t('Nav.MySpace.PositionVolume'),
        dataIndex: 'symbol',
        width: 250,
        render: (symbol: string) => {
          return <BalanceShow value={traderVariables[symbol as MarginTokenKeys]} unit={symbol} />
        }
      },
      {
        title: t('Nav.MySpace.PositionMiningRewards'),
        dataIndex: 'symbol',
        width: 250,
        render: (symbol: string) => {
          const rewards = allTraderRewards[symbol as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={rewards[symbol]} rule="0.00" unit={symbol} />
              <BalanceShow value={rewards.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.BrokerRewards'),
        dataIndex: 'symbol',
        width: 250,
        render: (symbol: string) => {
          const rewards = allBrokerRewards[symbol as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={rewards[symbol]} rule="0.00" unit={symbol} />
              <BalanceShow value={rewards.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: t('Nav.MySpace.DetailInfo'),
        dataIndex: 'Margin',
        width: 150,

        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, traderVariables, allTraderRewards, allBrokerRewards])

  const fetchData = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMySpaceMarginTokenList(address, index, 10)

        dispatch({
          type: 'SET_MARGIN_DAT',
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
    if (address) void fetchData()
  }, [address])

  useEffect(() => {
    if (address) void marginBalancesRefetch()
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
        data={state.marginData.records}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className="web-broker-table web-space-table"
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'open' : 'close')}
      />
      <Pagination page={state.pageIndex} total={state.marginData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MySpace
