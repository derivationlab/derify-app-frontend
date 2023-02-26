import React, { FC } from 'react'
import classNames from 'classnames'
import numeral from 'numeral'
import dayjs from 'dayjs'

import { nonBigNumberInterception } from '@/utils/tools'
import Image from '@/components/common/Image'

interface Props {
  data: any
}

const ListItem: FC<Props> = ({ data }) => {
  return (
    <div className="web-dashboard-grant-list-item">
      <div className={classNames('web-dashboard-grant-list-item-state', String(data.State).toLocaleLowerCase())}>
        {data.State}
      </div>
      <dl>
        <dt>Margin</dt>
        <dd>
          <Image src={data.MarginIcon} />
          {data.Margin}
        </dd>
      </dl>
      <dl>
        <dt>Target</dt>
        <dd>{data.Target}</dd>
      </dl>
      <dl>
        <dt>Rewards</dt>
        <dd>{numeral(nonBigNumberInterception(data.Rewards)).format('0,0.00')}</dd>
      </dl>
      <dl>
        <dt>Start</dt>
        <dd>{dayjs(data.StartTime).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
      <dl>
        <dt>End</dt>
        <dd>{dayjs(data.EndTime).utc().format('MM/DD/YYYY HH:mm:ss')} UTC</dd>
      </dl>
    </div>
  )
}

export default ListItem
