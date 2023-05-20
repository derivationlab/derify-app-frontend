import { isEmpty, orderBy } from 'lodash'
import Table from 'rc-table'
import { useAccount } from 'wagmi'

import React, { FC, useMemo, useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Button from '@/components/common/Button'
import BalanceShow from '@/components/common/Wallet/BalanceShow'
import { PLATFORM_TOKEN } from '@/config/tokens'
import { useAllMarginProtocol } from '@/hooks/useAllMarginProtocol'
import { useBrokerRewards } from '@/hooks/useBrokerRewards'
import { useMarginBalances } from '@/hooks/useMarginBalances'
import { usePositionRewards } from '@/hooks/usePositionRewards'
import { useTraderVariables } from '@/hooks/useTraderVariables'
import { TableMargin } from '@/pages/web/Dashboard/c/TableCol'
import { MobileContext } from '@/providers/Mobile'
import { useMarginTokenListStore } from '@/store'
import { bnDiv } from '@/utils/tools'
import Spinner from '@/components/common/Spinner'

const MySpace: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { address } = useAccount()
  const { mobile } = useContext(MobileContext)

  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)

  const { marginProtocol } = useAllMarginProtocol(marginTokenList)
  const { data: marginBalances } = useMarginBalances(address, marginTokenList)
  const { data: traderVariables } = useTraderVariables(address, marginProtocol)
  const { data: positionRewards } = usePositionRewards(address, marginProtocol)
  const { data: allBrokerRewards } = useBrokerRewards(address, marginProtocol)

  const mColumns = useMemo(() => {
    return [
      {
        title: t('Nav.MySpace.Margin'),
        dataIndex: 'symbol',
        render: (symbol: string) => {
          return <TableMargin icon={`market/${symbol.toLowerCase()}.svg`} name={symbol} />
        }
      },
      {
        title: 'Position',
        dataIndex: 'symbol',
        render: (symbol: string) => {
          return (
            <>
              <BalanceShow value={traderVariables?.[symbol] ?? 0} unit={symbol} />
            </>
          )
        }
      },
      {
        title: 'Balance/Rate',
        dataIndex: 'marginBalance',
        render: (_: string, record: Record<string, any>) => {
          const param = traderVariables?.[record.symbol] ?? 0
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
          const param = traderVariables?.[record.symbol] ?? 0
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
          return <BalanceShow value={traderVariables?.[record.symbol] ?? 0} unit={record.symbol} />
        }
      },
      {
        title: t('Nav.MySpace.PositionMiningRewards'),
        dataIndex: 'rewards1',
        width: 250,
        render: (_: Record<string, any>, record: Record<string, any>) => {
          const rewards = positionRewards?.[record.symbol] ?? 0
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
          const rewards = allBrokerRewards?.[record.symbol] ?? 0
          return (
            <>
              <BalanceShow value={rewards[record.symbol]} rule="0.00" unit={record.symbol} />
              <BalanceShow value={rewards.origin} rule="0.00" unit={PLATFORM_TOKEN.symbol} />
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
  }, [t, traderVariables, allBrokerRewards])

  const initData = useMemo(() => {
    if (marginTokenListLoaded && marginBalances) {
      const _ = marginTokenList.map((token) => {
        const marginBalance = marginBalances[token.symbol]
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
  }, [marginBalances, marginTokenListLoaded])

  const emptyText = useMemo(() => {
    if (!marginTokenListLoaded || !marginBalances) return <Spinner small />
    if (isEmpty(marginTokenList)) return t('common.NoRecord')
    return ''
  }, [t, marginBalances, marginTokenListLoaded])

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
      {/*<Pagination page={state.pageIndex} total={state.records.totalItems} onChange={pageChange} />*/}
    </div>
  )
}

export default MySpace
