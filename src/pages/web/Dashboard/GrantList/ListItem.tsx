import dayjs from 'dayjs'
import classNames from 'classnames'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()
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
      <div className={classNames('web-dashboard-grant-list-item-state', state.toLocaleLowerCase())}>
        {t(`NewDashboard.GrantList.${state}`, state)}
      </div>
      <dl>
        <dt>{t('NewDashboard.GrantList.Margin', 'Margin')}</dt>
        <dd>
          <Image src={`${STATIC_RESOURCES_URL}market/${margin?.symbol.toLowerCase()}.svg`} />
          {margin?.symbol}
        </dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.Target', 'Target')}</dt>
        <dd>{target}</dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.Rewards', 'Rewards')}</dt>
        <dd>
          {keepDecimals(data.amount, PLATFORM_TOKEN.decimals, true)} {margin?.symbol}
        </dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.Start', 'Start')}</dt>
        <dd>{dayjs(data.start_time).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.End', 'End')}</dt>
        <dd>{dayjs(data.end_time).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
    </div>
  )
}

export default ListItem
