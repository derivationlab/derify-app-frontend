import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useAccount } from 'wagmi'
import { useHistory } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import React, { FC, useMemo, useContext, useCallback, useEffect, useReducer } from 'react'

import { bnMul } from '@/utils/tools'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { TableMargin } from '@/pages/web/Dashboard/c/TableCol'
import { MobileContext } from '@/providers/Mobile'
import { useAllBrokerRewards, useAllMarginBalances, useAllTraderRewards } from '@/hooks/useMySpaceInfo'
import { reducer, stateInit } from '@/reducers/mySpace'
import { getMySpaceMarginTokenList } from '@/api'

import Button from '@/components/common/Button'
import Pagination from '@/components/common/Pagination'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import DecimalShow from '@/components/common/DecimalShow'
import { useConfigInfo } from '@/store'
import { MarginTokenKeys } from '@/typings'

const MySpace: FC = () => {
  const [state, dispatch] = useReducer(reducer, stateInit)

  const history = useHistory()

  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { address } = useAccount()

  const protocolConfig = useConfigInfo((state) => state.protocolConfig)
  const protocolConfigLoaded = useConfigInfo((state) => state.protocolConfigLoaded)
  // console.info(protocolConfig)

  const { data: allTraderRewards, refetch: allTraderRewardsRefetch } = useAllTraderRewards(address, protocolConfig)
  const { data: allBrokerRewards, refetch: allBrokerRewardsRefetch } = useAllBrokerRewards(address, protocolConfig)

  const emptyText = useMemo(() => {
    if (state.marginData.isLoaded) return 'Loading'
    if (isEmpty(state.marginData.records)) return 'No Record'
    return ''
  }, [state.marginData])

  /**
   * margin_token: 保证金地址,
   * name: 保证金名称,
   * symbol: 保证金简称,
   * logo: 保证金logo,
   * cmc: CMC link,
   * open: 0-下架; 1-上架,
   * max_pm_apy: 最大持仓APY
   */

  const mColumns = useMemo(() => {
    return [
      {
        title: 'Margin',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          const icon = findToken(symbol).icon
          return <TableMargin icon={icon} name={symbol} />
        }
      },
      {
        title: 'Trading/Position',
        dataIndex: 'max_pm_apy',
        render: (value: number, data: Record<string, any>) => {
          const per = bnMul(value ?? 0, 100)
          return (
            <>
              <BalanceShow value={value} unit={data.name} />
              <DecimalShow value={per} percent black />
            </>
          )
        }
      },
      {
        title: 'Balance/Rate',
        dataIndex: 'max_pm_apy',
        render: (value: number, data: Record<string, any>) => {
          const per = bnMul(value ?? 0, 100)
          return (
            <>
              <BalanceShow value={value} unit={data.name} />
              <DecimalShow value={per} percent black />
            </>
          )
        }
      }
    ]
  }, [t])

  // const { data: marginBalances, refetch: marginBalancesRefetch } = useAllMarginBalances(address)

  const wColumns = useMemo(() => {
    return [
      mColumns[0],
      {
        title: 'Margin Balance/Rate',
        dataIndex: 'max_pm_apy',
        width: 250,
        render: (value: number, data: Record<string, any>) => {
          const per = bnMul(value ?? 0, 100)
          return (
            <>
              <BalanceShow value={value} unit={data.symbol} />
              <DecimalShow value={per} percent black />
            </>
          )
        }
      },
      {
        title: 'Position Volume',
        dataIndex: 'tradingVolume',
        width: 250,
        render: (value: number, data: Record<string, any>) => {
          return <BalanceShow value={value} unit={data.symbol} />
        }
      },
      {
        title: 'Position Mining Rewards',
        dataIndex: 'symbol',
        width: 250,
        render: (value: string) => {
          const base = allTraderRewards[value as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={base[value]} rule="0.00" unit={value} />
              <BalanceShow value={base.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: 'Broker Rewards',
        dataIndex: 'symbol',
        width: 250,
        render: (value: string) => {
          const base = allBrokerRewards[value as MarginTokenKeys]
          return (
            <>
              <BalanceShow value={base[value]} rule="0.00" unit={value} />
              <BalanceShow value={base.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
            </>
          )
        }
      },
      {
        title: 'Detail Info',
        dataIndex: 'Margin',
        width: 150,

        align: 'right',
        render: (_: string, data: Record<string, any>) => (
          <Button size="medium" disabled={!!data.open} onClick={() => history.push(`/${data.symbol}/trade`)}>
            GO
          </Button>
        )
      }
    ]
  }, [t, allTraderRewards, allBrokerRewards])

  const fetchData = useCallback(
    async (index = 0) => {
      if (address) {
        const { data } = await getMySpaceMarginTokenList(address, index, 9)
        console.info(data)

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

  // useEffect(() => {
  //   console.info(marginBalances)
  // }, [marginBalances])

  useEffect(() => {
    console.info(allTraderRewards)
    console.info(allBrokerRewards)
  }, [allTraderRewards, allBrokerRewards])

  // useEffect(() => {
  //   if (address) void marginBalancesRefetch()
  // }, [address])

  useEffect(() => {
    if (address && protocolConfigLoaded && protocolConfig) {
      void allTraderRewardsRefetch()
      void allBrokerRewardsRefetch()
    }
  }, [address, protocolConfig, protocolConfigLoaded])

  return (
    <div className="web-table-page">
      <header className="web-table-page-header">
        <h3>My Space</h3>
      </header>
      <Table
        rowKey="symbol"
        data={state.marginData.records}
        // @ts-ignore
        columns={mobile ? mColumns : wColumns}
        className="web-broker-table web-space-table"
        emptyText={emptyText}
        rowClassName={(record) => (!!record.open ? 'close' : 'open')}
      />
      <Pagination page={state.pageIndex} total={state.marginData.totalItems} onChange={pageChange} />
    </div>
  )
}

export default MySpace
