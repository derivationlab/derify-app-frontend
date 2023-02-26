import React, { FC, useState, useMemo } from 'react'
import dayjs from 'dayjs'
import Dialog from '@/components/common/Dialog'
import Button from '@/components/common/Button'
import { Select, Input } from '@/components/common/Form'
import Image from '@/components/common/Image'
import DecimalShow from '@/components/common/DecimalShow'
import AmountInput from '@/components/common/Wallet/AmountInput'

import { formatNumber } from '@/utils/tools'

import { MarginNoAllData, TargetData } from '../mockData'

interface Props {
  visible: boolean
  onClose: () => void
}

const AddGrantDialog: FC<Props> = ({ visible, onClose }) => {
  const [isPreview, setIsPreview] = useState(false)
  const [marginType, setMarginType] = useState<string | number>('')
  const [target, setTarget] = useState<string | number>('')
  const [volume, setVolume] = useState<string>('')
  const [grantDays, setGrantDays] = useState('')
  const [cliffDays, setCliffDays] = useState('')
  const dialogTitle = !isPreview ? 'Add Grant' : 'Grant Info'

  const currMargin = useMemo(
    () => MarginNoAllData.find((item: any) => item.value === marginType) ?? MarginNoAllData[0],
    [marginType]
  )

  const currTarget = useMemo(() => (TargetData.find((item: any) => item.value === target) ?? {}).label, [target])
  return (
    <Dialog width="540px" visible={visible} title={dialogTitle} onClose={onClose}>
      {!isPreview ? (
        <>
          <div className="web-dashboard-add-grant-dialog">
            <div className="web-dashboard-add-grant-dialog-selects">
              <Select
                label="Margin"
                value={marginType}
                onChange={setMarginType}
                filter
                filterPlaceholder="serch name or contract address.."
                objOptions={MarginNoAllData}
                renderer={(item) => <MarginSelectItem data={item} />}
                labelRenderer={(item) => <MarginSelectLabel data={item} />}
              />
              <hr />
              <Select label="Target" value={target} onChange={setTarget} objOptions={TargetData} />
            </div>
            <div className="web-dashboard-add-grant-dialog-volume">
              <p>
                max: <em>0.00000000</em> DRF
              </p>
              <AmountInput title="Volume" onChange={setVolume} unit="DRF" max="100000" />
            </div>
            <div className="web-dashboard-add-grant-dialog-days">
              <section>
                <label>Grant Days</label>
                <Input type="number" value={grantDays} onChange={setGrantDays} suffix="Days" />
              </section>
              <section>
                <label>Cliff Days</label>
                <Input type="number" value={cliffDays} onChange={setCliffDays} suffix="Days" />
              </section>
            </div>
          </div>
          <Button className="web-dashboard-add-grant-dialog-confirm" onClick={() => setIsPreview(true)}>
            Add Grant
          </Button>
        </>
      ) : (
        <>
          <div className="web-dashboard-add-grant-dialog-preview">
            <dl>
              <dt>Margin</dt>
              <dd>
                <Image src={currMargin?.icon} />
                {currMargin?.label}
              </dd>
            </dl>
            <dl>
              <dt>Target</dt>
              <dd>{currTarget}</dd>
            </dl>
            <dl>
              <dt>Rewards</dt>
              <dd>{formatNumber(volume, 2, '0,0.00')} DRF</dd>
            </dl>
            <dl>
              <dt>Start</dt>
              <dd>
                {dayjs(+new Date() + Number(grantDays) * 1000 * 60 * 60 * 24)
                  .utc()
                  .format('MM/DD/YYYY HH:mm:ss')}{' '}
                UTC
              </dd>
            </dl>
            <dl>
              <dt>End</dt>
              <dd>
                {dayjs(+new Date() + Number(cliffDays) * 1000 * 60 * 60 * 24)
                  .utc()
                  .format('MM/DD/YYYY HH:mm:ss')}{' '}
                UTC
              </dd>
            </dl>
          </div>
          <Button className="web-dashboard-add-grant-dialog-confirm" onClick={() => setIsPreview(false)}>
            Confirm
          </Button>
        </>
      )}
    </Dialog>
  )
}

export default AddGrantDialog

const MarginSelectLabel: FC<{ data: any }> = ({ data }) => {
  return (
    <div className="web-dashboard-add-grant-margin-label">
      {data.icon && <Image src={data.icon} />}
      <span>{data.label}</span>
    </div>
  )
}

const MarginSelectItem: FC<{ data: any }> = ({ data }) => {
  const decimals = data.decimals || 2
  const format = `0,0.${new Array(decimals).fill('0').join('')}`
  return (
    <div className="web-dashboard-add-grant-margin-item">
      <span>
        {data.icon && <Image src={data.icon} />}
        {data.label}
      </span>
      {data.price && <DecimalShow value={formatNumber(data.price, decimals, format)} black />}
    </div>
  )
}
