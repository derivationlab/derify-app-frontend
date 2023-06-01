import classNames from 'classnames'
import { orderBy } from 'lodash'
import { useAccount } from 'wagmi'

import React, { FC, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'

import Select from '@/components/common/Form/Select'
import Image from '@/components/common/Image'
import Skeleton from '@/components/common/Skeleton'
import { useMarginBalances } from '@/hooks/useMarginBalances'
import { getMarginTokenList, useMarginTokenListStore, useMarginTokenStore } from '@/store'
import { MarginTokenState } from '@/store/types'

interface IPagination {
  data: any[]
  index: number
}

const MarginToken: FC = () => {
  const history = useHistory()
  const { t } = useTranslation()
  const { address } = useAccount()
  const [pagination, setPagination] = useState<IPagination>({ data: [], index: 0 })

  const marginToken = useMarginTokenStore((state: MarginTokenState) => state.marginToken)
  const marginTokenList = useMarginTokenListStore((state) => state.marginTokenList)
  const marginTokenListLoaded = useMarginTokenListStore((state) => state.marginTokenListLoaded)

  const { data: marginBalances } = useMarginBalances(address, marginTokenList)

  const options = useMemo(() => {
    if (pagination.data.length && marginBalances) {
      const _ = pagination.data.map((token) => {
        const marginBalance = marginBalances?.[token.symbol] ?? 0
        return {
          apy: token.max_pm_apy,
          open: token.open,
          icon: token.logo,
          value: token.symbol,
          label: token.symbol,
          marginBalance: Number(marginBalance)
        }
      })
      return orderBy(_, ['marginBalance'], 'desc')
    }
    return []
  }, [marginBalances, pagination.data])

  const _getMarginTokenList = async () => {
    const data = await getMarginTokenList(pagination.index)
    setPagination((val) => {
      return { ...val, data: [...val.data, ...(data?.records ?? [])] }
    })
  }

  useEffect(() => {
    if (marginTokenList.length) setPagination((val) => ({ ...val, data: marginTokenList }))
  }, [marginTokenList])

  useEffect(() => {
    const intersectionObserver = new IntersectionObserver(
      function (entries) {
        if (entries[0].intersectionRatio <= 0) return
        setPagination((val) => ({ ...val, index: ++pagination.index }))
      },
      { threshold: 0 }
    )

    const parent = document.querySelector('.web-trade-bench-margin')!
    const children = parent.querySelectorAll('.web-select-options-li')
    const target = children[children.length - 1]
    if (target) intersectionObserver.observe(target)
  }, [options])

  useEffect(() => {
    if (pagination.index > 0) {
      void _getMarginTokenList()
    }
  }, [pagination.index])

  return (
    <div className="web-trade-bench-margin">
      <label>{t('Trade.Bench.Margin')}</label>
      <Skeleton rowsProps={{ rows: 1 }} animation loading={!marginTokenListLoaded}>
        <Select
          filter
          value={marginToken as any}
          onChange={(v) => {
            history.push(`/${v}/trade`)
          }}
          renderer={(props) => (
            <div className={classNames('web-select-options-item', { close: !props.open })}>
              <Image src={props?.icon} />
              {props?.label}
            </div>
          )}
          className="web-trade-bench-margin-select"
          objOptions={options as any}
          labelRenderer={() => (
            <div className="web-dashboard-add-grant-margin-label">
              <Image src={marginToken.logo} />
              <span>{marginToken.symbol}</span>
            </div>
          )}
          filterPlaceholder="Search name or contract address..."
        />
      </Skeleton>
    </div>
  )
}

export default MarginToken
