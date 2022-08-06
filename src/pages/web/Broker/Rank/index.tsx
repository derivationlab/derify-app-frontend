import React, { FC, useCallback, useEffect, useState, useMemo, useContext } from 'react'
import Table from 'rc-table'
import { isEmpty } from 'lodash'
import { useTranslation } from 'react-i18next'

import { getBrokersRankList } from '@/api'
import { MobileContext } from '@/context/Mobile'

import Image from '@/components/common/Image'
import Pagination from '@/components/common/Pagination'
import { BASE_TOKEN_SYMBOL } from '@/config/tokens'
import { useConstantData } from '@/store/constant/hooks'
import { nonBigNumberInterception, safeInterceptionValues } from '@/utils/tools'

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
  const { t } = useTranslation()
  const { mobile } = useContext(MobileContext)
  const { indicator } = useConstantData()

  const [brokerList, setBrokerList] = useState<Record<string, any>>({})
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [pageIndex, setPageIndex] = useState<number>(0)

  const getBrokersListCb = useCallback(async (index = 0) => {
    setBrokerList({})
    setIsLoading(true)
    const { data } = await getBrokersRankList(index, 10)
    console.info(data)

    setBrokerList(data)
    setIsLoading(false)
  }, [])

  const onPageChangeEv = (index: number) => {
    setPageIndex(index)
    void getBrokersListCb(index)
  }

  const memoEmptyText = useMemo(() => {
    if (isLoading) return 'Loading'
    if (isEmpty(brokerList?.records)) return 'No Record'
    return ''
  }, [isLoading, brokerList?.records])

  const mobileColumns = [
    {
      title: t('Broker.RankList.Name', 'Name'),
      dataIndex: 'name',
      width: 275,
      render: (_: string, data: Record<string, any>) => <RowName data={data} />
    },
    {
      title: t('Broker.RankList.Rank', 'Rank'),
      dataIndex: 'rank',
      render: (text: string) => <RowText value={`#${text}`} />
    }
  ]

  const webColumns = [
    mobileColumns[0],
    {
      title: t('Broker.RankList.TotalRewards', 'Total Rewards'),
      dataIndex: '',
      width: 250,
      render: (_: string, data: Record<string, any>) => {
        // const accumulated_drf_reward = new BN(data?.accumulated_drf_reward ?? 0).times(indicator?.drfPrice ?? 0)
        // const rewards_plus = accumulated_drf_reward.plus(data?.accumulated_usd_reward ?? 0).toString()
        // const rewards_total = safeInterceptionValues(
        //   rewards_plus.indexOf('.') > -1 ? rewards_plus : `${rewards_plus}.0`
        // )
        const usd = String(data?.accumulated_usd_reward)
        const accumulated_usd_reward = nonBigNumberInterception(usd)
        const drf = String(data?.accumulated_drf_reward)
        const accumulated_drf_reward = nonBigNumberInterception(drf)
        return (
          <>
            <RowText value={accumulated_usd_reward} unit={BASE_TOKEN_SYMBOL} />
            <RowText value={accumulated_drf_reward} unit="DRF" />
          </>
        )
      }
    },
    {
      title: t('Broker.RankList.DailyRewards', 'Daily Rewards'),
      dataIndex: '',
      width: 250,
      render: (_: string, data: Record<string, any>) => {
        // const today_drf_reward = new BN(data?.today_drf_reward ?? 0).times(indicator?.drfPrice ?? 0)
        // const rewards_plus = today_drf_reward.plus(data?.today_usd_reward ?? 0).toString()
        // const rewards_total = safeInterceptionValues(
        //   rewards_plus.indexOf('.') > -1 ? rewards_plus : `${rewards_plus}.0`
        // )
        const usd = String(data?.today_usd_reward)
        const today_usd_reward = nonBigNumberInterception(usd)
        const drf = String(data?.today_drf_reward)
        const today_drf_reward = nonBigNumberInterception(drf)
        return (
          <>
            <RowText value={today_usd_reward} unit={BASE_TOKEN_SYMBOL} />
            <RowText value={today_drf_reward} unit="DRF" />
          </>
        )
      }
    },
    {
      title: 'Total Traders',
      dataIndex: 'traders_num',
      width: 220,
      render: (text: string) => <RowText value={text} />
    },
    mobileColumns[1]
  ]

  useEffect(() => {
    void getBrokersListCb()
  }, [])

  return (
    <div className="web-broker-rank">
      <h2>{t('Broker.RankList.BrokerRank', 'Broker Rank')}</h2>
      <Table
        className="web-broker-table"
        emptyText={memoEmptyText}
        columns={mobile ? mobileColumns : webColumns}
        data={brokerList?.records ?? []}
        rowKey="id"
      />
      <Pagination page={pageIndex} total={brokerList?.totalItems ?? 0} onChange={onPageChangeEv} />
    </div>
  )
}

export default Rank
