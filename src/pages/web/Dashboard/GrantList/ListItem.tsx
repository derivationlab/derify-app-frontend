import dayjs from 'dayjs'
import classNames from 'classnames'
import React, { FC, useMemo } from 'react'

import { keepDecimals } from '@/utils/tools'
import { STATIC_RESOURCES_URL } from '@/config'
import { grantTargetOptions } from '@/reducers/addGrant'
import { grantStateOptions } from '@/reducers/grantList'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'

import Image from '@/components/common/Image'

interface Props {
  data: any
}

const targetOptions = grantTargetOptions()

const ListItem: FC<Props> = ({ data }) => {
  const state = useMemo(() => {
    const find = grantStateOptions.find((s) => s.key === data.status)
    return find?.label ?? ''
  }, [data])

  const margin = useMemo(() => {
    return findToken(data?.margin_token ?? '')
  }, [data])

  const target = useMemo(() => {
    return targetOptions.find((t) => t.key === data.target || t.nick === data.target)?.label
  }, [data])

  return (
    <div className="web-dashboard-grant-list-item">
      <div className={classNames('web-dashboard-grant-list-item-state', state.toLocaleLowerCase())}>{state}</div>
      <dl>
        <dt>Margin</dt>
        <dd>
          <Image src={`${STATIC_RESOURCES_URL}market/${margin?.symbol.toLowerCase()}.svg`} />
          {margin?.symbol}
        </dd>
      </dl>
      <dl>
        <dt>Target</dt>
        <dd>{target}</dd>
      </dl>
      <dl>
        <dt>Rewards</dt>
        <dd>{keepDecimals(data.amount, PLATFORM_TOKEN.decimals, true)}</dd>
      </dl>
      <dl>
        <dt>Start</dt>
        <dd>{dayjs(data.start_time).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
      <dl>
        <dt>End</dt>
        <dd>{dayjs(data.end_time).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
    </div>
  )
}

export default ListItem
