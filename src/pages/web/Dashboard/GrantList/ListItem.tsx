import dayjs from 'dayjs'
import classNames from 'classnames'
import React, { FC, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GrantKeys } from '@/typings'
import { keepDecimals } from '@/utils/tools'
import { STATIC_RESOURCES_URL } from '@/config'
import { findToken, PLATFORM_TOKEN } from '@/config/tokens'
import { grantTargetOptions, grantStateOptions } from '@/reducers/addGrant'
import Image from '@/components/common/Image'

interface Props {
  data: any
}

const targetOptions = grantTargetOptions()

const grantTargetMatch: Record<string, GrantKeys> = {
  pmr: 'mining',
  rank: 'rank',
  broker_rewards: 'awards'
}

const ListItem: FC<Props> = ({ data }) => {
  const { t } = useTranslation()

  const grantState = useMemo(() => {
    const find = grantStateOptions.find((s) => s.value === data.status)
    return find?.label ?? ''
  }, [data])

  const marginToken = useMemo(() => {
    return findToken(data?.margin_token ?? '')
  }, [data])

  const grantTarget = useMemo(() => {
    return targetOptions.find((t) => t.value === grantTargetMatch[data.target])?.label
  }, [data])

  return (
    <div className="web-dashboard-grant-list-item">
      <div className={classNames('web-dashboard-grant-list-item-state', grantState.toLocaleLowerCase())}>
        {t(`NewDashboard.GrantList.${grantState}`, grantState)}
      </div>
      <dl>
        <dt>{t('NewDashboard.GrantList.Margin', 'Margin')}</dt>
        <dd>
          <Image src={`${STATIC_RESOURCES_URL}market/${marginToken?.symbol.toLowerCase()}.svg`} />
          {marginToken?.symbol}
        </dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.Target', 'Target')}</dt>
        <dd>{grantTarget}</dd>
      </dl>
      <dl>
        <dt>{t('NewDashboard.GrantList.Rewards', 'Rewards')}</dt>
        <dd>
          {keepDecimals(data.amount, PLATFORM_TOKEN.decimals, true)} {PLATFORM_TOKEN.symbol}
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
